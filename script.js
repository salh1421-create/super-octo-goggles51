// ====== متغيرات عامة ======
let currentUser = null;
let allReports = [];
let allSchools = [];
let executiveMembers = [];
let supportProviders = [];

// ====== تهيئة التطبيق ======
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
});

function initializeApp() {
  loadDataFromLocalStorage();
  loadSampleData();
  setupFormHandlers();
}

function setupEventListeners() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const reportForm = document.getElementById('report-form');
  if (reportForm) {
    reportForm.addEventListener('submit', handleReportSubmit);
  }
}

// ====== تحميل البيانات ======
function loadDataFromLocalStorage() {
  const stored = localStorage.getItem('schoolReportsData');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      allReports = data.reports || [];
      allSchools = data.schools || [];
      executiveMembers = data.members || [];
      supportProviders = data.providers || [];
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }
}

function loadSampleData() {
  if (allSchools.length === 0) {
    // بيانات العينة للمدارس
    allSchools = [
      { id: 1, name: "ابتدائية النور", stage: "ابتدائي", gender: "بنين", level: "التقدم", provider: "صالح بن عوض فاضي الحربي" },
      { id: 2, name: "ابتدائية النجاح", stage: "ابتدائي", gender: "بنات", level: "التميز", provider: "أنس بن ناجي رشيد الرحيلي" },
      { id: 3, name: "متوسطة الإمام", stage: "متوسط", gender: "بنين", level: "الانطلاق", provider: "شكري بن أحمد خجا بخاري" },
      { id: 4, name: "متوسطة الفرح", stage: "متوسط", gender: "بنات", level: "التقدم", provider: "بدرية بنت علي حسين الفريدي" },
      { id: 5, name: "ثانوية الشرق", stage: "ثانوي", gender: "بنين", level: "التميز", provider: "ريم بنت عبدالله حمد السحيمي" },
      { id: 6, name: "ثانوية الغرب", stage: "ثانوي", gender: "بنات", level: "التقدم", provider: "هدى بنت نويع عائض الحربي" },
      { id: 7, name: "روضة الزهراء", stage: "ابتدائي", gender: "بنات", level: "الانطلاق", provider: "صالح بن عوض فاضي الحربي" },
      { id: 8, name: "ابتدائية التفوق", stage: "ابتدائي", gender: "بنين", level: "التميز", provider: "أنس بن ناجي رشيد الرحيلي" },
    ];
  }

  if (executiveMembers.length === 0) {
    executiveMembers = [
      { name: "د. عائشة بنت جميعان الجهني", role: "رئيس", signature: "" },
      { name: "صالح بن عوض فاضي الحربي", role: "عضو", signature: "" },
      { name: "أنس بن ناجي رشيد الرحيلي", role: "عضو", signature: "" },
      { name: "شكري بن أحمد خجا بخاري", role: "عضو", signature: "" },
      { name: "بدرية بنت علي حسين الفريدي", role: "عضو", signature: "" },
      { name: "ريم بنت عبدالله حمد السحيمي", role: "عضو", signature: "" },
      { name: "هدى بنت نويع عائض الحربي", role: "عضو", signature: "" },
    ];
  }

  if (supportProviders.length === 0) {
    supportProviders = [
      "صالح بن عوض فاضي الحربي",
      "أنس بن ناجي رشيد الرحيلي",
      "شكري بن أحمد خجا بخاري",
      "بدرية بنت علي حسين الفريدي",
      "ريم بنت عبدالله حمد السحيمي",
      "هدى بنت نويع عائض الحربي",
    ];
  }

  saveDataToLocalStorage();
  populateSchoolSelects();
}

function saveDataToLocalStorage() {
  const data = {
    reports: allReports,
    schools: allSchools,
    members: executiveMembers,
    providers: supportProviders,
    lastSaved: new Date().toISOString()
  };
  localStorage.setItem('schoolReportsData', JSON.stringify(data));
}

