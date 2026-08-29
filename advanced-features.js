/**
 * خصائص متقدمة: التوقيع الإلكتروني + مشاركة WhatsApp + الحفظ المتقدم
 */

// ============================================
// 1️⃣  مكتبة التوقيع الإلكتروني
// ============================================
class SignaturePadManager {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.points = [];
    this.options = {
      penColor: options.penColor || '#1e293b',
      penSize: options.penSize || 2,
      backgroundColor: options.backgroundColor || '#ffffff',
      ...options
    };
    this.initCanvas();
    this.setupEventListeners();
  }

  initCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = this.options.penSize;
    this.ctx.strokeStyle = this.options.penColor;
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
    this.canvas.addEventListener('touchmove', (e) => this.draw(e));
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }

  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  startDrawing(e) {
    e.preventDefault();
    this.isDrawing = true;
    const coords = this.getCoordinates(e);
    this.points = [coords];
    this.ctx.beginPath();
    this.ctx.moveTo(coords.x, coords.y);
  }

  draw(e) {
    if (!this.isDrawing) return;
    e.preventDefault();
    const coords = this.getCoordinates(e);
    this.points.push(coords);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
  }

  stopDrawing() {
    this.isDrawing = false;
    this.ctx.closePath();
  }

  isEmpty() {
    return this.points.length === 0;
  }

  getSignatureImage(type = 'image/png') {
    return this.canvas.toDataURL(type);
  }

  clear() {
    this.points = [];
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  undo() {
    if (this.points.length > 0) {
      this.clear();
      this.points.pop();
      this.redraw();
    }
  }

  redraw() {
    if (this.points.length === 0) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
      this.ctx.stroke();
    }
  }

  saveSignatureWithMetadata(signer) {
    return {
      image: this.getSignatureImage(),
      signer: signer,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('ar-SA'),
      time: new Date().toLocaleTimeString('ar-SA')
    };
  }
}

