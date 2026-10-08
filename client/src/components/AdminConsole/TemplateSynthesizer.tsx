import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { PhishingTemplate } from '../../types';
import { Sparkles, Eye, ShieldAlert, AlertTriangle, Play, Check } from 'lucide-react';

interface TemplateSynthesizerProps {
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onSelectForCampaign?: (templateId: string) => void;
}

export const TemplateSynthesizer: React.FC<TemplateSynthesizerProps> = ({ onNotification, onSelectForCampaign }) => {
  const [templates, setTemplates] = useState<PhishingTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Synthesizer Form
  const [targetRole, setTargetRole] = useState('Developer');
  const [brand, setBrand] = useState('CyberShield Corp');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Selected for preview
  const [previewTemplate, setPreviewTemplate] = useState<PhishingTemplate | null>(null);

  const loadTemplates = async () => {
    try {
      const res = await api.getTemplates();
      setTemplates(res.templates);
      if (res.templates.length > 0) setPreviewTemplate(res.templates[0]);
    } catch {
      onNotification('Failed to load templates', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSynthesizing(true);
    try {
      const res = await api.synthesizeTemplate({
        targetRole,
        brand,
        difficulty
      });
      onNotification(`Successfully synthesized new spear-phishing drill for ${targetRole}!`, 'success');
      setTemplates([res.template, ...templates]);
      setPreviewTemplate(res.template);
    } catch {
      onNotification('Failed to synthesize template', 'warning');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>CyberShield Template Synthesizer</span>
          <span className="text-xs font-semibold text-slate-400">by</span>
          <span className="text-sm font-bold text-indigo-400 font-mono">TerraMind</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Hoxhunt Simulation Model
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Synthesize high-fidelity, safe simulated attacks tailored to specialized employee workflows (Payroll, Engineering, Finance, HR)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Generator Form & Template List */}
        <div className="space-y-6">
          {/* Generator Card */}
          <div className="p-5 rounded-3xl glass-card border border-slate-800">
            <div className="flex items-center space-x-2.5 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Dynamic AI Synthesizer</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select an employee persona to generate realistic attack vectors and teachable red-flags.
            </p>

            <form onSubmit={handleSynthesize} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Role Category</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Payroll">Payroll Specialist (Direct Deposit / Tax Form)</option>
                  <option value="Developer">Developer (GitHub PAT / CI/CD Token)</option>
                  <option value="Finance">Finance / AP (Invoice / Wire Fraud)</option>
                  <option value="HR">HR / Talent (Open Enrollment / Policy)</option>
                  <option value="Executive">Executive (M&A Diligence / Whaling)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Company Brand Name</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Simulation Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Easy">Easy (Noticeable lookalike domain)</option>
                  <option value="Medium">Medium (Urgent call-to-action & branding)</option>
                  <option value="Hard">Hard (High-privilege OAuth flow)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSynthesizing}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-glow-indigo transition-all flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSynthesizing ? 'Synthesizing Drill...' : 'Synthesize New Attack Drill'}</span>
              </button>
            </form>
          </div>

          {/* Existing Templates Selector */}
          <div className="p-5 rounded-3xl glass-card border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3">Available Attack Templates ({templates.length})</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setPreviewTemplate(tpl)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all text-xs ${
                    previewTemplate?.id === tpl.id
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold truncate">{tpl.title}</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-slate-800 text-slate-300">
                      {tpl.target_role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{tpl.subject}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Realistic Email Simulation Preview */}
        <div className="lg:col-span-2 space-y-4">
          {previewTemplate ? (
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Template Inspector</span>
                  <h3 className="text-base font-bold text-white">{previewTemplate.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Difficulty: {previewTemplate.difficulty}
                  </span>
                </div>
              </div>

              {/* Email Envelope Header */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Subject:</span>
                  <span className="font-bold text-white">{previewTemplate.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sender:</span>
                  <span className="font-mono text-rose-300">{previewTemplate.sender_name} &lt;{previewTemplate.sender_email}&gt;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Role:</span>
                  <span className="text-slate-200">{previewTemplate.target_role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Simulated Link:</span>
                  <span className="font-mono text-indigo-300 truncate max-w-sm">{previewTemplate.simulated_link_url}</span>
                </div>
              </div>

              {/* Teachable Red Flags Box */}
              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Teachable Red Flags Included In This Drill:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-rose-200/90 pl-1 space-y-0.5">
                  {previewTemplate.redFlags.map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>

              {/* Safe Simulation Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero real credentials or sensitive tokens are stored. Safe sandbox simulation.</span>
              </div>

              {/* Live Rendered Email HTML Container */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-white text-slate-900 p-4">
                <div dangerouslySetInnerHTML={{ __html: previewTemplate.body_html }} />
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">Select a template to view details</div>
          )}
        </div>

      </div>
    </div>
  );
};
