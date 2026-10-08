import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Copy, 
  Fingerprint, 
  Shield, 
  RotateCw,
  AlertCircle 
} from 'lucide-react';
import { Avatar } from './Avatar';
import { MfaChallengeResponse } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (targetView: string) => void;
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNotification
}) => {
  const { accounts, login, verifyMfa, verifyPasskey, switchProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  
  // Security Authentication Challenge
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallengeResponse | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email, password);
      if ('requiresMfa' in res && res.requiresMfa) {
        setMfaChallenge(res);
        onNotification('Primary credentials verified. Please enter 6-digit Security Authentication code.', 'info');
      } else {
        onNotification(`Logged in successfully as ${email}`, 'success');
        onClose();
        onSuccess(email.includes('admin') ? 'admin' : 'inbox');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
      onNotification(err.message || 'Login failed', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyModalTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaChallenge) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await verifyMfa(mfaChallenge.mfaSessionToken, totpCode);
      onNotification('Security Authentication verified! Welcome.', 'success');
      onClose();
      onSuccess(mfaChallenge.userSummary.role === 'admin' ? 'admin' : 'inbox');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid verification code');
      onNotification('MFA verification failed', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyModalPasskey = async () => {
    if (!mfaChallenge) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await verifyPasskey(mfaChallenge.mfaSessionToken);
      onNotification('Hardware passkey verified! Welcome.', 'success');
      onClose();
      onSuccess(mfaChallenge.userSummary.role === 'admin' ? 'admin' : 'inbox');
    } catch (err: any) {
      setErrorMessage(err.message || 'Passkey verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSwitch = async (acc: any) => {
    setIsLoading(true);
    try {
      await switchProfile(acc.email);
      onNotification(`Logged in as ${acc.name} (${acc.roleTitle})`, 'success');
      onClose();
      onSuccess(acc.role === 'admin' ? 'admin' : 'inbox');
    } catch {
      onNotification('Quick sign-in failed', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
    onNotification(`Copied ${text} to clipboard`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0F1523] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#070A12]/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>CyberShield Security Authentication</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MFA / TOTP
                </span>
              </h2>
              <p className="text-xs text-slate-400">Pre-configured demo roster with Multi-Factor Authentication & Biometric Passkeys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Active Security MFA Challenge (if triggered) */}
          {mfaChallenge ? (
            <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security Authentication Challenge (MFA)</span>
                </div>
                <span className="text-[10px] font-mono bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded">
                  Demo Code: 749281
                </span>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <p className="text-xs text-slate-300">
                Enter the 6-digit TOTP security code for <strong className="text-white">{mfaChallenge.userSummary.email}</strong>:
              </p>

              <form onSubmit={handleVerifyModalTotp} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="749281"
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono font-bold text-lg text-white tracking-widest focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setTotpCode('749281')}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold whitespace-nowrap"
                  >
                    Auto-Fill 749281
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={isLoading || totpCode.length !== 6}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-glow-emerald transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Authorize Session (TOTP)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyModalPasskey}
                    disabled={isLoading}
                    className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    title="Authenticate with Biometric Passkey"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>Passkey</span>
                  </button>
                </div>
              </form>

              <button
                type="button"
                onClick={() => setMfaChallenge(null)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                &larr; Cancel and try different credentials
              </button>
            </div>
          ) : (
            <>
              {/* Quick 1-Click Persona Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pre-Configured Demo Personas</span>
                  <span className="text-[11px] text-emerald-400 font-mono">1-Click Launch • MFA Enabled</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accounts.map((acc) => (
                    <div
                      key={acc.email}
                      className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <Avatar
                          src={acc.avatarUrl}
                          name={acc.name}
                          className="w-10 h-10 rounded-xl border border-slate-700 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-100 truncate">{acc.name}</h4>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                              acc.role === 'admin'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : acc.remediationStatus === 'remediation_required'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {acc.role === 'admin' ? 'SOC Lead' : acc.roleCategory}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{acc.roleTitle}</p>
                          <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-slate-500 font-mono">
                            <span className="truncate">{acc.email}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(acc.email)}
                              className="hover:text-indigo-400 transition-colors"
                              title="Copy email"
                            >
                              {copiedEmail === acc.email ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEmail(acc.email);
                            setPassword(acc.password);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all"
                          title="Fill form fields"
                        >
                          Fill
                        </button>
                        <button
                          onClick={() => handleQuickSwitch(acc)}
                          disabled={isLoading}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 group-hover:shadow-glow-indigo"
                        >
                          <span>Launch {acc.name.split(' ')[0]}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Login Form */}
              <div className="border-t border-slate-800/80 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Or Authenticate with Credentials</h3>
                <form onSubmit={handleManualLogin} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@cybershield.corp"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="admin123 or demo123"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">MFA Code: <code className="text-indigo-400">749281</code></span>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center space-x-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Authenticate Session &rarr;</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