// ====== المصادقة والدخول ======
function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('login-user').value;
  const password = document.getElementById('login-pass').value;
  
  if (password === '123456' && username) {
    currentUser = username;
    document.getElementById('current-user-display').textContent = username;
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    // إظهار زر الإحصائيات للرئيس فقط
    if (username === 'د. عائشة بنت جميعان الجهني') {
      document.getElementById('btn-nav-analytics').classList.remove('hidden');
    }
    
    loadMemberDashboard();
  } else {
    alert('بيانات دخول غير صحيحة');
  }
}

function logout() {
  if (confirm('هل تريد الخروج من المنظومة؟')) {
    currentUser = null;
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('login-form').reset();
  }
}

// ====== التنقل بين الأقسام ======
function showSection(sectionId) {
  const sections = [
    'analytics-section',
    'analytics-print-preview-section',
    'list-section',
    'form-section',
    'preview-section'
  ];
  
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
}

// ====== ملء الاختيارات المتاحة ======
function populateSchoolSelects() {
  const select = document.getElementById('auto-school-select');
  if (select) {
    select.innerHTML = '<option value="">-- اختر المدرسة من قائمة إسناد قطاع العوالي --</option>';
    allSchools.forEach(school => {
      const option = document.createElement('option');
      option.value = school.id;
      option.textContent = `${school.name} (${school.stage} - ${school.gender})`;
      select.appendChild(option);
    });
  }
}

// ====== معالجة اختيار المدرسة ======
function onSchoolSelected(schoolId) {
  if (!schoolId) return;
  
  const school = allSchools.find(s => s.id == schoolId);
  if (school) {
    document.getElementById('school-name').value = school.name;
    document.getElementById('school-stage').value = school.stage;
    document.getElementById('school-gender').value = school.gender;
    document.getElementById('provider-name').value = school.provider || '';
    document.getElementById('overall-level').value = school.level || 'التقدم';
  }
}

// ====== معالجة النماذج ======
function setupFormHandlers() {
  const termSelect = document.getElementById('term');
  const weekSelect = document.getElementById('visit-week');
  const daySelect = document.getElementById('visit-day');
  
  if (weekSelect) weekSelect.addEventListener('change', updateVisitDateFromSchedule);
  if (daySelect) daySelect.addEventListener('change', updateVisitDateFromSchedule);
}

function updateVisitDateFromSchedule() {
  const week = document.getElementById('visit-week')?.value || '';
  const day = document.getElementById('visit-day')?.value || '';
  
  // حساب التاريخ بناءً على الأسبوع واليوم
  let dateStr = '';
  
  // في الواقع يجب أن يكون هناك جدول للتواريخ، لكن للعينة سنستخدم تاريخ ثابت
  const weekNum = parseInt(week.match(/\d+/)?.[0] || '11');
  const dayOffset = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].indexOf(day);
  
  // تاريخ افتراضي للعينة
  if (week && day) {
    dateStr = `${28 + dayOffset + (weekNum - 11) * 7} جمادى الأولى 1448`;
  }
  
  if (document.getElementById('visit-date')) {
    document.getElementById('visit-date').value = dateStr;
  }
}

