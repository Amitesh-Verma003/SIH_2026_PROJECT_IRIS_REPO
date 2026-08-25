import React, { useState } from 'react';
import { 
  Cpu, 
  Radio, 
  Activity, 
  Server, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Zap, 
  Clock, 
  HardDrive,
  RefreshCw,
  SignalHigh
} from 'lucide-react';
import { PHC_DISTRICT_NODES, TELEMEDICINE_STATS } from '../assets/fundus-data';

export default function SimulinkTelemetry() {
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  return (
    <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-grid-slate opacity-5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
          <div className="text-left space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>Simulink Edge Telemetry Hub</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Rural Tele-Ophthalmology Network Matrix
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Synchronizing 50 Primary Health Centers across high-burden districts with low-latency edge inference and bandwidth-adaptive image transmission.
            </p>
          </div>

          {/* Low Bandwidth Compression Toggle */}
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-2 text-left">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Simulink Wavelet Compression:
              </span>
              <button
                onClick={() => setCompressionEnabled(!compressionEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  compressionEnabled ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    compressionEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {compressionEnabled ? (
                <span className="text-emerald-400 font-bold">ACTIVE: 8.4 : 1 Ratio (2.8MB per scan)</span>
              ) : (
                <span className="text-slate-400">RAW DICOM: Uncompressed (24.2MB per scan)</span>
              )}
            </div>
          </div>
        </div>

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 text-left">
            <div className="text-xs text-slate-400 font-medium">Total Rural Screenings</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {TELEMEDICINE_STATS.totalScreened.toLocaleString('en-IN')}+
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              <span>+1,420 today</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 text-left">
            <div className="text-xs text-slate-400 font-medium">Active PHC Tele-Nodes</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono mt-1">
              {TELEMEDICINE_STATS.phcNodesOnline} / 50 Online
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
              <span>100% Uptime (24h)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 text-left">
            <div className="text-xs text-slate-400 font-medium">Avg Triage Latency</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
              {TELEMEDICINE_STATS.averageTriageTimeSec}s
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
              <span>Doctor Review Turnaround</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 text-left">
            <div className="text-xs text-slate-400 font-medium">SLA Compliance</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
              {TELEMEDICINE_STATS.specialistSlaAdherence}%
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              <span>&lt;24 Hour Specialist Sign-off</span>
            </div>
          </div>
        </div>

        {/* Live PHC District Nodes Table */}
        <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700 overflow-hidden text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SignalHigh className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">
                Live District Primary Health Center (PHC) Node Matrix
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Auto-polled every 5s
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Node ID</th>
                  <th className="py-3 px-4">Center / District</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Connectivity</th>
                  <th className="py-3 px-4">Edge Device</th>
                  <th className="py-3 px-4">Throughput</th>
                  <th className="py-3 px-4">Queue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {PHC_DISTRICT_NODES.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-300">{node.id}</td>
                    <td className="py-3.5 px-4 text-slate-200 font-sans font-semibold">{node.name}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans">{node.state}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        node.status === 'Online'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'Online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {node.status} ({node.latency})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{node.edgeDevice}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">{node.throughput}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {node.queue} scans
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
