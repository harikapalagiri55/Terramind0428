import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { InboxEmail } from '../../types';
import { 
  Inbox, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  Trash2, 
  Archive, 
  Star, 
  RotateCw, 
  ShieldAlert,
  Search,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { TeachableMomentModal } from './TeachableMomentModal';
import { ReportCelebrationModal } from './ReportCelebrationModal';

interface EmployeeMailboxProps {
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onNavigateToTraining: (assignmentId?: string) => void;
}

export const EmployeeMailbox: React.FC<EmployeeMailboxProps> = ({
  onNotification,
  onNavigateToTraining
}) => {
  const { user, refreshUser } = useAuth();
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<InboxEmail | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [teachableResult, setTeachableResult] = useState<any | null>(null);
  const [reportResult, setReportResult] = useState<any | null>(null);

  const employeeId = user?.employee?.id || 'emp_alex';

  const loadInbox = async () => {
    try {
      const data = await api.getInbox(employeeId);
      setEmails(data.emails);
      if (data.emails.length > 0 && !selectedEmail) {
        setSelectedEmail(data.emails[0]);
      }
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, [employeeId]);

  // Handle opening an email
  const handleSelectEmail = async (email: InboxEmail) => {
    setSelectedEmail(email);
    if (email.isSimulation && email.campaignId && email.status === 'delivered') {
      try {
        await api.openSimulation(email.campaignId, employeeId);
        // Mark locally as opened
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: 'opened', isUnread: false } : e));
      } catch (err) {
        console.error('Failed to log open event:', err);
      }
    }
  };

  // Intercept click on simulated phishing link
  const handleSimulatedLinkClick = async () => {
    if (!selectedEmail || !selectedEmail.isSimulation || !selectedEmail.campaignId) return;

    try {
      const result = await api.clickPhishingLink(selectedEmail.campaignId, employeeId);
      setTeachableResult(result);
      // Update email status locally
      setEmails(prev => prev.map(e => e.id === selectedEmail.id ? { ...e, status: 'clicked' } : e));
      if (selectedEmail) setSelectedEmail({ ...selectedEmail, status: 'clicked' });
      await refreshUser();
      onNotification('Interaction recorded: Phishing link clicked. Remediation triggered.', 'warning');
    } catch (err) {
      console.error('Click error:', err);
    }
  };

  // Click on Hoxhunt-style "Report Phish" button
  const handleReportPhish = async () => {
    if (!selectedEmail || !selectedEmail.isSimulation || !selectedEmail.campaignId) {
      onNotification('This is a verified internal corporate email, not a threat.', 'info');
      return;
    }

    try {
      const result = await api.reportPhishing(selectedEmail.campaignId, employeeId);
      setReportResult(result);
      // Update email status locally
      setEmails(prev => prev.map(e => e.id === selectedEmail.id ? { ...e, status: 'reported' } : e));
      if (selectedEmail) setSelectedEmail({ ...selectedEmail, status: 'reported' });
      await refreshUser();
      onNotification('Threat successfully detected and reported to SOC!', 'success');
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Alert if employee requires remediation */}
      {user?.employee?.remediationStatus === 'remediation_required' && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Security Remediation Required:</span> You recently failed a simulated phishing drill.
            </div>
          </div>
          <button
            onClick={() => onNavigateToTraining()}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] whitespace-nowrap transition-all"
          >
            Take 3-Min Micro-Quiz Now &rarr;
          </button>
        </div>
      )}

      {/* Main Mailbox Container */}
      <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[750px]">
        
        {/* Mailbox Top Header */}
        <div className="p-4 border-b border-slate-800 bg-[#070A12]/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-0.5">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CyberShield by TerraMind
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Hoxhunt Protected
                </span>
              </div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Enterprise Mailbox</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-indigo-400 font-mono font-normal">{user?.employee?.email || 'alex.dev@cybershield.corp'}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadInbox}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl text-xs flex items-center space-x-1"
              title="Refresh inbox"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mailbox Body: 2 Columns (Email List & Email Viewer) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Column 1: Emails List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/40 overflow-hidden">
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search corporate mail..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-500">Loading inbox...</div>
              ) : emails.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">Inbox empty</div>
              ) : (
                emails.map((mail) => {
                  const isSelected = selectedEmail?.id === mail.id;
                  return (
                    <div
                      key={mail.id}
                      onClick={() => handleSelectEmail(mail)}
                      className={`p-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/15 border-l-4 border-l-indigo-500'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-xs truncate ${mail.isUnread ? 'font-black text-white' : 'font-semibold text-slate-300'}`}>
                          {mail.senderName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 ml-2">
                          {new Date(mail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className={`text-xs truncate mb-1 ${mail.isUnread ? 'font-bold text-slate-200' : 'text-slate-400'}`}>
                        {mail.subject}
                      </p>

                      <div className="flex items-center space-x-2 mt-1">
                        {mail.isSimulation ? (
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                            mail.status === 'clicked'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : mail.status === 'reported'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {mail.status === 'clicked' ? 'CLICKED' : mail.status === 'reported' ? 'REPORTED' : 'SIMULATION DRILL'}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-slate-800 text-slate-400">
                            INTERNAL
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Email Viewer (7 cols) */}
          <div className="md:col-span-7 flex flex-col bg-[#0B0F19] overflow-hidden">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Email Viewer Top Toolbar */}
                <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedEmail.status === 'clicked'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : selectedEmail.status === 'reported'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {selectedEmail.status ? selectedEmail.status.toUpperCase() : 'VERIFIED'}
                    </span>
                  </div>

                  {/* HOXHUNT-STYLE REPORT PHISH BUTTON */}
                  {selectedEmail.isSimulation && selectedEmail.status !== 'reported' && (
                    <button
                      onClick={handleReportPhish}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-glow-emerald transition-all transform hover:scale-[1.03]"
                      title="Report this suspicious email using Hoxhunt Threat Reporter"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>🛡️ Report with Hoxhunt</span>
                      <span className="px-1.5 py-0.5 text-[9px] bg-slate-950/20 text-slate-950 rounded font-mono font-extrabold">+50 XP</span>
                    </button>
                  )}

                  {selectedEmail.status === 'reported' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reported & Neutralized</span>
                    </span>
                  )}
                </div>

                {/* Email Envelope Header */}
                <div className="p-5 border-b border-slate-800 space-y-2 bg-slate-900/20">
                  <h3 className="text-base font-bold text-white">{selectedEmail.subject}</h3>
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <div>
                      From: <span className="font-semibold text-slate-200">{selectedEmail.senderName}</span>{' '}
                      <span className="font-mono text-slate-400">&lt;{selectedEmail.senderEmail}&gt;</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      {new Date(selectedEmail.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Email Body & Intercepted Phishing Link */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-950/80 space-y-4">
                  {selectedEmail.isSimulation && (
                    <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span>Interactive Simulation Drill. Test clicking the link or clicking "Report Suspicious Email" above!</span>
                      </div>
                    </div>
                  )}

                  {/* Rendered Email Content */}
                  <div 
                    className="p-5 rounded-2xl bg-white text-slate-900 shadow-sm border border-slate-200"
                    onClick={(e) => {
                      // Intercept link clicks inside the simulated email
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'A' || target.closest('a')) {
                        e.preventDefault();
                        handleSimulatedLinkClick();
                      }
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }} />
                  </div>

                  {/* Direct Simulated Action Link (if user prefers explicit trigger button) */}
                  {selectedEmail.isSimulation && selectedEmail.linkText && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
                      <p className="text-xs text-slate-400">Simulated Action Link in email:</p>
                      <button
                        onClick={handleSimulatedLinkClick}
                        className="px-5 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-glow-rose flex items-center justify-center space-x-2 mx-auto"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Click Simulated Link: "{selectedEmail.linkText}"</span>
                      </button>
                      <p className="text-[10px] text-slate-500">
                        (Clicking tests the live backend link recording & micro-training enrollment flow)
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Select an email from the left pane to view
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Teachable Moment Modal (Link clicked) */}
      <TeachableMomentModal
        isOpen={!!teachableResult}
        onClose={() => setTeachableResult(null)}
        result={teachableResult}
        onStartTraining={(assignmentId) => {
          setTeachableResult(null);
          onNavigateToTraining(assignmentId);
        }}
      />

      {/* Report Celebration Modal (Reported via button) */}
      <ReportCelebrationModal
        isOpen={!!reportResult}
        onClose={() => setReportResult(null)}
        result={reportResult}
      />
    </div>
  );
};
