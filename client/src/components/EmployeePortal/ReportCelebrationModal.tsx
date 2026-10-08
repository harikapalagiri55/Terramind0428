import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, Award, Flame, TrendingDown, ArrowRight, X } from 'lucide-react';

interface ReportCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
}

export const ReportCelebrationModal: React.FC<ReportCelebrationModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti explosion
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#6366F1', '#34D399', '#FBBF24']
      });
    }
  }, [isOpen]);

  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0F1523] border border-emerald-500/40 rounded-3xl shadow-2xl p-6 relative overflow-hidden flex flex-col items-center text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient emerald glow */}
        <div className="absolute top-0 w-full h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-[1px] shadow-glow-emerald">
          <div className="w-full h-full bg-[#0B0F19] rounded-[23px] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            Hoxhunt Threat Neutralized
          </span>
          <h2 className="text-xl font-black text-white mt-2">Outstanding Catch with Hoxhunt!</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            You successfully identified and reported a simulated spear-phishing attack using the Hoxhunt button in CyberShield by TerraMind.
          </p>
        </div>

        {/* Gamified Rewards Grid */}
        <div className="w-full grid grid-cols-3 gap-2 text-center p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
          <div>
            <Award className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block uppercase">Resilience XP</span>
            <strong className="text-emerald-400 font-bold font-mono">+{result.pointsAwarded} XP</strong>
          </div>
          <div>
            <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block uppercase">Streak</span>
            <strong className="text-amber-400 font-bold font-mono">{result.newStreak}x Streak</strong>
          </div>
          <div>
            <TrendingDown className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block uppercase">Risk Delta</span>
            <strong className="text-indigo-400 font-bold font-mono">{result.riskDelta} pts</strong>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Your proactive defense has been logged to the SOC Security Console and reinforced company-wide resilience.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-glow-emerald transition-all flex items-center justify-center space-x-1.5"
        >
          <span>Return to Mailbox</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