// دالة فتح نافذة التوقيع
window.openSignatureModal = function(onSignCallback) {
  const modalHTML = `
    <div id="signature-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div class="border-b pb-4 mb-4">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-pen-fancy text-emerald-600"></i>
            التوقيع الإلكتروني
          </h3>
          <p class="text-xs text-slate-500 mt-1">وقّع على الاستمارة برسم توقيعك في المربع أدناه</p>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-slate-300 mb-4">
          <canvas id="signature-canvas" 
            class="w-full border-2 border-slate-200 rounded-lg bg-white cursor-crosshair"
            style="height: 250px; display: block;">
          </canvas>
        </div>

        <div class="flex gap-2 flex-wrap">
          <button onclick="document.getElementById('signature-pad-manager').undo()" 
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1">
            <i class="fa-solid fa-arrow-rotate-left"></i> تراجع
          </button>
          <button onclick="document.getElementById('signature-pad-manager').clear()" 
            class="px-4 py-2 bg-red-200 hover:bg-red-300 text-red-700 rounded-lg font-bold text-xs flex items-center gap-1">
            <i class="fa-solid fa-trash"></i> مسح
          </button>
          <div class="flex-1"></div>
          <button onclick="window.closeSignatureModal()" 
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs">
            إلغاء
          </button>
          <button onclick="window.confirmSignature('${onSignCallback}')" 
            class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1">
            <i class="fa-solid fa-check"></i> حفظ التوقيع
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  window.signaturePadManager = new SignaturePadManager('signature-canvas');
  window.onSignCallback = onSignCallback;
};

window.closeSignatureModal = function() {
  const modal = document.getElementById('signature-modal');
  if (modal) modal.remove();
  window.signaturePadManager = null;
};

window.confirmSignature = function(callback) {
  if (window.signaturePadManager.isEmpty()) {
    alert('⚠️ يرجى التوقيع قبل الحفظ');
    return;
  }

  const signature = window.signaturePadManager.saveSignatureWithMetadata(
    document.getElementById('current-user-display')?.textContent || 'العضو'
  );

  window.closeSignatureModal();
  
  if (callback && window[callback]) {
    window[callback](signature);
  }
};

// ============================================
// 2️⃣  مكتبة مشاركة WhatsApp
// ============================================
class WhatsAppShare {
  constructor(options = {}) {
    this.apiUrl = 'https://wa.me/';
    this.options = {
      phoneNumber: options.phoneNumber || '',
      countryCode: options.countryCode || '966',
      ...options
    };
  }

  formatPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith(this.options.countryCode)) {
      if (cleaned.startsWith('0')) {
        cleaned = this.options.countryCode + cleaned.substring(1);
      } else if (cleaned.length === 9) {
        cleaned = this.options.countryCode + cleaned;
      }
    }
    return cleaned;
  }

  createFormMessage(formData) {
    const message = `
📋 *استمارة التغذية الراجعة* 📋

*البيانات الأساسية:*
📍 المدرسة: ${formData.schoolName || '---'}
📊 المرحلة: ${formData.schoolStage || '---'}
👥 الفئة: ${formData.schoolGender || '---'}
📅 تاريخ الزيارة: ${formData.visitDate || '---'}

*مقدم الدعم:*
👤 الاسم: ${formData.providerName || '---'}
✅ الحضور: ${formData.providerPresent || '---'}

*مستويات الأداء:*
🎯 الأداء العام: ${formData.overallLevel || '---'}
📈 النسبة: ${formData.overallScore || '---'}

⏰ ${new Date().toLocaleString('ar-SA')}
    `.trim();
    return message;
  }

  shareViaWhatsApp(phoneNumber, message) {
    const phone = this.formatPhoneNumber(phoneNumber);
    if (!phone) {
      alert('⚠️ يرجى إدخال رقم الهاتف الصحيح');
      return false;
    }
    const encodedMessage = encodeURIComponent(message);
    const url = `${this.apiUrl}${phone}?text=${encodedMessage}`;
    window.open(url, '_blank');
    return true;
  }

  sendFormViaWhatsApp(formData, phoneNumber) {
    const message = this.createFormMessage(formData);
    return this.shareViaWhatsApp(phoneNumber, message);
  }

  openRecipientModal(formData) {
    const modal = document.createElement('div');
    modal.id = 'whatsapp-recipient-modal';
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div class="border-b pb-4 mb-4">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-brands fa-whatsapp text-green-500"></i>
            إرسال عبر WhatsApp
          </h3>
          <p class="text-xs text-slate-500 mt-1">شارك بيانات الاستمارة عبر رسالة فورية</p>
        </div>

        <div class="space-y-3 mb-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">💬 رقم الهاتف:</label>
            <input type="tel" id="whatsapp-phone" 
              placeholder="مثال: 0501234567" 
              class="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none">
          </div>
        </div>

        <div class="flex gap-2">
          <button onclick="window.closeWhatsAppModal()" 
            class="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs">
            إلغاء
          </button>
          <button onclick="window.confirmWhatsAppShare()" 
            class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1">
            <i class="fa-brands fa-whatsapp"></i> إرسال
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    window.currentFormDataForWhatsApp = formData;
    window.whatsAppShareInstance = new WhatsAppShare();
  }
}

window.closeWhatsAppModal = function() {
  const modal = document.getElementById('whatsapp-recipient-modal');
  if (modal) modal.remove();
};

window.confirmWhatsAppShare = function() {
  const phone = document.getElementById('whatsapp-phone').value;
  if (!phone) {
    alert('⚠️ يرجى إدخال رقم الهاتف');
    return;
  }
  if (window.whatsAppShareInstance && window.currentFormDataForWhatsApp) {
    window.whatsAppShareInstance.sendFormViaWhatsApp(window.currentFormDataForWhatsApp, phone);
    window.closeWhatsAppModal();
    alert('✅ تم فتح WhatsApp - الرسالة جاهزة للإرسال');
  }
};

window.openWhatsAppShare = function(formData) {
  const whatsapp = new WhatsAppShare();
  whatsapp.openRecipientModal(formData);
};

// ============================================
// 3️⃣  نظام الحفظ المتقدم
// ============================================
class AdvancedSaveManager {
  static saveFormWithSignature(formData, signature) {
    // دمج التوقيع مع بيانات النموذج
    const completeData = {
      ...formData,
      signature: signature.image,
      signedBy: signature.signer,
      signedAt: signature.timestamp,
      signatureDate: signature.date,
      signatureTime: signature.time,
      status: 'موقع',
      approvalDate: new Date().toLocaleDateString('ar-SA'),
      approvalTime: new Date().toLocaleTimeString('ar-SA')
    };

    // حفظ في localStorage
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const reportId = 'RPT-' + Date.now();
    completeData.id = reportId;
    completeData.createdAt = new Date().toISOString();

    reports.push(completeData);
    localStorage.setItem('reports', JSON.stringify(reports));

    return { success: true, reportId, data: completeData };
  }

  static exportFormAsJSON(formData) {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-${Date.now()}.json`;
    link.click();
  }

  static getFormData() {
    return {
      schoolName: document.getElementById('school-name')?.value || '',
      schoolStage: document.getElementById('school-stage')?.value || '',
      schoolGender: document.getElementById('school-gender')?.value || '',
      visitDate: document.getElementById('visit-date')?.value || '',
      providerName: document.getElementById('provider-name')?.value || '',
      providerPresent: document.getElementById('provider-present')?.value || '',
      supportType: document.getElementById('support-type')?.value || '',
      overallLevel: document.getElementById('overall-level')?.value || '',
      overallScore: document.getElementById('overall-score')?.value || '',
      outcomesLevel: document.getElementById('outcomes-level')?.value || '',
      outcomesScore: document.getElementById('outcomes-score')?.value || '',
      term: document.getElementById('term')?.value || '',
      academicYear: document.getElementById('academic-year')?.value || '',
      challenges: document.getElementById('challenges')?.value || '',
      strengths: document.getElementById('strengths')?.value || '',
      feedback: document.getElementById('feedback')?.value || '',
      devNeeds: document.getElementById('dev-needs')?.value || ''
    };
  }
}

// دوال مساعدة عالمية
window.openSignAndShare = function() {
  window.openSignatureModal('handleSignedForm');
};

window.handleSignedForm = function(signature) {
  const formData = AdvancedSaveManager.getFormData();
  const result = AdvancedSaveManager.saveFormWithSignature(formData, signature);
  
  if (result.success) {
    alert(`✅ تم حفظ التقرير برقم: ${result.reportId}\n📝 التقرير موقع بنجاح`);
    // يمكن إضافة خيار المشاركة هنا
    setTimeout(() => {
      const share = confirm('هل تريد مشاركة الاستمارة عبر WhatsApp؟');
      if (share) {
        window.openWhatsAppShare(formData);
      }
    }, 500);
  }
};
