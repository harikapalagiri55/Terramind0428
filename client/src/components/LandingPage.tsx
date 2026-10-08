import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Award, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Mail, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenAuthModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { accounts, switchProfile } = useAuth();
  const [interactiveTab, setInteractiveTab] = useState<'sample' | 'hvi' | 'remediation'>('sample');
  const [inspectedFlags, setInspectedFlags] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#070A12] text-slate-100 overflow-hidden">
      {/* Background ambient mesh glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-mesh-gradient pointer-events-none opacity-80" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>CyberShield by TerraMind</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-mono font-bold">Powered by Hoxhunt Behavioral Framework</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          CyberShield <span className="text-xl sm:text-3xl font-bold text-slate-400 block sm:inline">by TerraMind</span>
          <div className="mt-3">
            Turn <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">Human Risk</span> Into Your Strongest Defense
          </div>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Powered by the <span className="text-emerald-400 font-semibold">Hoxhunt</span> adaptive behavioral model, CyberShield by TerraMind delivers role-specific phishing simulations, explainable Human Vulnerability Indexing, and automated micro-training.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('admin')}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-glow-indigo flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch SOC Admin Console</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => onNavigate('inbox')}
            className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm transition-all flex items-center space-x-2"
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Open Simulation Mailbox</span>
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold text-sm transition-all flex items-center space-x-2"
          >
            <span>Demo ID & Password Portal</span>
          </button>
        </div>

        {/* Compliance & Trust Badges */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-400 text-xs font-semibold">
          <span className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>NIST SP 800-50 Compliant</span>
          </span>
          <span className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>ISO/IEC 27001:2022 Ready</span>
          </span>
          <span className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span>NIS2 Human Risk Architecture</span>
          </span>
          <span className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Hoxhunt Resilience Scoring</span>
          </span>
        </div>
      </section>

      {/* Interactive Showcase Section (Hoxhunt Style) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Experience The Hoxhunt-Adaptive Simulation Engine</h2>
          <p className="text-slate-400 text-sm mt-2">CyberShield by TerraMind shifts employees from security vulnerabilities into active threat sensors</p>
          
          {/* Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 mt-6">
            <button
              onClick={() => setInteractiveTab('sample')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                interactiveTab === 'sample' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Hoxhunt Spear-Phishing Drill
            </button>
            <button
              onClick={() => setInteractiveTab('hvi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                interactiveTab === 'hvi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Human Vulnerability Index (HVI)
            </button>
            <button
              onClick={() => setInteractiveTab('remediation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                interactiveTab === 'remediation' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Hoxhunt Teachable Moments
            </button>
          </div>
        </div>

        {/* Tab 1: Phishing Simulation Preview */}
        {interactiveTab === 'sample' && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 max-w-4xl mx-auto relative shadow-2xl">
            <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="ml-2 text-xs font-mono text-slate-400">outlook-hoxhunt-plugin.internal</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setInspectedFlags(!inspectedFlags)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    inspectedFlags 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {inspectedFlags ? 'Hide Red Flags' : '🔍 Inspect Threat Red Flags'}
                </button>
                <button
                  onClick={() => onNavigate('inbox')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-1.5 shadow-glow-emerald transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Test "Report with Hoxhunt" Button</span>
                </button>
              </div>
            </div>

            {/* Email Body Preview */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800/80 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">[ACTION REQUIRED] Confirm Direct Deposit Routing for Pay Period 2026-10B</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    From: <span className="font-semibold text-slate-200">ADP Secure Payroll Services</span>{' '}
                    <span className="font-mono text-rose-400">&lt;notifications@adp-portal-update.com&gt;</span>
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Target: Payroll / HR
                </span>
              </div>

              {inspectedFlags && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 space-y-1 animate-in fade-in">
                  <p className="font-bold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Hoxhunt Red Flag Indicators Spotted:</span>
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-rose-300/90 pl-1 space-y-0.5">
                    <li>Lookalike domain <code>adp-portal-update.com</code> (ADP does not use this)</li>
                    <li>Extreme manufactured urgency: "Within 4 hours or deposit withheld"</li>
                    <li>Direct external link asking for banking credentials</li>
                  </ul>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                During our scheduled payroll audit for the current pay cycle, an automated flag was triggered regarding your registered ACH direct deposit routing number. Direct deposit will be paused and converted to paper mail check unless re-verified within 4 hours.
              </p>

              <div className="pt-2 text-center">
                <button
                  onClick={() => onNavigate('inbox')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md"
                >
                  Verify Direct Deposit Details & View Statement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Explainable HVI */}
        {interactiveTab === 'hvi' && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 max-w-4xl mx-auto shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Human Vulnerability Index</span>
                <div className="text-5xl font-black text-amber-400 my-3">40</div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Medium Risk Level
                </span>
                <p className="text-[11px] text-slate-400 mt-3">Calculated across 8 active employees and 4 departments</p>
              </div>

              <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Explainable Score Factor Breakdown</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">Role Threat Exposure (Baseline)</p>
                      <p className="text-[10px] text-slate-400">Baseline risk given public visibility & credentials</p>
                    </div>
                    <span className="font-mono font-bold text-indigo-400">+15 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <p className="font-semibold text-rose-300">Phishing Simulation Click</p>
                      <p className="text-[10px] text-slate-400">Failed simulated spear-phishing attack</p>
                    </div>
                    <span className="font-mono font-bold text-rose-400">+26 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <p className="font-semibold text-emerald-300">Proactive Threat Report (Hoxhunt)</p>
                      <p className="text-[10px] text-slate-400">Reported via CyberShield Hoxhunt button</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">-12 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <p className="font-semibold text-purple-300">Micro-Training Completion</p>
                      <p className="text-[10px] text-slate-400">Passed targeted micro-quiz (100% score)</p>
                    </div>
                    <span className="font-mono font-bold text-purple-400">-20 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Automated Micro-Training */}
        {interactiveTab === 'remediation' && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 max-w-4xl mx-auto shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hoxhunt Teachable Moments (Just-In-Time Micro-Learning)</h3>
                <p className="text-xs text-slate-400">Employees who fail a drill are immediately enrolled in a 3-minute tailored module</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Developer Attack Vector</span>
                <h4 className="text-sm font-bold text-white mt-2">Recognizing Fake GitHub & CI/CD Pipeline Alerts</h4>
                <p className="text-xs text-slate-400 mt-1">Teaches developers to spot lookalike domains like <code>github-enterprise-sec.net</code> and enforce hardware 2FA.</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Duration: 3 mins</span>
                  <span className="text-emerald-400 font-bold">2 Interactive Questions</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Finance & Wire Vector</span>
                <h4 className="text-sm font-bold text-white mt-2">Defending Against Invoice Fraud & BEC Wires</h4>
                <p className="text-xs text-slate-400 mt-1">Enforces out-of-band phone callbacks on vendor banking modification and dual authorization.</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Duration: 3 mins</span>
                  <span className="text-emerald-400 font-bold">Call-Back Checklist</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Feature Pillars Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-white">Full-Stack Enterprise Architecture by TerraMind</h2>
          <p className="text-slate-400 text-sm mt-3">Powered by the Hoxhunt behavioral engine. Built with Node.js, Express, native SQLite, React, and Tailwind CSS. Zero mocks: every event and score delta persists in real time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-card">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Role-Based Template Synthesizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Safe dynamic template generator creating customized attack drills for Payroll, Developers, HR, Finance, and Executives.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Hoxhunt Behavioral Gamification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Incentivize positive employee vigilance with Hoxhunt resilience points, streak flames, and real-time praise when reporting phishing.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">SOC Telemetry & Live Event Stream</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track granular interactions: Email Delivered, Opened, Link Clicked, Simulation Reported, and Remediation Cleared.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Personas Quick Launch Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Instant Demo Persona Launchpad</h2>
            <p className="text-xs text-slate-400 mt-1">Click any role below to instantly log in and experience CyberShield by TerraMind from that perspective</p>
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="mt-4 sm:mt-0 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>Open Dedicated Login Page & Credentials</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.slice(0, 6).map((acc) => (
            <div
              key={acc.email}
              onClick={() => {
                switchProfile(acc.email);
                onNavigate(acc.role === 'admin' ? 'admin' : 'inbox');
              }}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center space-x-3.5 group"
            >
              <Avatar
                src={acc.avatarUrl}
                name={acc.name}
                className="w-12 h-12 rounded-full border border-slate-700 group-hover:border-indigo-400"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">{acc.name}</h4>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                    acc.role === 'admin'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {acc.role === 'admin' ? 'SOC Lead' : acc.roleCategory}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{acc.roleTitle}</p>
                <div className="flex items-center space-x-2 mt-1 text-[10px]">
                  <span className="text-indigo-400 font-medium group-hover:underline">Launch Profile &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">CyberShield by TerraMind • Hoxhunt Human Risk Management & Adaptive Defense</p>
        <p className="mt-1 text-[11px]">Strictly simulated phishing awareness environment • Safe educational mock telemetry</p>
      </footer>
    </div>
  );
};
