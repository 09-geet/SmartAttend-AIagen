import React from 'react';
import { 
  Sparkles, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle, 
  BrainCircuit, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { Student, AttendanceRecord } from '../types';

interface AiInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  records: AttendanceRecord[];
}

export const AiInsightsModal: React.FC<AiInsightsModalProps> = ({
  isOpen,
  onClose,
  students,
  records,
}) => {
  if (!isOpen) return null;

  const total = students.length;
  const present = records.filter(r => r.status === 'present').length;
  const late = records.filter(r => r.status === 'late').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">SmartAttend AI™ Predictive Insights</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Neural Telemetry Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Automated pattern detection & behavioral forecasting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Insight 1: Punctuality Cluster */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 text-sm">Peak Arrival Distribution</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">High Density</span>
              </div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                73% of biometric scans occur between <span className="text-indigo-300 font-mono">08:58 AM – 09:05 AM</span>. Kiosk optical latency maintained at 14ms with zero queuing delays.
              </p>
            </div>
          </div>

          {/* Insight 2: Defaulter Risk Vector */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-rose-200 text-sm">Attrition Risk Warning (2 Students)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">Action Required</span>
              </div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                <span className="text-rose-300 font-medium">Marcus Vance (CS-2024-004)</span> and <span className="text-rose-300 font-medium">David O'Connor (CS-2024-007)</span> show persistent absenteeism on Friday morning lectures. Neural model predicts high exam disqualification probability unless counseling is triggered.
              </p>
            </div>
          </div>

          {/* Insight 3: Biometric Security & Anti-Spoof Health */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 text-sm">3D Liveness & Anti-Spoof Integrity</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">100% Secure</span>
              </div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Optical depth checks and eye-blink verification rejected simulated phone screen proxy attacks with zero false admissions recorded today.
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-purple-200 text-sm">Recommended Automated Action</span>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Schedule automated SMS notification 15 minutes before the 11:00 AM Computer Vision lecture to reduce tardiness in the Robotics batch.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-600/30 transition-all"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
