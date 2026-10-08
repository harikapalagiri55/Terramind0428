import React, { useState, useEffect } from 'react';
import { Campaign, PhishingTemplate } from '../../types';
import { api } from '../../api';
import { 
  Plus, 
  Play, 
  Pause, 
  CheckCircle, 
  Mail, 
  Sparkles, 
  X, 
  Eye
} from 'lucide-react';
import { Avatar } from '../Avatar';

interface CampaignManagerProps {
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({ onNotification }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<PhishingTemplate[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  // Form states for creating campaign
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDepartmentId, setTargetDepartmentId] = useState('');
  const [targetRole, setTargetRole] = useState('All');
  const [templateId, setTemplateId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Template synthesis modal inside wizard
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthRole, setSynthRole] = useState('Developer');
  const [synthTopic, setSynthTopic] = useState('');
  const [synthBrand, setSynthBrand] = useState('CyberShield Corp');
  const [synthDifficulty, setSynthDifficulty] = useState('Medium');

  const loadData = async () => {
    try {
      const [cmpRes, tplRes, statsRes] = await Promise.all([
        api.getCampaigns(),
        api.getTemplates(),
        api.getDashboardStats()
      ]);
      setCampaigns(cmpRes.campaigns);
      setTemplates(tplRes.templates);
      setDepartments(statsRes.departments);
      if (tplRes.templates.length > 0 && !templateId) {
        setTemplateId(tplRes.templates[0].id);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLaunch = async (id: string) => {
    try {
      await api.launchCampaign(id);
      onNotification('Campaign launched! Phishing simulations dispatched to mailboxes.', 'success');
      loadData();
    } catch {
      onNotification('Failed to launch campaign', 'warning');
    }
  };

  const handlePause = async (id: string) => {
    try {
      await api.pauseCampaign(id);
      onNotification('Campaign paused', 'info');
      loadData();
    } catch {
      onNotification('Failed to pause campaign', 'warning');
    }
  };

  const handleEnd = async (id: string) => {
    try {
      await api.endCampaign(id);
      onNotification('Campaign marked as completed', 'info');
      loadData();
    } catch {
      onNotification('Failed to end campaign', 'warning');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await api.getCampaign(id);
      setSelectedCampaign(res.campaign);
    } catch {
      onNotification('Failed to load campaign details', 'warning');
    }
  };

  const handleSynthesizeTemplate = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.synthesizeTemplate({
        targetRole: synthRole,
        topic: synthTopic,
        brand: synthBrand,
        difficulty: synthDifficulty
      });
      onNotification(`Dynamic ${synthRole} phishing template synthesized!`, 'success');
      setTemplates([res.template, ...templates]);
      setTemplateId(res.template.id);
      setIsSynthesizing(false);
    } catch {
      onNotification('Template synthesis failed', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateId) {
      onNotification('Please provide a campaign name and select a template', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.createCampaign({
        name,
        description,
        targetDepartmentId: targetDepartmentId === 'all' ? undefined : targetDepartmentId,
        targetRole: targetRole === 'All' ? undefined : targetRole,
        templateId
      });
      onNotification(`Campaign "${name}" launched! ${res.targetsDelivered} simulation targets delivered.`, 'success');
      setIsCreateOpen(false);
      setName('');
      setDescription('');
      loadData();
    } catch (err: any) {
      onNotification(err.message || 'Failed to create campaign', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplateObj = templates.find(t => t.id === templateId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              CyberShield by TerraMind
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Hoxhunt Adaptive Simulations
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Adaptive Phishing Campaigns</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {campaigns.length} Active / Historical
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate realistic role-based spear-phishing attacks powered by Hoxhunt behavioral models to measure risk and trigger micro-remediation
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow-indigo transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Drill Campaign</span>
        </button>
      </div>

      {/* Campaigns Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800">
          <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No campaigns launched yet</p>
          <p className="text-xs text-slate-500 mt-1">Create your first role-targeted phishing campaign to begin employee risk testing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((cmp) => (
            <div
              key={cmp.id}
              className="p-5 rounded-3xl glass-card border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cmp.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : cmp.status === 'paused'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {cmp.status}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2 font-mono">
                      Role: <strong className="text-slate-300">{cmp.target_role || 'All Roles'}</strong>
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(cmp.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{cmp.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{cmp.description}</p>

                {/* Scenario details */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs mb-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="text-slate-400">Scenario Vector:</span>
                    <span className="font-semibold text-indigo-300">{cmp.scenario || cmp.template_title}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
                    <span className="text-slate-400">Difficulty:</span>
                    <span className="font-semibold text-amber-300">{cmp.difficulty || 'Medium'}</span>
                  </div>
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Targets</span>
                    <strong className="text-slate-200">{cmp.total_targets}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-sky-400 block">Opened</span>
                    <strong className="text-sky-300">{cmp.opened_count}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-400 block">Clicked</span>
                    <strong className="text-rose-400">{cmp.clicked_count} ({cmp.clickRate}%)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block">Reported</span>
                    <strong className="text-emerald-400">{cmp.reported_count} ({cmp.reportRate}%)</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleViewDetails(cmp.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Targets ({cmp.total_targets})</span>
                </button>

                <div className="flex items-center space-x-2">
                  {cmp.status === 'active' ? (
                    <button
                      onClick={() => handlePause(cmp.id)}
                      className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs"
                      title="Pause campaign"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLaunch(cmp.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs"
                      title="Resume/Launch campaign"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {cmp.status !== 'completed' && (
                    <button
                      onClick={() => handleEnd(cmp.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
                      title="End campaign"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaign Details Drawer / Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-[#0F1523] border border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedCampaign.name}</h3>
                <p className="text-xs text-slate-400">{selectedCampaign.scenario} • {selectedCampaign.department_name || 'All Departments'}</p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Targeted Employees Status</h4>
              <div className="space-y-2">
                {selectedCampaign.targets.map((tgt: any) => (
                  <div
                    key={tgt.id}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={tgt.avatar_url}
                        name={tgt.employee_name}
                        className="w-8 h-8 rounded-full border border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-slate-200">{tgt.employee_name}</p>
                        <p className="text-[11px] text-slate-400">{tgt.role_title} • {tgt.employee_email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tgt.status === 'clicked'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : tgt.status === 'reported'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : tgt.status === 'opened'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {tgt.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-[#0F1523] border border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create & Launch Phishing Simulation</h3>
                  <p className="text-xs text-slate-400">Target departments, choose or synthesize templates, and dispatch safely</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="overflow-y-auto py-4 space-y-4 flex-1">
              {/* Campaign Name & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Q4 Cloud Token Spear-Phishing Drill"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Department</label>
                  <select
                    value={targetDepartmentId}
                    onChange={(e) => setTargetDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Departments (Enterprise Wide)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Role & Synthesizer trigger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role Category</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Roles</option>
                    <option value="Developer">Developer / Cloud Engineer</option>
                    <option value="Payroll">Payroll Specialist</option>
                    <option value="Finance">Finance & Controller</option>
                    <option value="HR">People & HR Partner</option>
                    <option value="Executive">Executive & VP</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Phishing Template</label>
                    <button
                      type="button"
                      onClick={() => setIsSynthesizing(true)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Synthesize Custom Template</span>
                    </button>
                  </div>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>[{t.target_role}] {t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Template Preview Box */}
              {selectedTemplateObj && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Simulation Template Preview</span>
                    <span className="text-[10px] text-amber-400 font-mono">Difficulty: {selectedTemplateObj.difficulty}</span>
                  </div>
                  <p className="text-xs text-slate-300"><strong>Subject:</strong> {selectedTemplateObj.subject}</p>
                  <p className="text-xs text-slate-400"><strong>From:</strong> {selectedTemplateObj.sender_name} &lt;{selectedTemplateObj.sender_email}&gt;</p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="text-indigo-400 font-semibold">Simulated Action Link:</span> "{selectedTemplateObj.simulated_link_text}"
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-glow-indigo transition-all flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Simulation Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Synthesizer Sub-Modal */}
      {isSynthesizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0F1523] border border-slate-800 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Role-Based Template Synthesizer</h3>
              </div>
              <button onClick={() => setIsSynthesizing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role Persona</label>
                <select
                  value={synthRole}
                  onChange={(e) => setSynthRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="Developer">Developer (PAT / NPM / CI/CD)</option>
                  <option value="Payroll">Payroll (Direct Deposit / Tax Form)</option>
                  <option value="Finance">Finance (Invoice / Wire Fraud)</option>
                  <option value="HR">HR (Open Enrollment / Policy)</option>
                  <option value="Executive">Executive (M&A / Board Briefing)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Company Brand Name</label>
                <input
                  type="text"
                  value={synthBrand}
                  onChange={(e) => setSynthBrand(e.target.value)}
                  placeholder="e.g. CyberShield Corp"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Difficulty</label>
                <select
                  value={synthDifficulty}
                  onChange={(e) => setSynthDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="Easy">Easy (Noticeable domain typos)</option>
                  <option value="Medium">Medium (Urgent call-to-action)</option>
                  <option value="Hard">Hard (Sophisticated credential proxy)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSynthesizing(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSynthesizeTemplate}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-glow-indigo flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