function handleReportSubmit(e) {
  e.preventDefault();
  
  // جمع بيانات النموذج
  const reportData = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    executiveMember: currentUser,
    schoolName: document.getElementById('school-name').value,
    schoolStage: document.getElementById('school-stage').value,
    schoolGender: document.getElementById('school-gender').value,
    term: document.getElementById('term').value,
    academicYear: document.getElementById('academic-year').value,
    visitNum: document.getElementById('visit-num').value,
    visitDate: document.getElementById('visit-date').value,
    visitWeek: document.getElementById('visit-week').value,
    visitDay: document.getElementById('visit-day').value,
    providerPresent: document.getElementById('provider-present').value,
    providerName: document.getElementById('provider-name').value,
    supportType: document.getElementById('support-type').value,
    weeklyReport: document.getElementById('weekly-report').value,
    supportAreas: {
      teaching: document.getElementById('sup-area-teach')?.checked || false,
      outcomes: document.getElementById('sup-area-outcomes')?.checked || false,
      guidance: document.getElementById('sup-area-guidance')?.checked || false,
      activities: document.getElementById('sup-area-activities')?.checked || false
    },
    evaluation: {
      type: document.getElementById('eval-type').value,
      overallLevel: document.getElementById('overall-level').value,
      overallScore: document.getElementById('overall-score').value,
      outcomesLevel: document.getElementById('outcomes-level').value,
      outcomesScore: document.getElementById('outcomes-score').value
    },
    practices: {
      prac1: {
        grade: document.getElementById('prac-1-grade').value,
        note: document.getElementById('prac-1-note').value
      },
      prac2: {
        grade: document.getElementById('prac-2-grade').value,
        note: document.getElementById('prac-2-note').value
      },
      prac3: {
        grade: document.getElementById('prac-3-grade').value,
        note: document.getElementById('prac-3-note').value
      }
    },
    services: {
      sup1: {
        grade: document.getElementById('sup-1-grade').value,
        note: document.getElementById('sup-1-note').value
      },
      sup2: {
        grade: document.getElementById('sup-2-grade').value,
        note: document.getElementById('sup-2-note').value
      },
      sup3: {
        grade: document.getElementById('sup-3-grade').value,
        note: document.getElementById('sup-3-note').value
      },
      sup4: {
        grade: document.getElementById('sup-4-grade').value,
        note: document.getElementById('sup-4-note').value
      }
    },
    competencies: {
      responsibility: document.getElementById('comp-1').value,
      teamwork: document.getElementById('comp-2').value,
      flexibility: document.getElementById('comp-3').value,
      initiative: document.getElementById('comp-4').value
    },
    textFields: {
      challenges: document.getElementById('challenges').value,
      strengths: document.getElementById('strengths').value,
      feedback: document.getElementById('feedback').value,
      devNeeds: document.getElementById('dev-needs').value
    }
  };
  
  // حفظ التقرير
  allReports.push(reportData);
  saveDataToLocalStorage();
  
  // الانتقال لمعاينة التقرير
  populatePreviewDocument(reportData);
  showSection('preview-section');
  
  alert('تم حفظ التقرير بنجاح!');
}

function resetForm() {
  document.getElementById('report-form').reset();
  document.getElementById('auto-school-select').value = '';
  document.getElementById('edit-id').value = '';
  updateVisitDateFromSchedule();
}

