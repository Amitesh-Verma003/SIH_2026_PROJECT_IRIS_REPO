import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  IdCard 
} from 'lucide-react';
import { createPatient } from '../api/patients';
import { listFacilities } from '../api/facilities';

const INDIAN_STATES_DISTRICTS = {
  'Uttar Pradesh': ['Varanasi', 'Gorakhpur', 'Lucknow', 'Prayagraj', 'Kanpur', 'Sitapur', 'Jhansi', 'Agra', 'Bareilly', 'Mirzapur', 'Bundelkhand'],
  'Maharashtra': ['Gadchiroli', 'Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Thane'],
  'Karnataka': ['Belagavi', 'Bengaluru Urban', 'Mysuru', 'Hubballi-Dharwad', 'Kalaburagi', 'Mangaluru', 'Ballari', 'Davangere'],
  'Bihar': ['Patna', 'Muzaffarpur', 'Gaya', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Begusarai', 'Saharsa'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Thanjavur', 'Vellore'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa', 'Satna'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Bardhaman', 'Malda'],
  'Delhi NCR': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda']
};

export default function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    doctorName: 'Dr. Ananya Sharma',
    mobile: '9876543210',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    patientName: 'Harish Chandra Verma',
    patientId: 'vyom1234',
  });

  const [districtsList, setDistrictsList] = useState(INDIAN_STATES_DISTRICTS['Uttar Pradesh']);
  const [step, setStep] = useState(1); // 1 = Details form, 2 = OTP verification
  const [otp, setOtp] = useState(['0', '0', '0', '0']);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpInputsRef = useRef([]);

  // Handle State selection change and update District list
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData(prev => ({
      ...prev,
      state: selectedState,
      district: INDIAN_STATES_DISTRICTS[selectedState]?.[0] || '',
    }));
    setDistrictsList(INDIAN_STATES_DISTRICTS[selectedState] || []);
  };

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!formData.doctorName.trim()) {
      alert('Please enter doctor / clinician name');
      return;
    }
    if (!formData.mobile || formData.mobile.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!formData.patientName.trim()) {
      alert('Please enter patient name');
      return;
    }
    if (!formData.patientId.trim()) {
      alert('Please enter patient ID');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
      setCountdown(30);
      setOtpError('');
    }, 300);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleAutoFillDemoOtp = () => {
    setOtp(['0', '0', '0', '0']);
    setOtpError('');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    // OTP verification check: accepts "0000" as specified
    if (enteredOtp === '0000') {
      setIsSubmitting(true);
      try {
        // Persist patient to backend database
        let backendPatientId = null;
        try {
          const patientResponse = await createPatient({
            full_name: formData.patientName.trim(),
            abha_id: formData.patientId.trim() || null,
            phone: formData.mobile.trim(),
            gender: null,
            date_of_birth: null,
          });
          backendPatientId = patientResponse.id;
          console.log('[IRIS] Patient persisted to backend:', backendPatientId);
        } catch (apiErr) {
          // Non-blocking — if backend is down, continue with local-only mode
          console.warn('[IRIS] Backend patient creation failed (continuing in local mode):', apiErr.message);
        }

        // Resolve facility from backend database
        let backendFacilityId = null;
        try {
          const facilities = await listFacilities({ is_active: true, limit: 100 });
          if (facilities && facilities.length > 0) {
            const match = facilities.find(f => 
              f.name.toLowerCase().includes(formData.district.toLowerCase()) || 
              (f.address && f.address.toLowerCase().includes(formData.district.toLowerCase()))
            );
            backendFacilityId = match ? match.id : facilities[0].id;
            console.log('[IRIS] Facility resolved for session:', backendFacilityId);
          }
        } catch (fErr) {
          console.warn('[IRIS] Facility lookup failed (continuing in local mode):', fErr.message);
        }

        const userData = {
          name: formData.doctorName.trim(),
          mobile: formData.mobile.trim(),
          state: formData.state,
          district: formData.district,
          patientName: formData.patientName.trim(),
          patientId: formData.patientId.trim() || 'vyom1234',
          role: 'Tele-Ophthalmologist / Clinician',
          loginTime: new Date().toISOString(),
          backendPatientId, // UUID from DB, or null if offline
          backendFacilityId, // UUID from DB, or null if offline
        };
        localStorage.setItem('iris_ai_user', JSON.stringify(userData));
        if (onLoginSuccess) onLoginSuccess(userData);
      } catch (err) {
        console.error('[IRIS] Login flow error:', err);
        setOtpError('Something went wrong. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setOtpError('Invalid OTP! Please enter 0000 (Default Demo OTP).');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 bg-grid-slate flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-x-hidden text-slate-900">
      
      {/* Soft Radial Background Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Full-Width Container (Takes 100% width of the screen) */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto flex flex-col items-center space-y-6">
        
        {/* IRIS AI Logo & Name */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <img
            src="/eye-logo.png"
            alt="IRIS AI Logo"
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,140,255,0.35)]"
          />
          <h1 className="font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-900">
            IRIS<span className="text-blue-600"> AI</span>
          </h1>
        </div>

        {/* The Full-Width Clean Clinical Form Card */}
        <div className="w-full bg-white rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-xl border border-slate-200 text-left space-y-7 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {step === 1 ? 'Clinician & Patient Authentication' : 'Verify Mobile OTP'}
              </h2>
              <span className="text-xs sm:text-sm font-mono font-bold px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Step {step} of 2
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {step === 1 
                ? 'Enter doctor credentials, field location, and patient ID to initiate screening.' 
                : 'Enter the 4-digit verification code sent to your registered mobile device.'}
            </p>
          </div>

          {/* STEP 1: FORM */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6 w-full">
              
              {/* SECTION A: DOCTOR / CLINICIAN CREDENTIALS */}
              <div className="space-y-4">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-700 font-mono flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>SECTION A: DOCTOR / CLINICIAN CREDENTIALS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700">
                      Doctor Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Ananya Sharma"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      className="w-full px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700">
                      Mobile Number (10 Digits)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-sm font-bold text-slate-500 font-mono">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-14 pr-4 py-3 text-sm sm:text-base font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>State</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={handleStateChange}
                      className="w-full px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
                    >
                      {Object.keys(INDIAN_STATES_DISTRICTS).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>District / PHC Unit</span>
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
                    >
                      {districtsList.map(dt => (
                        <option key={dt} value={dt}>{dt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION B: PATIENT INFORMATION */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-700 font-mono flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-blue-600" />
                    <span>SECTION B: PATIENT INFORMATION</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Active Screening ID
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Harish Chandra Verma"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="w-full px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-bold text-slate-700">
                        Patient ID
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, patientId: 'vyom1234' })}
                        className="text-xs text-blue-600 font-mono font-bold hover:underline cursor-pointer"
                      >
                        Set to vyom1234
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="vyom1234"
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      className="w-full px-4 py-3 text-sm sm:text-base font-mono font-bold text-blue-700 bg-blue-50/60 border border-blue-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button (Full Width) */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Sending Verification OTP...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center pt-1">
                <span className="text-xs sm:text-sm text-slate-500 font-mono">
                  Default Evaluation OTP: <strong className="text-blue-700">0000</strong>
                </span>
              </div>

            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
              
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 text-left space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-blue-900">OTP Sent to Mobile:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">+91 {formData.mobile}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 block">Clinician:</span>
                    <span className="font-bold text-slate-800">{formData.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Patient Name &amp; ID:</span>
                    <span className="font-bold text-blue-700 font-mono">{formData.patientName} ({formData.patientId})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
                  Enter 4-Digit Authentication Code:
                </label>

                <div className="flex items-center justify-center gap-3 sm:gap-5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-16 h-18 sm:w-20 sm:h-22 text-2xl sm:text-4xl font-mono font-extrabold text-center text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-rose-600 animate-bounce">
                    <AlertCircle className="w-4 h-4" />
                    <span>{otpError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleAutoFillDemoOtp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Auto-Fill Demo OTP (0000)</span>
                </button>
              </div>

              <div className="space-y-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Verify & Launch Screening Suite'}</span>
                </button>

                <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:underline cursor-pointer font-bold"
                  >
                    &larr; Edit Details / Patient
                  </button>

                  <div>
                    {countdown > 0 ? (
                      <span>Resend in <strong className="font-mono text-slate-800">{countdown}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCountdown(30)}
                        className="text-blue-600 hover:underline cursor-pointer font-bold"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
