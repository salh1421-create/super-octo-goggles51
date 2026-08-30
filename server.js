const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'reports.json');

// جلب التقارير المحفوظة في مساحة المشروع
app.get('/api/reports', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.json([]);
  }
});

// حفظ وتحديث التقارير والتوقيعات داخل ملف المشروع
app.post('/api/reports', (req, res) => {
  const newReport = req.body;
  let reports = [];
  
  if (fs.existsSync(DATA_FILE)) {
    try {
      reports = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
      reports = [];
    }
  }

  const index = reports.findIndex(r => r.id === newReport.id);
  if (index !== -1) {
    reports[index] = newReport; // تحديث التقرير (مثل إضافة توقيع مقدم الدعم)
  } else {
    reports.unshift(newReport); // إضافة تقرير جديد
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), 'utf8');
  res.json({ success: true, message: 'تم حفظ وتحديث التقرير داخل المشروع بنجاح' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل بنجاح على المنفذ ${PORT}`);
});