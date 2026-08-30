import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  ArrowLeft, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Eye, 
  Search, 
  Filter, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight,
  Database,
  RefreshCw,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { FUNDUS_PRESETS } from '../assets/fundus-data';

export default function AnalyticsDashboard({ 
  currentUser, 
  onBackToHome, 
  onNavigateStudio, 
  onNavigatePatients,
  onViewReport,
  customImage,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month'); // 'week' | 'month' | 'quarter' | 'all'

  const doctorName = currentUser?.name || 'Dr. Ananya Sharma';
  const doctorDistrict = currentUser?.district || 'Varanasi';
  const doctorState = currentUser?.state || 'Uttar Pradesh';

  // Comprehensive recorded analysis report database
  const recordedReports = useMemo(() => [
    {
      id: 'IRIS-REP-8801',
      patientId: currentUser?.patientId || 'vyom1234',
      patientName: currentUser?.patientName || 'Harish Chandra Verma',
      age: 61,
      gender: 'Male',
      date: '2026-08-28 11:30 IST',
      eye: 'OD (Right Eye)',
      grade: 2,
      gradeLabel: 'Grade 2: Moderate NPDR',
      maxSoftmaxConfidence: 96.8,
      referable: true,
      urgency: 'Routine Referral (<30 Days)',
      urgencyLevel: 'moderate',
      lesions: { ma: 18, he: 12, hem: 7, cws: 1, nv: 'None' },
      iqaScore: 94.2,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    },
    {
      id: 'IRIS-REP-8802',
      patientId: 'UP-VAR-8821',
      patientName: 'Rameshwar Tiwari',
      age: 64,
      gender: 'Male',
      date: '2026-08-28 09:15 IST',
      eye: 'OD (Right Eye)',
      grade: 4,
      gradeLabel: 'Grade 4: Proliferative DR (PDR)',
      maxSoftmaxConfidence: 98.9,
      referable: true,
      urgency: 'Emergency Surgical Triage (<48h)',
      urgencyLevel: 'critical',
      lesions: { ma: 42, he: 34, hem: 26, cws: 5, nv: 'NVD & NVE Present' },
      iqaScore: 89.4,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    },
    {
      id: 'IRIS-REP-8803',
      patientId: 'UP-VAR-8822',
      patientName: 'Sunita Devi',
      age: 48,
      gender: 'Female',
      date: '2026-08-27 15:40 IST',
      eye: 'OS (Left Eye)',
      grade: 1,
      gradeLabel: 'Grade 1: Mild NPDR',
      maxSoftmaxConfidence: 94.6,
      referable: false,
      urgency: 'Re-screen at PHC in 6-12 Months',
      urgencyLevel: 'low',
      lesions: { ma: 6, he: 0, hem: 0, cws: 0, nv: 'None' },
      iqaScore: 93.5,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    },
    {
      id: 'IRIS-REP-8804',
      patientId: 'UP-VAR-8823',
      patientName: 'Rameshwar Prasad',
      age: 52,
      gender: 'Male',
      date: '2026-08-27 11:10 IST',
      eye: 'OD (Right Eye)',
      grade: 0,
      gradeLabel: 'Grade 0: No Apparent DR',
      maxSoftmaxConfidence: 99.1,
      referable: false,
      urgency: 'Routine Annual Tele-Screening',
      urgencyLevel: 'low',
      lesions: { ma: 0, he: 0, hem: 0, cws: 0, nv: 'None' },
      iqaScore: 97.4,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    },
    {
      id: 'IRIS-REP-8805',
      patientId: 'UP-VAR-8824',
      patientName: 'Meena Kumari',
      age: 61,
      gender: 'Female',
      date: '2026-08-26 16:20 IST',
      eye: 'OS (Left Eye)',
      grade: 3,
      gradeLabel: 'Grade 3: Severe NPDR',
      maxSoftmaxConfidence: 95.8,
      referable: true,
      urgency: 'Urgent Ophthalmology Review (<14 Days)',
      urgencyLevel: 'high',
      lesions: { ma: 32, he: 18, hem: 19, cws: 3, nv: 'IRMA Present' },
      iqaScore: 91.8,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    },
    {
      id: 'IRIS-REP-8806',
      patientId: 'UP-VAR-8825',
      patientName: 'Rajesh Patel',
      age: 55,
      gender: 'Male',
      date: '2026-08-26 14:00 IST',
      eye: 'OD (Right Eye)',
      grade: 2,
      gradeLabel: 'Grade 2: Moderate NPDR',
      maxSoftmaxConfidence: 96.2,
      referable: true,
      urgency: 'Referral to District Hospital (30 Days)',
      urgencyLevel: 'moderate',
      lesions: { ma: 16, he: 10, hem: 6, cws: 1, nv: 'None' },
      iqaScore: 92.4,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    },
    {
      id: 'IRIS-REP-8807',
      patientId: 'UP-VAR-8826',
      patientName: 'Pooja Mishra',
      age: 46,
      gender: 'Female',
      date: '2026-08-25 10:45 IST',
      eye: 'OS (Left Eye)',
      grade: 1,
      gradeLabel: 'Grade 1: Mild NPDR',
      maxSoftmaxConfidence: 93.8,
      referable: false,
      urgency: 'Dietary Glycemic Advisory & 6M Check',
      urgencyLevel: 'low',
      lesions: { ma: 4, he: 0, hem: 0, cws: 0, nv: 'None' },
      iqaScore: 95.0,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    },
    {
      id: 'IRIS-REP-8808',
      patientId: 'UP-VAR-8827',
      patientName: 'Arvind Gupta',
      age: 68,
      gender: 'Male',
      date: '2026-08-25 09:30 IST',
      eye: 'OD (Right Eye)',
      grade: 4,
      gradeLabel: 'Grade 4: Proliferative DR (High Risk)',
      maxSoftmaxConfidence: 98.4,
      referable: true,
      urgency: 'Immediate Vitrectomy / Anti-VEGF (<24h)',
      urgencyLevel: 'critical',
      lesions: { ma: 48, he: 38, hem: 30, cws: 6, nv: 'Severe NVE/NVD' },
      iqaScore: 88.2,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    },
    {
      id: 'IRIS-REP-8809',
      patientId: 'UP-VAR-8828',
      patientName: 'Fatima Begum',
      age: 59,
      gender: 'Female',
      date: '2026-08-24 16:15 IST',
      eye: 'OD (Right Eye)',
      grade: 2,
      gradeLabel: 'Grade 2: Moderate NPDR',
      maxSoftmaxConfidence: 95.4,
      referable: true,
      urgency: 'Routine Referral (<30 Days)',
      urgencyLevel: 'moderate',
      lesions: { ma: 14, he: 9, hem: 5, cws: 1, nv: 'None' },
      iqaScore: 93.0,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    },
    {
      id: 'IRIS-REP-8810',
      patientId: 'UP-VAR-8829',
      patientName: 'Sanjay Yadav',
      age: 43,
      gender: 'Male',
      date: '2026-08-24 11:20 IST',
      eye: 'OS (Left Eye)',
      grade: 0,
      gradeLabel: 'Grade 0: No Apparent DR',
      maxSoftmaxConfidence: 99.4,
      referable: false,
      urgency: 'Annual Follow-up at PHC',
      urgencyLevel: 'low',
      lesions: { ma: 0, he: 0, hem: 0, cws: 0, nv: 'None' },
      iqaScore: 98.2,
      doctor: doctorName,
      location: `${doctorDistrict}, ${doctorState}`,
    }
  ], [currentUser, doctorName, doctorDistrict, doctorState]);

  // Filtered dataset
  const filteredReports = useMemo(() => {
    return recordedReports.filter((rep) => {
      const matchesSearch = 
        rep.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrade = 
        selectedGradeFilter === 'ALL' ||
        (selectedGradeFilter === 'REFERABLE' && rep.referable) ||
        (selectedGradeFilter === 'NON_REFERABLE' && !rep.referable) ||
        rep.grade === parseInt(selectedGradeFilter, 10);

      return matchesSearch && matchesGrade;
    });
  }, [recordedReports, searchTerm, selectedGradeFilter]);

  // Aggregate Metrics
  const totalCount = recordedReports.length;
  const referableCount = recordedReports.filter(r => r.referable).length;
  const criticalCount = recordedReports.filter(r => r.urgencyLevel === 'critical' || r.urgencyLevel === 'high').length;
  const normalCount = recordedReports.filter(r => r.grade === 0).length;
  const avgConfidence = (recordedReports.reduce((acc, r) => acc + r.maxSoftmaxConfidence, 0) / totalCount).toFixed(1);
  const avgIqa = (recordedReports.reduce((acc, r) => acc + r.iqaScore, 0) / totalCount).toFixed(1);

  // Grade Distribution Counts
  const gradeCounts = [0, 1, 2, 3, 4].map(g => ({
    grade: g,
    label: g === 0 ? 'Grade 0 (Normal)' : g === 1 ? 'Grade 1 (Mild)' : g === 2 ? 'Grade 2 (Moderate)' : g === 3 ? 'Grade 3 (Severe)' : 'Grade 4 (PDR)',
    count: recordedReports.filter(r => r.grade === g).length,
    percentage: Math.round((recordedReports.filter(r => r.grade === g).length / totalCount) * 100),
    color: g === 0 ? '#10B981' : g === 1 ? '#0EA5E9' : g === 2 ? '#F59E0B' : g === 3 ? '#F97316' : '#EF4444',
  }));

  // Lesion totals
  const totalMAs = recordedReports.reduce((acc, r) => acc + (r.lesions.ma || 0), 0);
  const totalHEs = recordedReports.reduce((acc, r) => acc + (r.lesions.he || 0), 0);
  const totalHems = recordedReports.reduce((acc, r) => acc + (r.lesions.hem || 0), 0);
  const totalCWS = recordedReports.reduce((acc, r) => acc + (r.lesions.cws || 0), 0);

  // Age Cohort breakdown
  const ageCohorts = [
    { range: '< 45 Yrs', total: recordedReports.filter(r => r.age < 45).length, referable: recordedReports.filter(r => r.age < 45 && r.referable).length },
    { range: '45 - 55 Yrs', total: recordedReports.filter(r => r.age >= 45 && r.age <= 55).length, referable: recordedReports.filter(r => r.age >= 45 && r.age <= 55 && r.referable).length },
    { range: '56 - 65 Yrs', total: recordedReports.filter(r => r.age >= 56 && r.age <= 65).length, referable: recordedReports.filter(r => r.age >= 56 && r.age <= 65 && r.referable).length },
    { range: '> 65 Yrs', total: recordedReports.filter(r => r.age > 65).length, referable: recordedReports.filter(r => r.age > 65 && r.referable).length },
  ];

  // 1. Download CSV Export Function
  const handleDownloadCSV = () => {
    const headers = [
      'Report ID',
      'Patient ID (ABHA)',
      'Patient Name',
      'Age',
      'Gender',
      'Screening Date',
      'Examined Eye',
      'ICDR Grade',
      'Grade Description',
      'Max Softmax Confidence (%)',
      'Referable DR Flag',
      'Triage Urgency',
      'Microaneurysms Count',
      'Hard Exudates Count',
      'Hemorrhages Count',
      'Cotton Wool Spots Count',
      'Neovascularization',
      'IQA Focus Score (%)',
      'Attending Doctor',
      'Location / PHC'
    ];

    const rows = filteredReports.map(r => [
      `"${r.id}"`,
      `"${r.patientId}"`,
      `"${r.patientName}"`,
      r.age,
      `"${r.gender}"`,
      `"${r.date}"`,
      `"${r.eye}"`,
      r.grade,
      `"${r.gradeLabel}"`,
      r.maxSoftmaxConfidence,
      r.referable ? 'YES' : 'NO',
      `"${r.urgency}"`,
      r.lesions.ma,
      r.lesions.he,
      r.lesions.hem,
      r.lesions.cws,
      `"${r.lesions.nv}"`,
      r.iqaScore,
      `"${r.doctor}"`,
      `"${r.location}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IRIS_AI_Analytics_Dataset_${doctorDistrict}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Download JSON Export Function
  const handleDownloadJSON = () => {
    const exportData = {
      facility: `${doctorDistrict} Primary Health Centre, ${doctorState}`,
      attendingClinician: doctorName,
      exportedAt: new Date().toISOString(),
      summaryMetrics: {
        totalScreenings: totalCount,
        referableDRRate: `${Math.round((referableCount / totalCount) * 100)}%`,
        averageSoftmaxConfidence: `${avgConfidence}%`,
        meanIqaPassScore: `${avgIqa}%`,
      },
      reports: filteredReports,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `IRIS_AI_Screening_Analytics_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Print / PDF Summary Function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Top Clinical Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all print:hidden">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20 sm:h-22">
            
            {/* Left: Back to Home + IRIS AI Logo */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-sm border border-slate-200 transition-all cursor-pointer shadow-xs group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-600" />
                <span>Back to Home</span>
              </button>

              <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-6">
                <img
                  src="/eye-logo.png"
                  alt="IRIS AI Logo"
                  className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,140,255,0.4)]"
                />
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  IRIS<span className="text-blue-600"> AI</span> <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 ml-1">ANALYTICS</span>
                </span>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition-all cursor-pointer shadow-xs"
                title="Download Structured CSV Dataset"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-300 transition-all cursor-pointer shadow-xs"
                title="Download JSON Analytics Dataset"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Export JSON</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer shadow-xs"
                title="Print Executive PDF Summary"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>

              <button
                onClick={onNavigateStudio}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Launch Studio</span>
                <span className="sm:hidden">Studio</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Analytics Viewport */}
      <main className="flex-grow py-10 md:py-16">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-10">
          
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-200/80">
            <div className="space-y-3 max-w-3xl text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <BarChart3 className="w-4 h-4" />
                <span>Executive Tele-Ophthalmology Intelligence</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                Clinical Analytics &amp; DR Triage Dashboard
              </h1>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Population-level diabetic retinopathy grading metrics, maximum softmax confidence distribution, biomarker lesion frequency, and exportable clinical analysis records.
              </p>
            </div>

            {/* Clinician Profile */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-600/20 flex-shrink-0">
                {doctorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base">{doctorName}</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold font-mono">
                    PHC Lead
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{doctorDistrict}, {doctorState}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5">
            
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1.5 text-left">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Screened</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono">
                {totalCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">100% Analysis Recorded</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1.5 text-left">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
                <span>Referable DR</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-700 font-mono">
                {Math.round((referableCount / totalCount) * 100)}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium">{referableCount} Patients (Gr. 2-4)</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1.5 text-left">
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center justify-between">
                <span>High Risk / PDR</span>
                <ShieldCheck className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black text-rose-700 font-mono">
                {criticalCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">&lt;48h Surgery / Anti-VEGF</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1.5 text-left">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center justify-between">
                <span>Max Softmax</span>
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-700 font-mono">
                {avgConfidence}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Mean Model Confidence</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1.5 text-left">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
                <span>IQA Pass Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono">
                {avgIqa}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Optical Clarity Score</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1.5 text-left">
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center justify-between">
                <span>Mean Latency</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-indigo-700 font-mono">
                1.4s
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Edge Inferencing Time</div>
            </div>

          </div>

          {/* Interactive Chart Row A: Grade Severity Distribution & Biomarker Prevalence */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 6 Cols: ICDR Grade Severity Breakdown */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    ICDR Grade Severity Distribution
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">n = {totalCount} Patients</span>
              </div>

              {/* Visual Distribution Stacked Progress Bar */}
              <div className="space-y-3">
                <div className="w-full h-6 rounded-2xl overflow-hidden flex bg-slate-100 shadow-inner">
                  {gradeCounts.map((g) => (
                    <div
                      key={g.grade}
                      style={{ width: `${g.percentage}%`, backgroundColor: g.color }}
                      className="h-full relative group transition-all hover:opacity-85"
                      title={`${g.label}: ${g.count} (${g.percentage}%)`}
                    />
                  ))}
                </div>

                {/* Legend & Breakdown Bars */}
                <div className="space-y-2 pt-2">
                  {gradeCounts.map((g) => (
                    <div key={g.grade} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: g.color }} />
                        <span className="text-xs sm:text-sm font-bold text-slate-800">{g.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-700">{g.count} cases</span>
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-lg bg-white border border-slate-200 shadow-xs" style={{ color: g.color }}>
                          {g.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Biomarker Lesion Prevalence */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    Biomarker Lesion Prevalence &amp; Counts
                  </h3>
                </div>
                <span className="text-xs font-mono text-indigo-600 font-bold">Morphometric Total</span>
              </div>

              {/* Lesion Quantitative Metrics */}
              <div className="space-y-3.5">
                {[
                  { name: 'Microaneurysms (MAs)', count: totalMAs, color: '#EF4444', desc: 'Focal capillary out-pouchings' },
                  { name: 'Hard Lipid Exudates (HEs)', count: totalHEs, color: '#F59E0B', desc: 'Lipoprotein deposits & CSME indicator' },
                  { name: 'Intraretinal Hemorrhages (Hems)', count: totalHems, color: '#DC2626', desc: 'Dot/Blot capillary wall rupture' },
                  { name: 'Cotton Wool Spots (CWS)', count: totalCWS, color: '#94A3B8', desc: 'Focal nerve fiber infarcts' },
                ].map((item) => {
                  const maxPossible = Math.max(totalMAs, 1);
                  const widthPercent = Math.min(100, Math.round((item.count / maxPossible) * 100));
                  return (
                    <div key={item.name} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="font-mono font-extrabold text-slate-900 text-sm">{item.count} Detected</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Interactive Chart Row B: Demographic Risk & Softmax Confidence Spread */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Age Cohorts (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    Age Cohort vs. Referable DR Risk
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">Demographic Stratification</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {ageCohorts.map((cohort) => {
                  const rate = cohort.total > 0 ? Math.round((cohort.referable / cohort.total) * 100) : 0;
                  return (
                    <div key={cohort.range} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {cohort.range}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900 font-mono">{rate}%</span>
                        <span className="text-xs font-mono text-amber-700 font-bold">{cohort.referable}/{cohort.total} referable</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Softmax Confidence Density (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    Maximum Softmax Confidence Density
                  </h3>
                </div>
                <span className="text-xs font-mono text-blue-700 font-bold">Avg {avgConfidence}%</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { range: '98% - 100% (High Certainty)', count: recordedReports.filter(r => r.maxSoftmaxConfidence >= 98).length, color: '#10B981' },
                  { range: '95% - 98% (Strong Confidence)', count: recordedReports.filter(r => r.maxSoftmaxConfidence >= 95 && r.maxSoftmaxConfidence < 98).length, color: '#0EA5E9' },
                  { range: '90% - 95% (Moderate Confidence)', count: recordedReports.filter(r => r.maxSoftmaxConfidence >= 90 && r.maxSoftmaxConfidence < 95).length, color: '#F59E0B' },
                  { range: '< 90% (Low / Manual Review)', count: recordedReports.filter(r => r.maxSoftmaxConfidence < 90).length, color: '#EF4444' },
                ].map((bucket) => {
                  const pct = Math.round((bucket.count / totalCount) * 100);
                  return (
                    <div key={bucket.range} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{bucket.range}</span>
                        <span className="font-mono font-bold text-slate-900">{bucket.count} scans ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: bucket.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Search, Filter Bar & Recorded Analysis Reports Ledger Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 text-left">
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">
                  Recorded Analysis Reports Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized patient analysis database containing diagnosis, maximum softmax confidence, and referral urgency.
                </p>
              </div>

              {/* Search & Export Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patient, ID, or report..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <button
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Severity Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Filter:
              </span>
              {[
                { label: 'All Reports', value: 'ALL' },
                { label: 'Referable DR (≥Gr.2)', value: 'REFERABLE' },
                { label: 'Non-Referable (<Gr.2)', value: 'NON_REFERABLE' },
                { label: 'Grade 0', value: '0' },
                { label: 'Grade 1', value: '1' },
                { label: 'Grade 2', value: '2' },
                { label: 'Grade 3', value: '3' },
                { label: 'Grade 4 (PDR)', value: '4' },
              ].map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setSelectedGradeFilter(chip.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    selectedGradeFilter === chip.value
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Report ID</th>
                    <th className="p-3.5">Patient Details</th>
                    <th className="p-3.5">Examined Eye</th>
                    <th className="p-3.5">AI Classification</th>
                    <th className="p-3.5">Max Softmax Confidence</th>
                    <th className="p-3.5">Triage Action</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue-50/40 transition-colors">
                      
                      <td className="p-3.5 font-mono font-bold text-blue-700">
                        {report.id}
                        <div className="text-[10px] text-slate-400 font-normal">{report.date.split(' ')[0]}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 text-sm">{report.patientName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ID: <strong className="text-slate-700">{report.patientId}</strong> • {report.age}y/{report.gender}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-semibold text-slate-700">
                        {report.eye}
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          report.grade === 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          report.grade === 1 ? 'bg-sky-50 text-sky-800 border-sky-200' :
                          report.grade === 2 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          report.grade === 3 ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {report.gradeLabel}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-blue-700">
                            {report.maxSoftmaxConfidence}%
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                            TOP
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">IQA Focus: {report.iqaScore}%</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                          report.urgencyLevel === 'critical' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          report.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          report.urgencyLevel === 'moderate' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{report.urgency}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            if (onViewReport) {
                              onViewReport({
                                patientName: report.patientName,
                                patientId: report.patientId,
                                age: report.age,
                                gender: report.gender,
                                eyeSide: report.eye,
                                gradeLabel: report.gradeLabel,
                                icdrGrade: report.grade,
                                confidence: report.maxSoftmaxConfidence,
                                referable: report.referable,
                                phcLocation: report.location,
                                doctorName: report.doctor,
                                doctorLocation: report.location,
                                approvedAt: report.date,
                                customImage: report.patientId === (currentUser?.patientId || 'vyom1234') ? customImage : null,
                                lesions: {
                                  microaneurysms: report.lesions.ma,
                                  hemorrhages: report.lesions.hem,
                                  hardExudates: report.lesions.he,
                                  cottonWoolSpots: report.lesions.cws,
                                  neovascularization: report.lesions.nv,
                                },
                              });
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Report</span>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </main>

      {/* Analytics Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500 font-mono print:hidden">
        <div className="w-full max-w-[1600px] mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>National Tele-Ophthalmology Screening Network • Automated Analytical Report Pipeline</span>
          </div>
          <div>© 2026 IRIS AI • PS ID: 26038</div>
        </div>
      </footer>

    </div>
  );
}
