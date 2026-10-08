import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  ShieldCheck,
  ChevronDown, 
  UserCheck, 
  LogOut, 
  RotateCcw, 
  KeyRound, 
  Inbox, 
  LayoutDashboard, 
  GraduationCap, 
  Globe,
  LogIn,
  Sparkles,
  Fingerprint,
  Lock,
  X
} from 'lucide-react';
import { api } from '../api';
import { Avatar } from './Avatar';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenAuthModal: () => void;
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenAuthModal,
  onNotification
}) => {
  const { user, accounts, switchProfile, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemo = async () => {
    if (confirm('Reset entire database to clean initial seeded demo state?')) {
      setIsResetting(true);
      try {
        await api.resetDemoDatabase();
        onNotification('Database restored to clean demo state with fresh campaigns & telemetry!', 'success');
        window.location.reload();
      } catch {
        onNotification('Failed to reset database', 'warning');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const getRiskBadge = (score: number) => {
    if (score > 70) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">Crit: {score}</span>;
    if (score > 45) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">High: {score}</span>;
    if (score > 25) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Med: {score}</span>;
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Low: {score}</span>;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070A12]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo: CyberShield by TerraMind */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] shadow-glow-indigo">
            <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-white">
                Cyber<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Shield</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">by</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                TerraMind
              </span>
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                Hoxhunt Engine
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Hoxhunt-Adaptive Human Risk Management Platform
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentView('landing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              currentView === 'landing'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Showcase</span>
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              currentView === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>SOC Console</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </button>

          <button
            onClick={() => setCurrentView('inbox')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              currentView === 'inbox'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Simulation Inbox</span>
            {user?.employee?.remediationStatus === 'remediation_required' && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('training')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              currentView === 'training'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Micro-Training</span>
            {(user?.employee?.pendingTrainingCount ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-bold">
                {user?.employee?.pendingTrainingCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Section: Persona Switcher & Login Page Link */}
        <div className="flex items-center space-x-2.5">
          
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700/70 text-xs font-medium text-slate-200 transition-all shadow-sm"
              title="Switch demo persona instantly"
            >
              {user ? (
                <>
                  <Avatar
                    src={user.employee?.avatarUrl}
                    name={user.employee?.name || (user.role === 'admin' ? 'SOC Admin' : user.email)}
                    className="w-6 h-6 rounded-full border border-indigo-500/40"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="leading-tight font-semibold text-slate-100 flex items-center space-x-1">
                      <span>{user.employee?.name || 'SOC Admin'}</span>
                      {user.employee && (
                        <span className="text-[10px] text-indigo-400 font-mono">({user.employee.roleCategory})</span>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300 font-semibold">Demo Personas</span>
                </>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-[#0F1523] border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>1-Click Persona Switcher</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Hoxhunt Engine</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Test role drills across Developer, Finance, Payroll, HR & Exec</p>
                </div>

                <div className="py-1 max-h-72 overflow-y-auto space-y-1">
                  {accounts.map((acc) => {
                    const isSelected = user?.email === acc.email;
                    return (
                      <button
                        key={acc.email}
                        onClick={() => {
                          switchProfile(acc.email);
                          setDropdownOpen(false);
                          if (acc.role === 'admin') setCurrentView('admin');
                          else setCurrentView('inbox');
                          onNotification(`Switched active persona to ${acc.name} (${acc.roleTitle})`, 'info');
                        }}
                        className={`w-full text-left p-2 rounded-xl transition-all flex items-center space-x-2.5 ${
                          isSelected
                            ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <Avatar
                          src={acc.avatarUrl}
                          name={acc.name}
                          className="w-8 h-8 rounded-full border border-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-200 truncate">{acc.name}</p>
                            {acc.role === 'admin' ? (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">CISO SOC</span>
                            ) : (
                              getRiskBadge(acc.riskScore)
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{acc.roleTitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between px-2">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setCurrentView('login');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>View All Credentials</span>
                  </button>
                  {user && (
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        setCurrentView('login');
                        onNotification('Signed out', 'info');
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center space-x-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Security Authentication Status Badge */}
          <button
            onClick={() => setShowSecurityModal(true)}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Inspect active Security Authentication & Zero-Trust Posture"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>MFA Active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          {/* Dedicated Login Page CTA Button */}
          <button
            onClick={() => setCurrentView('login')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-glow-indigo ${
              currentView === 'login'
                ? 'bg-indigo-500 text-white ring-2 ring-indigo-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
            title="Open separate Login Page with demo IDs & passwords"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login Page</span>
          </button>

          {/* Reset Demo DB Button */}
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-all"
            title="Reset database to clean initial state"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Security Authentication Posture Modal */}
      {showSecurityModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowSecurityModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#0F1523] border border-indigo-500/40 rounded-3xl p-6 shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Security Authentication</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      MFA ENFORCED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Zero-Trust Identity & Session Protection Posture</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active User Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
              <Avatar 
                src={user?.employee?.avatarUrl} 
                name={user?.employee?.name || user?.email || 'SOC Admin'} 
                className="w-10 h-10 rounded-xl border border-indigo-500/40" 
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{user?.employee?.name || 'Administrator'}</h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">AAL2 Verified</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email || 'admin@cybershield.corp'}</p>
              </div>
            </div>

            {/* Security Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Multi-Factor Engine</span>
                <p className="text-emerald-300 font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>TOTP (RFC 6238)</span>
                </p>
                <p className="text-[10px] text-slate-500">6-Digit Rolling Authenticators</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hardware Key Support</span>
                <p className="text-indigo-300 font-bold flex items-center space-x-1">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>FIDO2 / WebAuthn</span>
                </p>
                <p className="text-[10px] text-slate-500">Passkeys & YubiKey 5 Series</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Transport Cipher</span>
                <p className="text-white font-mono font-semibold">TLS 1.3 / AES-256</p>
                <p className="text-[10px] text-slate-500">ECDHE-RSA-AES256-GCM</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Session Token</span>
                <p className="text-white font-mono font-semibold">HMAC-SHA256 JWT</p>
                <p className="text-[10px] text-slate-500">Signed with rotation check</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
              <button
                onClick={() => {
                  setShowSecurityModal(false);
                  setCurrentView('login');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Go to Security Auth Login &rarr;
              </button>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