// ====== معاينة التقرير ======
function populatePreviewDocument(report) {
  // الرقم والتاريخ
  const docId = `TQR-${report.academicYear}-${report.term}-${Date.now()}`.substring(0, 20);
  const today = new Date();
  const hijriDate = convertToHijri(today);
  
  document.getElementById('pdf-doc-id').textContent = docId;
  document.getElementById('pdf-doc-date').textContent = hijriDate;
  document.getElementById('pdf-term-display').textContent = report.term === 'الأول' ? 'الأول' : 'الثاني';
  
  // بيانات الزيارة
  document.getElementById('pdf-visit-num').textContent = report.visitNum;
  document.getElementById('pdf-term').textContent = report.term;
  document.getElementById('pdf-visit-week').textContent = report.visitWeek;
  document.getElementById('pdf-visit-day').textContent = report.visitDay;
  document.getElementById('pdf-visit-date').textContent = report.visitDate;
  
  // بيانات مقدم الخدمة
  document.getElementById('pdf-provider-present').textContent = report.providerPresent;
  document.getElementById('pdf-provider-name').textContent = report.providerName;
  document.getElementById('pdf-support-type').textContent = report.supportType;
  document.getElementById('pdf-weekly-report').textContent = report.weeklyReport;
  
  // مجالات الدعم
  let areas = [];
  if (report.supportAreas.teaching) areas.push('التدريس');
  if (report.supportAreas.outcomes) areas.push('نواتج التعلم');
  if (report.supportAreas.guidance) areas.push('التوجيه الطلابي');
  if (report.supportAreas.activities) areas.push('الأنشطة المدرسية');
  document.getElementById('pdf-sup-areas').textContent = areas.join(' - ');
  
  // بيانات المدرسة
  document.getElementById('pdf-school-name').textContent = report.schoolName;
  document.getElementById('pdf-stage').textContent = report.schoolStage;
  document.getElementById('pdf-gender').textContent = report.schoolGender;
  document.getElementById('pdf-sector').textContent = 'العوالي';
  
  // نتائج التقويم
  document.getElementById('pdf-eval-type').textContent = report.evaluation.type;
  document.getElementById('pdf-overall-level').textContent = report.evaluation.overallLevel;
  document.getElementById('pdf-overall-score').textContent = report.evaluation.overallScore;
  document.getElementById('pdf-outcomes-level').textContent = report.evaluation.outcomesLevel;
  document.getElementById('pdf-outcomes-score').textContent = report.evaluation.outcomesScore;
  
  // الممارسات
  const practiceGrades = ['', '1: بدرجة منخفضة', '2: بدرجة متوسطة', '3: بدرجة عالية'];
  document.getElementById('pdf-prac-1-g').textContent = practiceGrades[report.practices.prac1.grade] || report.practices.prac1.grade;
  document.getElementById('pdf-prac-1-n').textContent = report.practices.prac1.note;
  document.getElementById('pdf-prac-2-g').textContent = practiceGrades[report.practices.prac2.grade] || report.practices.prac2.grade;
  document.getElementById('pdf-prac-2-n').textContent = report.practices.prac2.note;
  document.getElementById('pdf-prac-3-g').textContent = practiceGrades[report.practices.prac3.grade] || report.practices.prac3.grade;
  document.getElementById('pdf-prac-3-n').textContent = report.practices.prac3.note;
  
  // الخدمات
  document.getElementById('pdf-sup-1-g').textContent = practiceGrades[report.services.sup1.grade] || report.services.sup1.grade;
  document.getElementById('pdf-sup-1-n').textContent = report.services.sup1.note;
  document.getElementById('pdf-sup-2-g').textContent = practiceGrades[report.services.sup2.grade] || report.services.sup2.grade;
  document.getElementById('pdf-sup-2-n').textContent = report.services.sup2.note;
  document.getElementById('pdf-sup-3-g').textContent = practiceGrades[report.services.sup3.grade] || report.services.sup3.grade;
  document.getElementById('pdf-sup-3-n').textContent = report.services.sup3.note;
  document.getElementById('pdf-sup-4-g').textContent = practiceGrades[report.services.sup4.grade] || report.services.sup4.grade;
  document.getElementById('pdf-sup-4-n').textContent = report.services.sup4.note;
}

// ====== لوحة الإحصائيات ======
function loadMemberDashboard() {
  updateMemberKPIs();
  updateAssignedSchoolsTable();
  updateReportsTable();
}

function updateMemberKPIs() {
  const memberSchools = allSchools.filter(s => s.provider === currentUser);
  const memberReports = allReports.filter(r => r.executiveMember === currentUser);
  const visitedSchools = new Set(memberReports.map(r => r.schoolName)).size;
  
  document.getElementById('member-kpi-assigned').textContent = memberSchools.length;
  document.getElementById('member-kpi-reports').textContent = memberReports.length;
  document.getElementById('member-kpi-visited').textContent = visitedSchools;
  document.getElementById('member-kpi-pending').textContent = memberSchools.length - visitedSchools;
  
  const coverage = memberSchools.length > 0 
    ? Math.round((visitedSchools / memberSchools.length) * 100) 
    : 0;
  document.getElementById('assigned-coverage-badge').textContent = coverage + '% نسبة التغطية';
}

