import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { TrainingAssignment } from '../../types';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  TrendingDown, 
  BookOpen, 
  ShieldCheck,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface MicroTrainingModalProps {
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  selectedAssignmentId?: string;
  onCompleted?: () => void;
}

export const MicroTrainingModal: React.FC<MicroTrainingModalProps> = ({
  onNotification,
  selectedAssignmentId,
  onCompleted
}) => {
  const { user, refreshUser } = useAuth();
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<TrainingAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentStep, setCurrentStep] = useState<'lesson' | 'quiz' | 'passed'>('lesson');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeId = user?.employee?.id || 'emp_alex';

  const loadAssignments = async () => {
    try {
      const data = await api.getMyAssignments(employeeId);
      setAssignments(data.assignments);

      if (data.assignments.length > 0) {
        // If specific ID requested, select it; otherwise select first pending
        const target = selectedAssignmentId 
          ? data.assignments.find(a => a.id === selectedAssignmentId) 
          : data.assignments.find(a => a.status !== 'completed') || data.assignments[0];
        
        setActiveAssignment(target || data.assignments[0]);
        setCurrentStep(target?.status === 'completed' ? 'passed' : 'lesson');
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [employeeId, selectedAssignmentId]);

  const handleSelectAnswer = (questionIdx: number, optionIdx: number) => {
    if (submittedQuiz) return;
    setQuizAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleVerifyQuiz = async () => {
    if (!activeAssignment) return;
    
    // Check all questions answered
    const questions = activeAssignment.quiz;
    for (let i = 0; i < questions.length; i++) {
      if (quizAnswers[i] === undefined) {
        onNotification(`Please answer question ${i + 1}`, 'warning');
        return;
      }
    }

    // Calculate score
    let correct = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correct++;
    });

    const scorePct = Math.round((correct / questions.length) * 100);
    setQuizScore(scorePct);
    setSubmittedQuiz(true);

    if (scorePct >= 70) {
      setIsSubmitting(true);
      try {
        await api.completeTraining(activeAssignment.id, scorePct);
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10B981', '#6366F1', '#A855F7']
        });
        await refreshUser();
        setCurrentStep('passed');
        onNotification(`Remediation cleared! 100% quiz score. Risk reduced by 20 points!`, 'success');
        if (onCompleted) onCompleted();
        loadAssignments();
      } catch (err) {
        console.error('Failed to complete training:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onNotification('Score below 70%. Please review the indicators and try again.', 'warning');
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setSubmittedQuiz(false);
    setQuizScore(0);
    setCurrentStep('lesson');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              CyberShield by TerraMind
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Hoxhunt Micro-Remediation
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Adaptive Micro-Training Modules</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              3-Minute Targeted Lessons
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Role-specific interactive micro-learning modules powered by the Hoxhunt behavioral engine, auto-enrolled when a simulated drill is clicked
          </p>
        </div>

        {user?.employee?.remediationStatus === 'remediation_required' && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Remediation Required</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: My Assignments List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Training Queue</h3>
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              No pending training assigned. You are in good standing!
            </div>
          ) : (
            assignments.map((asg) => {
              const isSelected = activeAssignment?.id === asg.id;
              return (
                <div
                  key={asg.id}
                  onClick={() => {
                    setActiveAssignment(asg);
                    setCurrentStep(asg.status === 'completed' ? 'passed' : 'lesson');
                    setSubmittedQuiz(false);
                    setQuizAnswers({});
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/60 shadow-glow-indigo'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-indigo-300">
                      {asg.category}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      asg.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {asg.status === 'completed' ? 'PASSED' : 'REQUIRED'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1">{asg.module_title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{asg.description}</p>
                  
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Est: {asg.estimated_minutes} mins</span>
                    <span className="text-indigo-400 font-semibold">{asg.quiz.length} Questions &rarr;</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Training Content & Interactive Quiz (8 cols) */}
        <div className="lg:col-span-8">
          {activeAssignment ? (
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl space-y-6">
              
              {/* Module Header */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                    Target Role: {activeAssignment.target_role}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{activeAssignment.module_title}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentStep('lesson')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentStep === 'lesson'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    1. Threat Anatomy
                  </button>
                  <button
                    onClick={() => setCurrentStep('quiz')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentStep === 'quiz' || currentStep === 'passed'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    2. Interactive Quiz
                  </button>
                </div>
              </div>

              {/* STEP 1: Lesson & Indicators */}
              {currentStep === 'lesson' && (
                <div className="space-y-5 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-sm font-semibold text-white mb-2">{activeAssignment.description}</p>
                    <div className="prose prose-invert text-xs max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                      {activeAssignment.content_markdown}
                    </div>
                  </div>

                  {/* Indicators Checklist */}
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Key Indicators To Spot In This Attack Vector:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {activeAssignment.indicators.map((ind, i) => (
                        <div key={i} className="flex items-start space-x-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-200">{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <button
                      onClick={() => setCurrentStep('quiz')}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-glow-indigo transition-all inline-flex items-center space-x-2"
                    >
                      <span>Proceed to Interactive Quiz ({activeAssignment.quiz.length} Questions)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Interactive Quiz */}
              {currentStep === 'quiz' && (
                <div className="space-y-6">
                  {activeAssignment.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center justify-center">
                          {qIdx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white">{q.question}</h4>
                      </div>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;
                          let btnClass = 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/50 text-slate-300';
                          
                          if (submittedQuiz) {
                            if (isCorrect) {
                              btnClass = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnClass = 'bg-rose-950/40 border-rose-500/60 text-rose-200 font-semibold';
                            }
                          } else if (isSelected) {
                            btnClass = 'bg-indigo-600/20 border-indigo-500 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(qIdx, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnClass}`}
                            >
                              <span>{opt}</span>
                              {submittedQuiz && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2 flex-shrink-0" />
                              )}
                              {submittedQuiz && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-400 ml-2 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {submittedQuiz && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300">
                          <strong className="text-indigo-400">Explanation: </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentStep('lesson')}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      &larr; Back to Lesson
                    </button>

                    {!submittedQuiz ? (
                      <button
                        onClick={handleVerifyQuiz}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-glow-indigo transition-all"
                      >
                        Submit Answers & Verify
                      </button>
                    ) : quizScore < 70 ? (
                      <button
                        onClick={handleRetakeQuiz}
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Quiz (Score: {quizScore}%)</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              {/* STEP 3: Passed & Remediated Screen */}
              {currentStep === 'passed' && (
                <div className="p-8 rounded-3xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-4 animate-in fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow-emerald">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      Remediation Cleared
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2">Training Successfully Completed!</h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                      You passed <span className="font-bold text-white">"{activeAssignment.module_title}"</span> with a score of {activeAssignment.score || 100}%.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 max-w-xs mx-auto gap-3 text-xs p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Risk Score Delta</span>
                      <strong className="text-emerald-400 font-bold font-mono">-20 pts</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Resilience Bonus</span>
                      <strong className="text-purple-400 font-bold font-mono">+35 XP</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Your account has been restored to <strong className="text-emerald-300">Training Completed</strong> standing and telemetry persisted to the live database.
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">No training selected</div>
          )}
        </div>

      </div>
    </div>
  );
};
