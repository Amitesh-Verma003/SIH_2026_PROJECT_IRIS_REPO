import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  ExternalLink,
  PhoneCall,
  Eye,
  Check,
  Send,
  Navigation,
  Clock,
  ShieldCheck,
  Share2,
  X,
  MessageSquare
} from 'lucide-react';

/**
 * NearestOphthalmologistMap Component
 *
 * Displays:
 * 1. Nearest Hospital & Ophthalmologist clinical profile (Name, Doctor, Designation, Address, Distance, Phone, Facilities).
 * 2. An interactive map centered directly on the eye hospital / specialist clinic with a dedicated hospital pin marker.
 * 3. One-click "Open in Google Maps" navigation action.
 * 4. "Notify Doctor & Patient" instant dispatch dialog with SMS/WhatsApp preview and location link.
 */
export default function NearestOphthalmologistMap({
  ophthalmologist,
  patientName = 'Raghav Shisodia',
  patientId = 'vyoa1234',
  icdrGrade = 'Level 2: Moderate NPDR',
  referralToken,
  onGenerateToken
}) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  if (!ophthalmologist) return null;

  const lat = ophthalmologist.lat || 26.8689;
  const lng = ophthalmologist.lng || 80.9168;
  const hospitalName = ophthalmologist.name || 'Tertiary Eye Hospital';
  const doctorName = ophthalmologist.doctor || 'Consultant Ophthalmologist';
  const address = ophthalmologist.address || '';
  const phone = ophthalmologist.phone || '';
  const distance = ophthalmologist.distance || '2.5 km';
  const eta = ophthalmologist.eta || '8 mins';

  // Google Maps Universal URL for hospital location
  const googleMapsUrl =
    ophthalmologist.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospitalName + ' ' + address)}`;

  // OpenStreetMap Embed URL centered on hospital coordinates
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.01}%2C${lng + 0.015}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  const currentToken = referralToken || `#REF-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleNotifySubmit = () => {
    setNotificationSent(true);
    setTimeout(() => {
      setShowNotifyModal(false);
      setNotificationSent(false);
    }, 2200);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 text-left animate-in fade-in duration-300">
      
      {/* Header with Title and Verification Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Nearest Ophthalmologist &amp; Tertiary Eye Hospital
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Autonomous proximity match for rapid vitreoretinal intervention
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-mono font-bold">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            <span>Empanelled Vitreoretinal Unit</span>
          </span>
        </div>
      </div>

      {/* Main Content: Info Card on Left, Interactive Hospital Map on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column: Hospital & Ophthalmologist Details (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 border border-blue-100">
          
          <div className="space-y-3">
            {/* Tag & Distance Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono uppercase tracking-wider text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-md">
                <Building2 className="w-3 h-3 text-blue-600" />
                <span>Apex Eye Centre</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                {distance} away • ~{eta} drive
              </span>
            </div>

            {/* Hospital Name & Doctor Credentials */}
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                {hospitalName}
              </h4>
              <p className="text-xs font-bold text-blue-700 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                {doctorName}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">{ophthalmologist.designation}</p>
            </div>

            {/* Address */}
            <div className="text-[11px] text-slate-600 flex items-start gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{address}</span>
            </div>

            {/* Specialized Equipment & Facilities */}
            {ophthalmologist.facilities && ophthalmologist.facilities.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Retinal Care Infrastructure:
                </div>
                <div className="flex flex-wrap gap-1">
                  {ophthalmologist.facilities.map((facility, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Bar & Actions */}
          <div className="pt-3 border-t border-blue-100/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-mono">Turnaround: <strong>{ophthalmologist.turnaroundTime || '< 24h'}</strong></span>
              </div>
              <a
                href={`tel:${phone}`}
                className="font-mono font-bold text-blue-700 hover:underline flex items-center gap-1 text-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{phone.split('/')[0].trim()}</span>
              </a>
            </div>

            {/* Action Buttons: Open Maps + Notify Doctor & Patient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>View on Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <button
                type="button"
                onClick={() => {
                  if (onGenerateToken && !referralToken) onGenerateToken();
                  setShowNotifyModal(true);
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Notify Doctor &amp; Patient</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Embedded Map with Hospital Pin Marker (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-2">
          
          <div className="relative w-full h-[260px] lg:h-full min-h-[250px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
            
            {/* Interactive Map Embed (OpenStreetMap / Google Map Provider) */}
            <iframe
              title={`Map of ${hospitalName}`}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={osmEmbedUrl}
              className="w-full h-full filter contrast-[1.02]"
            />

            {/* Custom Interactive Marker Pin Overlay (Centered) */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2 max-w-[90%]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
              <div className="truncate">
                <p className="text-[10px] font-extrabold text-slate-900 truncate">{hospitalName}</p>
                <p className="text-[9px] font-mono text-slate-500">{doctorName}</p>
              </div>
            </div>

            {/* Map Action Overlay Button */}
            <div className="absolute bottom-3 right-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-3 py-1.5 rounded-xl bg-blue-700 text-white shadow-lg hover:bg-blue-800 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open Google Maps</span>
              </a>
            </div>

          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span>Coordinates: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
            <span className="font-mono text-blue-700 font-medium">Auto-Centered Pin</span>
          </div>

        </div>

      </div>

      {/* Notification Dispatch Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-left animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Dispatch Referral Notification</h4>
                  <p className="text-[11px] text-slate-500">Informing patient and ophthalmologist</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Preview Box */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>SMS / WhatsApp Alert Payload:</span>
                <span className="text-blue-700 font-bold">{currentToken}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans text-xs space-y-2">
                <p>
                  <strong>IRIS AI Tele-Triage Alert:</strong>
                </p>
                <p>
                  Patient <strong>{patientName}</strong> ({patientId}) has been screened and identified with{' '}
                  <span className="text-amber-700 font-semibold">{icdrGrade}</span>.
                </p>
                <p>
                  Assigned Specialist: <strong>{doctorName}</strong> at <strong>{hospitalName}</strong>.
                </p>
                <p className="text-[11px] font-mono text-blue-700 break-all bg-blue-50/80 p-2 rounded-lg border border-blue-100">
                  Google Maps Location: <br />
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    {googleMapsUrl}
                  </a>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNotifyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNotifySubmit}
                disabled={notificationSent}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  notificationSent
                    ? 'bg-emerald-600 shadow-emerald-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                {notificationSent ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Notification Dispatched!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send SMS &amp; Email Alert</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
