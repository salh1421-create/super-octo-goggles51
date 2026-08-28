// assets/app.js
// سكريبت إدارة واجهة التطبيق، حفظ الإعدادات، وإرسال الاستمارة عبر واتساب مع رفعها إلى GitHub كمقترح أفضل (فرع + PR)

const REPO_OWNER = 'salh1421-create';
const REPO_NAME = 'super-octo-goggles51';

document.addEventListener('DOMContentLoaded', () => {
  // عناصر الواجهة
  const loginModal = document.getElementById('login-modal');
  const mainApp = document.getElementById('main-app');
  const loginForm = document.getElementById('login-form');
  const currentUserDisplay = document.getElementById('current-user-display');

  const btnNavList = document.getElementById('btn-nav-list');
  const btnNewReport = document.getElementById('btn-new-report');
  const btnNavAnalytics = document.getElementById('btn-nav-analytics');

  const waModal = document.getElementById('whatsapp-modal');
  const waSend = document.getElementById('wa-send');
  const waCancel = document.getElementById('wa-cancel');
  const waPhone = document.getElementById('wa-phone');
  const waMessage = document.getElementById('wa-message');

  const settingsModal = document.getElementById('settings-modal');
  const btnSettings = document.getElementById('btn-settings');
  const settingsClose = document.getElementById('settings-close');
  const settingsSave = document.getElementById('settings-save');
  const githubTokenInput = document.getElementById('github-token');
  const signatureFileInput = document.getElementById('signature-file');
  const statLeaderSignatureImg = document.getElementById('stat-leader-signature-img');

  // أقسام
  const sections = ['analytics-section','list-section','form-section','preview-section','analytics-print-preview-section'];
  function showSection(id) {
    sections.forEach(s => {
      const el = document.getElementById(s);
      if (!el) return;
      if (s === id) el.classList.remove('hidden'); else el.classList.add('hidden');
    });
  }

  // تعامل تسجيل الدخول البسيط (محلي فقط)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    // لا نعالج كلمة المرور هنا — هذه واجهة محلية
    currentUserDisplay.textContent = user;
    loginModal.classList.add('hidden');
    mainApp.classList.remove('hidden');
    showSection('list-section');
    loadSavedSignature();
  });

  // أزرار التنقل
  btnNavList.addEventListener('click', () => showSection('list-section'));
  if (btnNewReport) btnNewReport.addEventListener('click', () => { showSection('form-section'); resetForm(); });
  if (btnNavAnalytics) btnNavAnalytics.addEventListener('click', () => { showSection('analytics-section'); renderAnalyticsDashboard(); });

  // إعدادات
  btnSettings.addEventListener('click', () => { settingsModal.classList.remove('hidden'); });
  settingsClose.addEventListener('click', () => { settingsModal.classList.add('hidden'); });

  settingsSave.addEventListener('click', async () => {
    // نخزن التوكن في sessionStorage (أفضل من localStorage من ناحية الأمان)
    const token = githubTokenInput.value.trim();
    if (token) sessionStorage.setItem('github_token', token);
    // معالجة ملف التوقيع لو تم رفعه
    const file = signatureFileInput.files && signatureFileInput.files[0];
    if (file) {
      const dataUrl = await fileToDataURL(file);
      sessionStorage.setItem('leader_signature_dataurl', dataUrl);
      if (statLeaderSignatureImg) statLeaderSignatureImg.src = dataUrl;
    }
    settingsModal.classList.add('hidden');
    alert('تم حفظ الإعدادات محلياً في هذه الجلسة.');
  });

  function loadSavedSignature() {
    const dataUrl = sessionStorage.getItem('leader_signature_dataurl');
    if (dataUrl && statLeaderSignatureImg) statLeaderSignatureImg.src = dataUrl;
  }

  waCancel.addEventListener('click', () => { waModal.classList.add('hidden'); });
  waSend.addEventListener('click', async () => {
    const phone = waPhone.value.trim();
    const message = waMessage.value.trim();
    if (!phone) { alert('رجاءً أدخل رقم الجوال لإرسال الرسالة'); return; }

    // توليد PDF من المنطقة المطبوعة وإرساله للـ GitHub ثم فتح واتساب
    try {
      waSend.disabled = true;
      waSend.textContent = 'جاري التحضير...';
      // توليد ملف PDF
      const pdfBlob = await window.PrintHelper.generatePdfBlob('#printable-area');

      // بناء اسم الملف ومساره
      const timestamp = new Date().toISOString().replace(/[:.]/g,'-');
      const filename = `report-${timestamp}.pdf`;
      const path = `signed-forms/${phone}/${filename}`;

      // ا��حصول على التوكن من الجلسة
      const token = sessionStorage.getItem('github_token');
      if (!token) {
        if (!confirm('رمز الوصول إلى GitHub غير محفوظ. هل تريد حفظه الآن في إعدادات (سيُخزن مؤقتاً في هذه الجلسة)؟')) {
          // نفتح واتساب مع رسالة تحذيرية فقط
          const text = encodeURIComponent(message + '\n\nالملف لم يُرفع لأنه لا يوجد رمز وصول محفوظ.');
          window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
          waModal.classList.add('hidden');
          return;
        } else {
          settingsModal.classList.remove('hidden');
          return;
        }
      }

      // ارفع الملف إلى المستودع على فرع جديد وأنشئ PR
      const uploadResult = await uploadFileToGitHub(pdfBlob, path, token);
      if (!uploadResult || !uploadResult.branch) throw new Error('فشل الرفع');

      // رابط الملف الخام على الفرع الجديد
      const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${uploadResult.branch}/${encodeURI(path)}`;

      // افتح واتساب مع النص والرابط
      const fullMessage = `${message}\n\nرابط الاستمارة: ${rawUrl}\n
رجاءً قم بالتوقيع إلكترونياً (إن أمكن) وإعادة إرسال الملف الموقّع.`;
      const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
      window.open(waLink, '_blank');

      alert('تم رفع الاستمارة وإنشاء طلب سحب (PR). تم فتح واتساب لإرسال الرسالة.');
      waModal.classList.add('hidden');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء التحضير أو الرفع: ' + (err.message || err));
    } finally {
      waSend.disabled = false;
      waSend.textContent = 'إرسال عبر واتساب';
    }
  });

  // دوال مساعدة
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function uploadFileToGitHub(blob, path, token) {
    // نستخدم API لرفع الملف على فرع جديد ثم نفتح PR
    const branchName = `signed-forms/upload-${Date.now()}`;

    // الحصول على محتوى base64
    const arrayBuffer = await blob.arrayBuffer();
    const base64String = arrayBufferToBase64(arrayBuffer);

    // أولاً: الحصول على default branch للمستودع
    const repoResp = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`);
    if (!repoResp.ok) throw new Error('فشل جلب بيانات المستودع');
    const repoData = await repoResp.json();
    const defaultBranch = repoData.default_branch || 'main';

    // ثانياً: إنشاء/رفع الملف على فرع جديد (PUT contents مع branch غير موجود => سينشأ من default branch)
    const putUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(path)}`;
    const putBody = {
      message: `Add signed form ${path}`,
      content: base64String,
      branch: branchName
    };
    const putResp = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(putBody)
    });
    if (!putResp.ok) {
      const errText = await putResp.text();
      throw new Error('فشل رفع الملف: ' + errText);
    }
    const putData = await putResp.json();

    // ثالثاً: إنشاء PR من الفرع الجديد إلى default branch
    const prTitle = `Add signed form ${path}`;
    const prBody = `نموذج مرفوع تلقائياً بواسطة منظومة تقارير دعم التميز — الرجاء مراجعة وتأكيد الحفظ.`;
    const prResp = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({ title: prTitle, head: branchName, base: defaultBranch, body: prBody })
    });
    if (!prResp.ok) {
      const errText = await prResp.text();
      // PR فشل، نُرجع بيانات الرفع على أية حال
      return { branch: branchName, upload: putData, pr: null, error: errText };
    }
    const prData = await prResp.json();
    return { branch: branchName, upload: putData, pr: prData };
  }

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  // إضافة دعم زر إرسال الواتساب في واجهة التقرير (يمكنك ربطه لاحقاً بأي زر)
  // مثال: عند الضغط على زر في صفحة المعاينة سيتم فتح المودال
  const exampleSendButtons = document.querySelectorAll('[data-action="send-wa"]');
  exampleSendButtons.forEach(b => b.addEventListener('click', () => waModal.classList.remove('hidden')));

  // حماية عند مغادرة الصفحة إذا هناك نموذج غير محفوظ
  window.addEventListener('beforeunload', (e) => {
    const editing = !!document.getElementById('report-form') && !document.getElementById('report-form').classList.contains('saved');
    if (editing) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // وظائف تجريبية / مساعدة
  window.renderAnalyticsDashboard = function() { /* placeholder - يتم ترقيتها لاحقاً */ };
  window.resetForm = function() { const f = document.getElementById('report-form'); if (f) f.reset(); };

  // تحميل توقيع من الجلسة عند البدء
  loadSavedSignature();
});
