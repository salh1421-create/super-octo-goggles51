/**
 * مكتبة التوقيع الإلكتروني - Signature Pad
 * لتوقيع الاستمارات رقمياً
 */

class SignaturePadManager {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
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
    // ضبط حجم Canvas
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = this.options.penSize;
    this.ctx.strokeStyle = this.options.penColor;
    
    // ملء الخلفية
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setupEventListeners() {
    // الماوس
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());

    // اللمس (للأجهزة المحمولة)
    this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
    this.canvas.addEventListener('touchmove', (e) => this.draw(e));
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }

  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
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

  // التحقق من وجود توقيع
  isEmpty() {
    return this.points.length === 0;
  }

  // الحصول على التوقيع كصورة
  getSignatureImage(type = 'image/png') {
    return this.canvas.toDataURL(type);
  }

  // الحصول على التوقيع كـ Blob
  getSignatureBlob(callback, type = 'image/png', quality = 0.95) {
    this.canvas.toBlob(callback, type, quality);
  }

  // مسح التوقيع
  clear() {
    this.points = [];
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // التراجع عن آخر خط
  undo() {
    if (this.points.length > 0) {
      this.clear();
      this.points.pop();
      this.redraw();
    }
  }

  // إعادة رسم التوقيع
  redraw() {
    if (this.points.length === 0) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
      this.ctx.stroke();
    }
  }

  // حفظ التوقيع مع البيانات الوصفية
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

// دالة مساعدة لإنشاء modal التوقيع
function createSignatureModal(onSign) {
  const modalHTML = `
    <div id="signature-modal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div class="border-b pb-4 mb-4">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-signature text-emerald-600"></i>
            التوقيع الإلكتروني
          </h3>
          <p class="text-xs text-slate-500 mt-1">وقع على الاستمارة برسم توقيعك في المربع أدناه</p>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-slate-300">
          <canvas id="signature-canvas" 
            class="w-full border-2 border-slate-200 rounded-lg bg-white cursor-crosshair"
            style="height: 250px; display: block;">
          </canvas>
        </div>

        <div class="flex gap-2 mt-4 flex-wrap">
          <button onclick="document.getElementById('signature-pad').undo()" 
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1">
            <i class="fa-solid fa-arrow-rotate-left"></i> تراجع
          </button>
          <button onclick="document.getElementById('signature-pad').clear()" 
            class="px-4 py-2 bg-red-200 hover:bg-red-300 text-red-700 rounded-lg font-bold text-xs flex items-center gap-1">
            <i class="fa-solid fa-trash"></i> مسح
          </button>
          <div class="flex-1"></div>
          <button onclick="closeSignatureModal()" 
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs">
            إلغاء
          </button>
          <button onclick="saveSignature('${onSign}')" 
            class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1">
            <i class="fa-solid fa-check"></i> حفظ التوقيع
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // تخزين معرف التوقيع للوصول إليه لاحقاً
  window.signaturePad = new SignaturePadManager('signature-canvas');
  window.onSignCallback = onSign;
}

function closeSignatureModal() {
  const modal = document.getElementById('signature-modal');
  if (modal) modal.remove();
  if (window.signaturePad) {
    window.signaturePad = null;
  }
}

function saveSignature(callback) {
  if (window.signaturePad.isEmpty()) {
    alert('⚠️ يرجى التوقيع قبل الحفظ');
    return;
  }

  const signature = window.signaturePad.saveSignatureWithMetadata(
    document.getElementById('current-user-display')?.textContent || 'العضو'
  );

  // تنفيذ دالة callback مع بيانات التوقيع
  if (callback && window[callback]) {
    window[callback](signature);
  }

  closeSignatureModal();
}
