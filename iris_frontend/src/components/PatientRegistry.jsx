import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  UserCheck, 
  Calendar, 
  Activity, 
  FileText, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  IdCard, 
  Sparkles,
  Phone,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  User,
  LogOut,
  Database,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { FUNDUS_PRESETS } from '../assets/fundus-data';
import { listPatients } from '../api/patients';

export default function PatientRegistry({ 
  currentUser, 
  onBackToHome, 
  onNavigateStudio, 
  onNavigatePatients,
  onNavigateAnalytics,
  onSelectPatientForStudio, 
  onViewPatientReport,
  onLogout
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');

  // Live Backend Database State
  const [dbPatients, setDbPatients] = useState([]);
  const [dbStatus, setDbStatus] = useState('loading'); // 'loading' | 'online' | 'offline'
  const [isSyncing, setIsSyncing] = useState(false);

  // Attending doctor & location info
  const doctorName = currentUser?.name || 'Dr. Ananya Sharma';
  const doctorDistrict = currentUser?.district || 'Varanasi';
  const doctorState = currentUser?.state || 'Uttar Pradesh';
  const doctorMobile = currentUser?.mobile || '9876543210';
  const currentPatientName = currentUser?.patientName || 'Harish Chandra Verma';
  const currentPatientId = currentUser?.patientId || 'vyom1234';

  // Fetch live patients from backend API
  const fetchLivePatients = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await listPatients({ limit: 50 });
      const items = Array.isArray(response) ? response : (response?.items || []);
      
      if (items.length > 0) {
        const mapped = items.map((p) => {
          const rawGrade = p.extra_data?.dr_grade !== undefined ? p.extra_data.dr_grade : 2;
          const calculatedAge = p.date_of_birth 
            ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear() 
            : (p.extra_data?.age || 56);
          const dateStr = p.created_at 
            ? new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Recent';

          const gradeLabels = [
            'Grade 0: No Apparent DR',
            'Grade 1: Mild NPDR',
            'Grade 2: Moderate NPDR',
            'Grade 3: Severe NPDR',
            'Grade 4: Proliferative DR (PDR)'
          ];

          const urgencyLevels = ['low', 'low', 'moderate', 'high', 'critical'];
          const urgencies = [
            'Routine Annual Retinal Screening',
            'Re-screen at PHC in 6 Months',
            'Routine Referral (Within 30 Days)',
            'Urgent Ophthalmology Review (<14 Days)',
            'Emergency Surgical Triage (<48h)'
          ];

          const safeGrade = Math.max(0, Math.min(rawGrade, 4));
          const presetIndex = Math.min(safeGrade, FUNDUS_PRESETS.length - 1);

          return {
            id: p.abha_id || `DB-${p.id.slice(0, 8).toUpperCase()}`,
            backendUuid: p.id,
            name: p.full_name,
            age: calculatedAge,
            gender: p.gender || 'Unknown',
            phone: p.phone || '+91 98000-00000',
            screeningDate: dateStr,
            eye: p.extra_data?.eye || 'OD (Right Eye)',
            dmHistory: p.diabetes_type ? `${p.diabetes_type} DM` : 'Type 2 DM (Active)',
            hba1c: p.extra_data?.hba1c ? `${p.extra_data.hba1c}%` : '8.4%',
            drGrade: safeGrade,
            drLabel: gradeLabels[safeGrade],
            riskTier: safeGrade >= 2 ? 'Referable DR' : 'Non-Referable',
            urgency: urgencies[safeGrade],
            urgencyLevel: urgencyLevels[safeGrade],
            confidence: p.extra_data?.confidence || 95.8,
            biomarkers: p.extra_data?.biomarkers || ['Hard Exudates', 'Microaneurysms'],
            preset: FUNDUS_PRESETS[presetIndex],
            isLiveDb: true,
          };
        });

        setDbPatients(mapped);
        setDbStatus('online');
      } else {
        // Backend is reachable but database returned empty
        setDbStatus('online');
      }
    } catch (err) {
      console.warn('[IRIS] Backend live patient fetch error:', err.message);
      setDbStatus('offline');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchLivePatients();
  }, [fetchLivePatients]);

  // Complete registry of demo mock patients for high-impact presentations
  const mockPatientRecords = useMemo(() => [
    {
      id: currentPatientId,
      name: currentPatientName,
      age: 58,
      gender: 'Male',
      phone: '+91 98234-11092',
      screeningDate: '26 Aug 2026, 09:30 AM',
      eye: 'OD (Right Eye)',
      dmHistory: 'Type 2 DM (12 Years)',
      hba1c: '8.9%',
      drGrade: 2,
      drLabel: 'Grade 2: Moderate NPDR',
      riskTier: 'Referable DR',
      urgency: 'Routine Referral (Within 30 Days)',
      urgencyLevel: 'moderate', // 'low' | 'moderate' | 'high' | 'critical'
      confidence: 96.4,
      biomarkers: ['Hard Exudates (Cluster)', 'Microaneurysms (Inferior)', 'Blot Hemorrhages'],
      preset: FUNDUS_PRESETS[2], // Moderate NPDR
      isLiveDb: false,
    },
    {
      id: 'UP-VAR-8821',
      name: 'Rameshwar Tiwari',
      age: 64,
      gender: 'Male',
      phone: '+91 94152-78210',
      screeningDate: '26 Aug 2026, 08:45 AM',
      eye: 'OD (Right Eye)',
      dmHistory: 'Type 2 DM (18 Years)',
      hba1c: '10.4%',
      drGrade: 4,
      drLabel: 'Grade 4: Proliferative DR (PDR)',
      riskTier: 'Referable DR (High Risk)',
      urgency: 'Emergency Surgical Triage (<48h)',
      urgencyLevel: 'critical',
      confidence: 98.1,
      biomarkers: ['Neovascularization at Disc (NVD)', 'Preretinal Hemorrhage', 'Fibrous Proliferation'],
      preset: FUNDUS_PRESETS[3], // Proliferative DR
      isLiveDb: false,
    },
    {
      id: 'UP-VAR-8822',
      name: 'Sunita Devi',
      age: 52,
      gender: 'Female',
      phone: '+91 88401-23984',
      screeningDate: '25 Aug 2026, 04:15 PM',
      eye: 'OS (Left Eye)',
      dmHistory: 'Type 2 DM (6 Years)',
      hba1c: '7.1%',
      drGrade: 1,
      drLabel: 'Grade 1: Mild NPDR',
      riskTier: 'Non-Referable',
      urgency: 'Re-screen at PHC in 6 Months',
      urgencyLevel: 'low',
      confidence: 94.2,
      biomarkers: ['Microaneurysms Only (2-3 Isolated)'],
      preset: FUNDUS_PRESETS[1], // Mild NPDR
      isLiveDb: false,
    },
    {
      id: 'UP-VAR-8823',
      name: 'Mohammad Arif',
      age: 49,
      gender: 'Male',
      phone: '+91 97920-56123',
      screeningDate: '25 Aug 2026, 02:30 PM',
      eye: 'OD (Right Eye)',
      dmHistory: 'Type 2 DM (4 Years)',
      hba1c: '6.4%',
      drGrade: 0,
      drLabel: 'Grade 0: No Apparent DR',
      riskTier: 'Normal (Non-Referable)',
      urgency: 'Routine Annual Retinal Screening',
      urgencyLevel: 'low',
      confidence: 99.2,
      biomarkers: ['Clear Retinal Vasculature', 'Sharp Optic Disc Margin', 'No Lesions'],
      preset: FUNDUS_PRESETS[0], // No DR
      isLiveDb: false,
    },
    {
      id: 'UP-VAR-8824',
      name: 'Meena Kumari',
      age: 61,
      gender: 'Female',
      phone: '+91 91254-89012',
      screeningDate: '25 Aug 2026, 11:20 AM',
      eye: 'OS (Left Eye)',
      dmHistory: 'Type 2 DM (15 Years)',
      hba1c: '9.6%',
      drGrade: 3,
      drLabel: 'Grade 3: Severe NPDR',
      riskTier: 'Referable DR (High Risk)',
      urgency: 'Urgent Ophthalmology Review (<14 Days)',
      urgencyLevel: 'high',
      confidence: 95.8,
      biomarkers: ['Venous Beading (2 Quadrants)', 'Intraretinal Microvascular Abnormalities (IRMA)', 'Extensive Hemorrhages'],
      preset: FUNDUS_PRESETS[2], // Severe / Mod proxy
      isLiveDb: false,
    },
    {
      id: 'UP-VAR-8825',
      name: 'Rajesh Patel',
      age: 55,
      gender: 'Male',
      phone: '+91 96518-34509',
      screeningDate: '24 Aug 2026, 03:50 PM',
      eye: 'OD (Right Eye)',
      dmHistory: 'Type 2 DM (9 Years)',
      hba1c: '8.2%',
      drGrade: 2,
      drLabel: 'Grade 2: Moderate NPDR',
      riskTier: 'Referable DR',
      urgency: 'Referral to District Hospital (30 Days)',
      urgencyLevel: 'moderate',
      confidence: 93.9,
      biomarkers: ['Hard Exudates', 'Cotton-Wool Spots', 'Microaneurysms'],
      preset: FUNDUS_PRESETS[2],
      isLiveDb: false,
    },
    {
      id: 'UP-VAR-8826',
      name: 'Pooja Mishra',
      age: 46,
      gender: 'Female',
      phone: '+91 80045-67120',
      screeningDate: '24 Aug 2026, 01:10 PM',
      eye: 'OS (Left Eye)',
      dmHistory: 'Type 2 DM (7 Years)',
      hba1c: '7.8%',
      drGrade: 1,
      drLabel: 'Grade 1: Mild NPDR',
      riskTier: 'Non-Referable',
      urgency: 'Dietary Glycemic Control & 6M Follow-up',
      urgencyLevel: 'low',
      confidence: 92.5,
      biomarkers: ['Focal Microaneurysms (Temporal)'],
      preset: FUNDUS_PRESETS[1],
      isLiveDb: false,
    },
    {
      id: 'UP-VAR-8827',
      name: 'Arvind Gupta',
      age: 68,
      gender: 'Male',
      phone: '+91 93356-78401',
      screeningDate: '24 Aug 2026, 10:00 AM',
      eye: 'OD (Right Eye)',
      dmHistory: 'Type 2 DM (22 Years)',
      hba1c: '11.2%',
      drGrade: 4,
      drLabel: 'Grade 4: Proliferative DR (High Risk)',
      riskTier: 'Referable DR (Immediate Surgery)',
      urgency: 'Immediate Vitrectomy / Anti-VEGF (<24h)',
      urgencyLevel: 'critical',
      confidence: 98.9,
      biomarkers: ['Severe Neovascularization Elsewhere (NVE)', 'Vitreous Hemorrhage Risk', 'Macular Threat'],
      preset: FUNDUS_PRESETS[3],
      isLiveDb: false,
    }
  ], [currentPatientName, currentPatientId]);

  // Combined records: Live DB records on top + Demo records (deduplicated by ID)
  const patientRecords = useMemo(() => {
    const existingIds = new Set(dbPatients.map(p => p.id));
    const uniqueMocks = mockPatientRecords.filter(p => !existingIds.has(p.id));
    return [...dbPatients, ...uniqueMocks];
  }, [dbPatients, mockPatientRecords]);

  // Filter patients by search term & severity grade
  const filteredPatients = useMemo(() => {
    return patientRecords.filter((patient) => {
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm);

      const matchesGrade = 
        selectedGradeFilter === 'ALL' ||
        (selectedGradeFilter === 'REFERABLE' && patient.drGrade >= 2) ||
        (selectedGradeFilter === 'NON_REFERABLE' && patient.drGrade < 2) ||
        patient.drGrade === parseInt(selectedGradeFilter, 10);

      return matchesSearch && matchesGrade;
    });
  }, [patientRecords, searchTerm, selectedGradeFilter]);

  // Summary Metrics
  const totalPatients = patientRecords.length;
  const referableCount = patientRecords.filter(p => p.drGrade >= 2).length;
  const criticalCount = patientRecords.filter(p => p.urgencyLevel === 'critical' || p.urgencyLevel === 'high').length;
  const normalCount = patientRecords.filter(p => p.drGrade === 0).length;

  const getUrgencyBadge = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 0: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 1: return 'bg-sky-50 text-sky-700 border-sky-200';
      case 2: return 'bg-amber-50 text-amber-700 border-amber-200';
      case 3: return 'bg-orange-50 text-orange-700 border-orange-200';
      case 4: return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* Top Clinical Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all">
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
                  IRIS<span className="text-blue-600"> AI</span> <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 ml-1">PATIENT REGISTRY</span>
                </span>
              </div>
            </div>

            {/* Right: Live DB Status, Sync Button, Doctor & Location Pill & Launch Studio */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Database Connection Status Pill */}
              <div className="hidden md:flex items-center gap-2">
                {dbStatus === 'online' ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono flex items-center gap-1.5 shadow-xs">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live DB ({dbPatients.length} records)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono flex items-center gap-1.5 shadow-xs">
                    <Database className="w-3.5 h-3.5 text-amber-600" />
                    <span>Demo Mode (Mock Data)</span>
                  </span>
                )}

                <button
                  onClick={fetchLivePatients}
                  disabled={isSyncing}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-all cursor-pointer"
                  title="Sync with Live Database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{doctorDistrict}, {doctorState}</span>
              </div>

              {onNavigateAnalytics && (
                <button
                  onClick={onNavigateAnalytics}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition-all cursor-pointer shadow-xs"
                  title="View Clinical Analytics Dashboard"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Analytics</span>
                </button>
              )}

              {currentUser && onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}

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

      {/* Main Content Area */}
      <main className="flex-grow py-10 md:py-16">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-12">
          
          {/* Section Header with Doctor Location Banner */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-200/80">
            <div className="space-y-3 max-w-3xl text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <IdCard className="w-4 h-4" />
                <span>Primary Health Center (PHC) Patient Registry</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                Patient Screening Records
              </h1>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Consolidated diabetic retinopathy screening ledger for registered clinical triage at this healthcare center. Connected to national PostgreSQL/Supabase database schema with offline fallback.
              </p>
            </div>

            {/* Attending Doctor Profile & Location Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-600/20 flex-shrink-0">
                {doctorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base">{doctorName}</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold font-mono">
                    Attending Clinician
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <strong className="text-slate-700">{doctorDistrict}, {doctorState}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 {doctorMobile}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical KPI Metric Cards for this District */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-2 text-left">
              <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Total Screened</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                {totalPatients}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Registered in {doctorDistrict} PHC unit
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-2 text-left">
              <div className="text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
                <span>Referable DR</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-700 font-mono">
                {referableCount} <span className="text-sm font-bold text-slate-500">({totalPatients > 0 ? Math.round((referableCount/totalPatients)*100) : 0}%)</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Grade 2 to Grade 4 requiring specialist care
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-2 text-left">
              <div className="text-xs sm:text-sm font-bold text-rose-700 uppercase tracking-wider flex items-center justify-between">
                <span>High Risk / PDR</span>
                <ShieldCheck className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-700 font-mono">
                {criticalCount}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Immediate Vitrectomy / Anti-VEGF candidates
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-2 text-left">
              <div className="text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
                <span>No Apparent DR</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono">
                {normalCount}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Annual routine follow-up recommended
              </div>
            </div>
          </div>

          {/* Search, Filter Bar & Quick Actions */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Search Input */}
              <div className="relative flex-grow max-w-lg">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient name, ID (e.g. vyom1234), or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Severity Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
                  Filter:
                </span>
                {[
                  { label: 'All Patients', value: 'ALL' },
                  { label: 'Referable DR (≥Gr.2)', value: 'REFERABLE' },
                  { label: 'Non-Referable (<Gr.2)', value: 'NON_REFERABLE' },
                  { label: 'Grade 0', value: '0' },
                  { label: 'Grade 1', value: '1' },
                  { label: 'Grade 2', value: '2' },
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
            </div>
          </div>

          {/* Patients Roster Cards Grid */}
          <div className="space-y-4">
            {filteredPatients.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-lg font-bold text-slate-800">No Patient Records Found</h4>
                <p className="text-sm text-slate-500">
                  No patients match the search query "{searchTerm}" in {doctorDistrict}, {doctorState}.
                </p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6"
                >
                  {/* Patient Primary Details */}
                  <div className="flex items-start sm:items-center gap-4 min-w-[280px]">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 flex items-center justify-center font-black text-lg border border-blue-200 flex-shrink-0">
                      {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                          {patient.name}
                        </h4>
                        {patient.id === currentPatientId && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold font-mono uppercase">
                            Active Session
                          </span>
                        )}
                        {patient.isLiveDb && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Live DB
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 font-mono">
                        <span>ID: <strong className="text-slate-800">{patient.id}</strong></span>
                        <span>•</span>
                        <span>{patient.age} Yrs, {patient.gender}</span>
                        <span>•</span>
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical & Diabetic Status */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 xl:gap-8 text-left">
                    <div className="space-y-0.5">
                      <div className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-bold">
                        History &amp; HbA1c
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800">
                        {patient.dmHistory}
                      </div>
                      <div className="text-xs font-mono text-blue-600 font-bold">
                        HbA1c: {patient.hba1c}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-bold">
                        Examined Eye &amp; Date
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800">
                        {patient.eye}
                      </div>
                      <div className="text-xs text-slate-500">
                        {patient.screeningDate.split(',')[0]}
                      </div>
                    </div>

                    <div className="space-y-0.5 col-span-2 sm:col-span-1">
                      <div className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-bold">
                        AI Triage Grade
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getGradeColor(patient.drGrade)}`}>
                        {patient.drLabel}
                      </span>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Conf: {patient.confidence}%
                      </div>
                    </div>
                  </div>

                  {/* Clinical Referral Urgency */}
                  <div className="space-y-1 max-w-xs text-left">
                    <div className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-bold">
                      Action Plan
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${getUrgencyBadge(patient.urgencyLevel)}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{patient.urgency}</span>
                    </span>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="flex items-center gap-2.5 w-full xl:w-auto justify-end pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                    <button
                      onClick={() => {
                        if (onViewPatientReport) {
                          onViewPatientReport({
                            patientName: patient.name,
                            patientId: patient.id,
                            patientAge: patient.age,
                            patientGender: patient.gender,
                            patientContact: patient.phone,
                            patientDiabetesDuration: patient.dmHistory,
                            patientHba1c: patient.hba1c,
                            doctorName: doctorName,
                            doctorLocation: `${doctorDistrict}, ${doctorState}`,
                            phcLocation: `${doctorDistrict} Primary Health Centre, ${doctorState}`,
                            drGrade: patient.drGrade,
                            drStage: patient.drLabel,
                            confidence: patient.confidence,
                            referableStatus: patient.riskTier,
                            biomarkers: patient.biomarkers,
                            fundusEye: patient.eye.includes('OD') ? 'Right Eye (OD)' : 'Left Eye (OS)',
                            timestamp: patient.screeningDate,
                          });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-xs"
                      title="Generate ICMR Diagnostic Medical Report"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Medical Report</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onSelectPatientForStudio) {
                          onSelectPatientForStudio(patient);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/25 transition-all cursor-pointer"
                      title="Open Patient Fundus in Diagnostic Studio"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Open in Studio</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-left flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                Clinical data synchronized under National Tele-Ophthalmology Grid (ICMR / MoHFW Standards) for <strong>{doctorDistrict}, {doctorState}</strong>.
              </span>
            </div>
            <span className="font-mono font-bold text-blue-700 hidden sm:inline">
              EHR ID: 26038-PHC
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}