function updateAssignedSchoolsTable() {
  const tbody = document.getElementById('member-assigned-stats-body');
  if (!tbody) return;
  
  const memberSchools = allSchools.filter(s => s.provider === currentUser);
  const memberReports = allReports.filter(r => r.executiveMember === currentUser);
  
  tbody.innerHTML = '';
  
  memberSchools.forEach((school, index) => {
    const schoolReports = memberReports.filter(r => r.schoolName === school.name);
    const visitCount = schoolReports.length;
    const status = visitCount > 0 ? '✓ تمت الزيارة' : '⏳ قيد الانتظار';
    const statusColor = visitCount > 0 ? 'text-emerald-600' : 'text-amber-600';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="p-3 text-center font-bold">${index + 1}</td>
      <td class="p-3 font-bold">${school.name}</td>
      <td class="p-3">${school.stage}</td>
      <td class="p-3">${school.provider}</td>
      <td class="p-3 text-center"><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">${school.level}</span></td>
      <td class="p-3 text-center font-bold">${visitCount}</td>
      <td class="p-3 text-center"><span class="font-bold ${statusColor}">${status}</span></td>
      <td class="p-3 text-center">
        <button onclick="editSchoolReport('${school.name}')" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded font-bold">
          <i class="fa-solid fa-edit"></i> إضافة
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updateReportsTable() {
  const tbody = document.getElementById('reports-table-body');
  if (!tbody) return;
  
  const filterStage = document.getElementById('filter-stage')?.value || 'الكل';
  const filterLevel = document.getElementById('filter-level')?.value || 'الكل';
  const searchText = document.getElementById('report-search')?.value.toLowerCase() || '';
  
  let filtered = allReports.filter(r => r.executiveMember === currentUser);
  
  if (filterStage !== 'الكل') {
    filtered = filtered.filter(r => r.schoolStage === filterStage);
  }
  
  if (filterLevel !== 'الكل') {
    filtered = filtered.filter(r => r.evaluation.overallLevel === filterLevel);
  }
  
  if (searchText) {
    filtered = filtered.filter(r => 
      r.schoolName.toLowerCase().includes(searchText) ||
      r.providerName.toLowerCase().includes(searchText) ||
      r.executiveMember.toLowerCase().includes(searchText)
    );
  }
  
  tbody.innerHTML = '';
  
  filtered.forEach((report, index) => {
    const row = document.createElement('tr');
    const reportDate = new Date(report.timestamp).toLocaleDateString('ar-SA');
    
    row.innerHTML = `
      <td class="p-3 text-center font-bold">${index + 1}</td>
      <td class="p-3 font-bold">${report.schoolName}</td>
      <td class="p-3">${report.schoolStage}</td>
      <td class="p-3"><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">${report.evaluation.overallLevel}</span></td>
      <td class="p-3">${report.term} / ${report.visitWeek}</td>
      <td class="p-3">${report.visitDate}</td>
      <td class="p-3">${report.providerName}</td>
      <td class="p-3">${report.executiveMember}</td>
      <td class="p-3 text-center">
        <button onclick="viewReport(${report.id})" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded font-bold mr-1">
          <i class="fa-solid fa-eye"></i> عرض
        </button>
        <button onclick="editReport(${report.id})" class="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded font-bold mr-1">
          <i class="fa-solid fa-edit"></i> تعديل
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  document.getElementById('report-count').textContent = filtered.length + ' تقرير';
}

function applyAllFilters() {
  updateReportsTable();
}

function editSchoolReport(schoolName) {
  showSection('form-section');
  const school = allSchools.find(s => s.name === schoolName);
  if (school) {
    onSchoolSelected(school.id);
  }
}

function viewReport(reportId) {
  const report = allReports.find(r => r.id === reportId);
  if (report) {
    populatePreviewDocument(report);
    showSection('preview-section');
  }
}

function editReport(reportId) {
  const report = allReports.find(r => r.id === reportId);
  if (report) {
    // تحميل بيانات التقرير في النموذج
    document.getElementById('edit-id').value = reportId;
    document.getElementById('school-name').value = report.schoolName;
    document.getElementById('school-stage').value = report.schoolStage;
    document.getElementById('school-gender').value = report.schoolGender;
    document.getElementById('term').value = report.term;
    document.getElementById('academic-year').value = report.academicYear;
    document.getElementById('visit-num').value = report.visitNum;
    document.getElementById('visit-week').value = report.visitWeek;
    document.getElementById('visit-day').value = report.visitDay;
    document.getElementById('visit-date').value = report.visitDate;
    
    showSection('form-section');
    window.scrollTo(0, 0);
  }
}

// ====== الإحصائيات (لرئيس الفريق فقط) ======
function renderAnalyticsDashboard() {
  const filterStage = document.getElementById('analytics-filter-stage')?.value || 'الكل';
  const filterLevel = document.getElementById('analytics-filter-level')?.value || 'الكل';
  
  let filteredSchools = allSchools;
  let filteredReports = allReports;
  
  if (filterStage !== 'الكل') {
    filteredSchools = filteredSchools.filter(s => s.stage === filterStage);
  }
  
  if (filterLevel !== 'الكل') {
    filteredSchools = filteredSchools.filter(s => s.level === filterLevel);
    filteredReports = filteredReports.filter(r => r.evaluation.overallLevel === filterLevel);
  }
  
  // تحديث البطاقات الإحصائية
  document.getElementById('stat-total-schools').textContent = filteredSchools.length;
  document.getElementById('stat-total-reports').textContent = filteredReports.length;
  document.getElementById('stat-total-providers').textContent = supportProviders.length;
  
  // تحديث الجداول والرسوم البيانية
  updateExecutiveSummaryTable(filteredReports);
  renderMembersReportsChart();
  renderSchoolsLevelsChart();
}

function updateExecutiveSummaryTable(filteredReports) {
  const tbody = document.getElementById('table-exec-summary-body');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  executiveMembers.forEach((member, index) => {
    const memberReports = filteredReports.filter(r => r.executiveMember === member.name);
    const memberSchools = allSchools.filter(s => s.provider === member.name);
    const withProvider = memberSchools.filter(s => s.provider).length;
    const withoutProvider = memberSchools.length - withProvider;
    const completionRate = memberSchools.length > 0 
      ? Math.round((memberReports.length / memberSchools.length) * 100) 
      : 0;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="p-3 text-center font-bold">${index + 1}</td>
      <td class="p-3 font-bold">${member.name}</td>
      <td class="p-3">تنفيذ</td>
      <td class="p-3 text-center">${memberSchools.length}</td>
      <td class="p-3 text-center">${withProvider}</td>
      <td class="p-3 text-center">${withoutProvider}</td>
      <td class="p-3 text-center font-bold text-indigo-700">${memberReports.length}</td>
      <td class="p-3 text-center"><span class="font-bold text-emerald-700">${completionRate}%</span></td>
    `;
    tbody.appendChild(row);
  });
}

function renderMembersReportsChart() {
  const ctx = document.getElementById('chart-members-reports');
  if (!ctx) return;
  
  const labels = executiveMembers.map(m => m.name.split(' ')[0]);
  const data = executiveMembers.map(m => allReports.filter(r => r.executiveMember === m.name).length);
  
  if (window.membersReportsChart) {
    window.membersReportsChart.destroy();
  }
  
  window.membersReportsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'عدد التقارير المنجزة',
        data: data,
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { font: { family: "'Cairo', sans-serif" } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { font: { family: "'Cairo', sans-serif" } }
        },
        x: {
          ticks: { font: { family: "'Cairo', sans-serif" } }
        }
      }
    }
  });
}

