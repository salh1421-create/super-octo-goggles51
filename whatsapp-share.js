/**
 * خاصية مشاركة الاستمارات عبر WhatsApp
 * مع دعم إرسال نسخة PDF والبيانات
 */

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
📊 المرحلة: ${formData.stage || '---'}
👥 ا��فئة: ${formData.gender || '---'}
📅 تاريخ الزيارة: ${formData.visitDate || '---'}

*بيانات مقدم الدعم:*
👤 الاسم: ${formData.providerName || '---'}
✅ الحضور: ${formData.providerPresent || '---'}

*مستويات الأداء:*
🎯 مستوى الأداء العام: ${formData.overallLevel || '---'}
📈 نسبة الأداء: ${formData.overallScore || '---'}

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

  createWhatsAppLink(phoneNumber, message) {
    const phone = this.formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    return `${this.apiUrl}${phone}?text=${encodedMessage}`;
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
          <p class="text-xs text-slate-500 mt-1">شارك الاستمارة عبر رسالة فورية</p>
        </div>

        <div class="space-y-3 mb-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">💬 رقم الهاتف:</label>
            <input type="tel" id="whatsapp-phone" 
              placeholder="مثال: 0501234567 أو +966501234567" 
              class="w-full border rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none">
          </div>

          <div class="bg-green-50 p-3 rounded-lg border border-green-200">
            <p class="text-xs text-slate-600 mb-2 font-bold">👥 جهات شائعة:</p>
            <div class="space-y-1.5">
              <button onclick="window.setWhatsAppNumber('966501234567')" 
                class="w-full text-right px-3 py-2 bg-white border rounded hover:bg-green-50 text-xs font-bold text-slate-700">
                👤 رئيس الفريق
              </button>
              <button onclick="window.setWhatsAppNumber('966502345678')" 
                class="w-full text-right px-3 py-2 bg-white border rounded hover:bg-green-50 text-xs font-bold text-slate-700">
                📞 المشرف التربوي
              </button>
              <button onclick="window.setWhatsAppNumber('966503456789')" 
                class="w-full text-right px-3 py-2 bg-white border rounded hover:bg-green-50 text-xs font-bold text-slate-700">
                ✉️ مكتب المتابعة
              </button>
            </div>
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

// دوال عامة
window.setWhatsAppNumber = function(phone) {
  const input = document.getElementById('whatsapp-phone');
  if (input) input.value = phone;
};

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
