import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, X, BookOpen } from 'lucide-react';

interface TeachableMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
  onStartTraining: (assignmentId?: string) => void;
}

export const TeachableMomentModal: React.FC<TeachableMomentModalProps> = ({
  isOpen,
  onClose,
  result,
  onStartTraining
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#0F1523] border border-rose-500/40 rounded-3xl shadow-2xl p-6 relative overflow-hidden flex flex-col space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient rose warning glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0 animate-bounce">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                CyberShield by TerraMind • Hoxhunt Teachable Moment
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">You Clicked a Simulated Phishing Link</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Immediate Impact Badge */}
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-300">Live Backend Telemetry Recorded</span>
            <span className="font-mono text-rose-400 font-bold">Risk +{result.riskDelta} pts</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            Your risk score increased from <span className="font-bold text-white">{result.previousScore}</span> to <span className="font-bold text-rose-300">{result.newScore}</span>. Your account status is now <span className="underline font-bold">Remediation Required</span>.
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            {result.reason}
          </p>
        </div>

        {/* Red Flags Breakdown */}
        {result.campaign?.red_flags && result.campaign.red_flags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>What To Look For Next Time:</span>
            </h4>
            <div className="space-y-1.5">
              {result.campaign.red_flags.map((flag: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Micro-Training Callout */}
        {result.trainingModule && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300">Targeted Micro-Training Assigned</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Est: 3 mins</span>
            </div>
            <p className="text-xs text-slate-200 font-semibold">{result.trainingModule.title}</p>
            <p className="text-[11px] text-slate-400">
              Completing this 3-minute quiz will immediately clear your remediation status and reduce your vulnerability index.
            </p>

            <button
              onClick={() => {
                onClose();
                onStartTraining(result.trainingModule.assignmentId);
              }}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-glow-indigo transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Begin Micro-Training Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Review Later in Micro-Training Tab
          </button>
        </div>
      </div>
    </div>
  );
};