function renderSchoolsLevelsChart() {
  const ctx = document.getElementById('chart-schools-levels');
  if (!ctx) return;
  
  const levels = ['التميز', 'التقدم', 'الانطلاق'];
  const colors = ['#06b6d4', '#f59e0b', '#ef4444'];
  const data = levels.map(level => allSchools.filter(s => s.level === level).length);
  
  if (window.schoolsLevelsChart) {
    window.schoolsLevelsChart.destroy();
  }
  
  window.schoolsLevelsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: levels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { font: { family: "'Cairo', sans-serif" } }
        }
      }
    }
  });
}

function prepareAndPrintAnalyticsReport() {
  document.getElementById('print-stat-schools').textContent = allSchools.length;
  document.getElementById('print-stat-reports').textContent = allReports.length;
  document.getElementById('print-stat-providers').textContent = supportProviders.length;
  
  const printTableBody = document.getElementById('print-table-exec-summary');
  if (printTableBody) {
    printTableBody.innerHTML = '';
    executiveMembers.forEach((member, index) => {
      const memberReports = allReports.filter(r => r.executiveMember === member.name);
      const memberSchools = allSchools.filter(s => s.provider === member.name);
      const completionRate = memberSchools.length > 0 
        ? Math.round((memberReports.length / memberSchools.length) * 100) 
        : 0;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="text-center font-bold">${index + 1}</td>
        <td>${member.name}</td>
        <td>تنفيذ</td>
        <td class="text-center">${memberSchools.length}</td>
        <td class="text-center">${memberSchools.filter(s => s.provider).length}</td>
        <td class="text-center">${memberSchools.length - memberSchools.filter(s => s.provider).length}</td>
        <td class="text-center font-bold">${memberReports.length}</td>
        <td class="text-center font-bold">${completionRate}%</td>
      `;
      printTableBody.appendChild(row);
    });
  }
  
  // حفظ صور الرسوم البيانية
  setTimeout(() => {
    const chart1 = window.membersReportsChart?.canvas;
    if (chart1) {
      document.getElementById('print-chart-img-1').src = chart1.toDataURL();
    }
    const chart2 = window.schoolsLevelsChart?.canvas;
    if (chart2) {
      document.getElementById('print-chart-img-2').src = chart2.toDataURL();
    }
  }, 100);
  
  showSection('analytics-print-preview-section');
}

// ====== الطباعة والتصدير ======
function exportToPdf() {
  const element = document.getElementById('printable-area');
  const opt = {
    margin: 5,
    filename: 'تقرير-التغذية-الراجعة.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  html2pdf().set(opt).from(element).save();
}

function exportAnalyticsToPdf() {
  const element = document.getElementById('analytics-report-area');
  const opt = {
    margin: 5,
    filename: 'التقرير-الإحصائي-المعتمد.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  html2pdf().set(opt).from(element).save();
}

// ====== إدارة التوقيع والحساب ======
function openSettingsModal() {
  const password = prompt('أدخل كلمة المرور للوصول لإعدادات الحساب:');
  if (password === '123456') {
    const signatureInput = prompt('أدخل مسار صورة التوقيع (أو اتركه فارغاً):');
    if (signatureInput !== null) {
      const member = executiveMembers.find(m => m.name === currentUser);
      if (member) {
        member.signature = signatureInput;
        saveDataToLocalStorage();
        alert('تم حفظ إعدادات الحساب ب��جاح');
      }
    }
  } else {
    alert('كلمة المرور غير صحيحة');
  }
}

// ====== دالات مساعدة ======
function convertToHijri(date) {
  // تحويل مبسط إلى التاريخ الهجري (يمكن تحسينه باستخدام مكتبة متخصصة)
  const day = date.getDate();
  const month = date.getMonth();
  const hijriMonths = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  
  // تقدير الشهر الهجري (هذا تقريبي)
  const approximateHijriMonth = hijriMonths[(month + 9) % 12];
  
  return `${day} ${approximateHijriMonth}`;
}
