import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  UserCheck, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Fingerprint,
  Smartphone,
  Shield,
  RotateCw,
  Terminal,
  Cpu
} from 'lucide-react';
import { Avatar } from './Avatar';
import { MfaChallengeResponse } from '../types';

interface LoginPageProps {
  onSuccess: (targetView: string) => void;
  onNavigateHome: () => void;
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateHome,
  onNotification
}) => {
  const { accounts, login, verifyMfa, verifyPasskey, cancelMfa } = useAuth();
  
  // Step: 'credentials' | 'security_auth'
  const [authStep, setAuthStep] = useState<'credentials' | 'security_auth'>('credentials');
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallengeResponse | null>(null);
  
  // Form credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Security Authentication Challenge State
  const [mfaMethod, setMfaMethod] = useState<'totp' | 'passkey' | 'push'>('totp');
  const [totpDigits, setTotpDigits] = useState(['', '', '', '', '', '']);
  const [totpCountdown, setTotpCountdown] = useState(28);
  const [isVerifyingSecurity, setIsVerifyingSecurity] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [pushStatus, setPushStatus] = useState<'idle' | 'waiting' | 'approved'>('idle');

  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Rotating TOTP timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTotpCountdown(prev => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Step 1: Manual Credentials Submission
  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email, password);
      if ('requiresMfa' in res && res.requiresMfa) {
        setMfaChallenge(res);
        setAuthStep('security_auth');
        onNotification('Primary credentials verified. Security Authentication (MFA) Challenge required.', 'info');
      } else {
        onNotification(`Authenticated as ${email}`, 'success');
        const target = email.toLowerCase().includes('admin') ? 'admin' : 'inbox';
        onSuccess(target);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
      onNotification(err.message || 'Login failed', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle TOTP 6-Digit Verification
  const handleVerifyTotp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mfaChallenge) return;

    const fullCode = totpDigits.join('').trim();
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the TOTP security code.');
      return;
    }

    setIsVerifyingSecurity(true);
    setErrorMessage(null);

    try {
      await verifyMfa(mfaChallenge.mfaSessionToken, fullCode);
      onNotification('Security Authentication successful! Session cryptographically authorized.', 'success');
      const target = mfaChallenge.userSummary.role === 'admin' ? 'admin' : 'inbox';
      onSuccess(target);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid 6-digit TOTP code. Access denied.');
      onNotification('MFA verification rejected', 'warning');
    } finally {
      setIsVerifyingSecurity(false);
    }
  };

  // Step 2: Handle Biometric / FIDO2 Passkey Verification
  const handleVerifyPasskey = async () => {
    if (!mfaChallenge) return;
    setPasskeyStatus('scanning');
    setIsVerifyingSecurity(true);
    setErrorMessage(null);

    setTimeout(async () => {
      try {
        await verifyPasskey(mfaChallenge.mfaSessionToken, 'fido2-yubikey-5c-nfc');
        setPasskeyStatus('verified');
        onNotification('Hardware Passkey / WebAuthn signature verified! Zero-Trust session established.', 'success');
        setTimeout(() => {
          const target = mfaChallenge.userSummary.role === 'admin' ? 'admin' : 'inbox';
          onSuccess(target);
        }, 500);
      } catch (err: any) {
        setPasskeyStatus('idle');
        setErrorMessage(err.message || 'Biometric passkey signature failed.');
        onNotification('Passkey validation rejected', 'warning');
      } finally {
        setIsVerifyingSecurity(false);
      }
    }, 1100);
  };

  // Step 2: Handle Mobile Push Simulation
  const handleVerifyPush = async () => {
    if (!mfaChallenge) return;
    setPushStatus('waiting');
    setIsVerifyingSecurity(true);
    setErrorMessage(null);

    setTimeout(async () => {
      try {
        await verifyMfa(mfaChallenge.mfaSessionToken, '749281');
        setPushStatus('approved');
        onNotification('Mobile push request approved on trusted device!', 'success');
        setTimeout(() => {
          const target = mfaChallenge.userSummary.role === 'admin' ? 'admin' : 'inbox';
          onSuccess(target);
        }, 500);
      } catch (err: any) {
        setPushStatus('idle');
        setErrorMessage('Push approval rejected.');
      } finally {
        setIsVerifyingSecurity(false);
      }
    }, 1200);
  };

  // Instant 1-Click login from demo roster
  const handleQuickLogin = async (acc: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(acc.email, undefined, undefined, true);
      onNotification(`Welcome, ${acc.name}! Logged in as ${acc.roleTitle}`, 'success');
      const target = acc.role === 'admin' ? 'admin' : 'inbox';
      onSuccess(target);
    } catch {
      setErrorMessage('Failed to authenticate demo account.');
      onNotification('Quick login failed', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Launch interactive Security Authentication challenge for a persona
  const handleTestSecurityAuthForPersona = async (acc: any) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(acc.email, acc.password);
      if ('requiresMfa' in res && res.requiresMfa) {
        setMfaChallenge(res);
        setAuthStep('security_auth');
        setTotpDigits(['', '', '', '', '', '']);
        onNotification(`Prompted Security Authentication for ${acc.name}`, 'info');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to trigger Security Authentication');
    } finally {
      setIsLoading(false);
    }
  };

  // Fill TOTP code helper
  const handleAutoFillTotp = () => {
    setTotpDigits(['7', '4', '9', '2', '8', '1']);
    setErrorMessage(null);
    onNotification('Auto-filled Demo TOTP token: 749281', 'info');
  };

  // Auto-fill form fields
  const handleAutoFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMessage(null);
    onNotification(`Filled form with ${fillEmail}`, 'info');
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    onNotification(`Copied "${text}" to clipboard`, 'info');
  };

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Pasting full 6-digit code
      const pasteClean = val.replace(/\D/g, '').slice(0, 6);
      if (pasteClean.length === 6) {
        setTotpDigits(pasteClean.split(''));
        return;
      }
    }
    const clean = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...totpDigits];
    newDigits[index] = clean;
    setTotpDigits(newDigits);

    // Auto-advance to next input
    if (clean && index < 5) {
      const nextInput = document.getElementById(`totp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`totp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#070A12] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-mesh-gradient pointer-events-none opacity-70" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="max-w-6xl mx-auto w-full mb-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-slate-900/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CyberShield by TerraMind</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Column (5 cols): Main Login Form OR Security Authentication Shield */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl relative">
            
            {/* Header / Brand */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] shadow-glow-indigo">
                  <div className="w-full h-full bg-[#0B0F19] rounded-[15px] flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-indigo-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-1.5">
                    <span>Cyber<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Shield</span></span>
                    <span className="text-xs font-medium text-slate-400">by</span>
                    <span className="text-sm font-bold text-indigo-300 font-mono">TerraMind</span>
                  </h1>
                  <p className="text-xs text-slate-400">Hoxhunt-Adaptive Human Risk Portal</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-medium">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Zero-Trust Security Authentication Enabled</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-xs text-rose-300 flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: CREDENTIALS VIEW */}
            {authStep === 'credentials' && (
              <form onSubmit={handleSubmitCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@cybershield.corp"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-500">Demo: <code className="text-indigo-400">admin123</code> / <code className="text-indigo-400">demo123</code></span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter demo password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-wide shadow-glow-indigo transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Proceed to Security Authentication &rarr;</span>
                    </>
                  )}
                </button>

                {/* Fast Auto-Fill Buttons */}
                <div className="pt-4 border-t border-slate-800/80">
                  <p className="text-[11px] font-semibold text-slate-400 mb-2">Fast Auto-Fill Shortcuts:</p>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleAutoFill('admin@cybershield.corp', 'admin123')}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-[11px] text-indigo-300 font-medium transition-all text-center"
                    >
                      👑 CISO Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoFill('alex.dev@cybershield.corp', 'demo123')}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium transition-all text-center"
                    >
                      💻 Alex (Dev)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoFill('david.finance@cybershield.corp', 'demo123')}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-[11px] text-rose-300 font-medium transition-all text-center"
                    >
                      💰 David (Fin)
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: SECURITY AUTHENTICATION (MFA / 2FA / PASSKEY) CHALLENGE */}
            {authStep === 'security_auth' && mfaChallenge && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                
                {/* Persona Header Preview */}
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={mfaChallenge.userSummary.avatarUrl}
                      name={mfaChallenge.userSummary.name}
                      className="w-10 h-10 rounded-xl border border-indigo-500/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{mfaChallenge.userSummary.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{mfaChallenge.userSummary.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Step 2 of 2
                  </span>
                </div>

                {/* Authentication Method Selector Tabs */}
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setMfaMethod('totp')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      mfaMethod === 'totp'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>6-Digit TOTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMfaMethod('passkey')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      mfaMethod === 'passkey'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Passkey</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMfaMethod('push')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      mfaMethod === 'push'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Push (#42)</span>
                  </button>
                </div>

                {/* TAB 1: 6-DIGIT TOTP AUTHENTICATOR */}
                {mfaMethod === 'totp' && (
                  <form onSubmit={handleVerifyTotp} className="space-y-4">
                    <div className="text-center space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Enter Authenticator Security Token
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Input the 6-digit rolling code from your authenticator app
                      </p>
                    </div>

                    {/* Discrete 6-digit boxes */}
                    <div className="flex items-center justify-center space-x-2.5 py-1">
                      {totpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`totp-input-${idx}`}
                          type="text"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                          className="w-10 h-12 text-center text-lg font-mono font-bold bg-slate-900 border-2 border-slate-700 focus:border-indigo-500 rounded-xl text-white focus:outline-none transition-all shadow-inner"
                        />
                      ))}
                    </div>

                    {/* Rolling code timer & Quick fill */}
                    <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <RotateCw className="w-3 h-3 text-emerald-400 animate-spin" />
                        <span>Code rotates in: <strong className="text-white font-mono">{totpCountdown}s</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFillTotp}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                      >
                        Auto-Fill Demo Code (749281)
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingSecurity}
                      className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-glow-emerald transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isVerifyingSecurity ? (
                        <span>Validating TOTP Cryptographic Signature...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-slate-950" />
                          <span>Verify & Authorize Session</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* TAB 2: BIOMETRIC / FIDO2 HARDWARE PASSKEY */}
                {mfaMethod === 'passkey' && (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 mx-auto flex items-center justify-center">
                      <Fingerprint className={`w-8 h-8 text-indigo-400 ${passkeyStatus === 'scanning' ? 'animate-pulse text-emerald-400' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Hardware Key / WebAuthn Biometric</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        FIDO2 Authenticator • Windows Hello / Touch ID / YubiKey 5 Series
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyPasskey}
                      disabled={isVerifyingSecurity}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-glow-indigo transition-all flex items-center justify-center space-x-2"
                    >
                      {passkeyStatus === 'scanning' ? (
                        <span>Attesting Cryptographic Signature...</span>
                      ) : passkeyStatus === 'verified' ? (
                        <span>Hardware Key Verified!</span>
                      ) : (
                        <>
                          <Fingerprint className="w-4 h-4" />
                          <span>Tap Security Key / Scan Fingerprint</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* TAB 3: HOXHUNT MOBILE PUSH */}
                {mfaMethod === 'push' && (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 mx-auto flex items-center justify-center">
                      <Smartphone className={`w-8 h-8 text-indigo-400 ${pushStatus === 'waiting' ? 'animate-bounce text-emerald-400' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Hoxhunt Mobile Push Notification</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Select matching challenge number on your device:
                      </p>
                      <div className="mt-2 inline-block px-4 py-1.5 rounded-xl bg-slate-950 border border-indigo-500/50 text-base font-black font-mono text-indigo-300">
                        #42
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyPush}
                      disabled={isVerifyingSecurity}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-glow-emerald transition-all flex items-center justify-center space-x-2"
                    >
                      {pushStatus === 'waiting' ? (
                        <span>Awaiting Trusted Device Confirmation...</span>
                      ) : pushStatus === 'approved' ? (
                        <span>Push Approved!</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simulate Push Approval on Phone</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Cancel / Return to credentials */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      cancelMfa();
                      setAuthStep('credentials');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    &larr; Use different credentials / Back to email
                  </button>
                </div>

              </div>
            )}

            {/* Compliance footnote */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>NIST SP 800-63B AAL2 Ready</span>
              </span>
              <span className="font-mono text-[10px]">TLS 1.3 • AES-256-GCM</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Demo Credentials & Pre-Configured Personas Roster */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Header Card for Demo Directory */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Hoxhunt Demo Credentials Directory</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    MFA Enforced
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Test the interactive 2FA Security Challenge or Launch 1-Click directly</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo OTP: 749281</span>
            </div>
          </div>

          {/* Personas Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {accounts.map((acc) => {
              const isAdmin = acc.role === 'admin';
              const emailKey = `email_${acc.email}`;
              const passKey = `pwd_${acc.email}`;

              return (
                <div
                  key={acc.email}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between group ${
                    isAdmin 
                      ? 'bg-gradient-to-br from-indigo-950/30 to-slate-900/80 border-indigo-500/40 hover:border-indigo-400 shadow-glow-indigo' 
                      : acc.remediationStatus === 'remediation_required'
                      ? 'bg-slate-900/60 border-rose-500/30 hover:border-rose-400/60'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top persona header */}
                    <div className="flex items-start space-x-3 mb-3">
                      <Avatar
                        src={acc.avatarUrl}
                        name={acc.name}
                        className="w-11 h-11 rounded-2xl border border-slate-700 group-hover:border-indigo-400 transition-colors"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-white truncate">{acc.name}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            isAdmin 
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : acc.remediationStatus === 'remediation_required'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {isAdmin ? 'SOC CISO' : acc.roleCategory}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{acc.roleTitle}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] text-slate-500 flex items-center space-x-1 truncate">
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{acc.department}</span>
                          </span>
                          <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            🛡️ MFA Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Credentials Pill Box */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs font-mono mb-3">
                      {/* Email row with copy */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 truncate pr-1">
                          ID: <strong className="text-slate-200">{acc.email}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.email, emailKey)}
                          className="text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0"
                          title="Copy ID"
                        >
                          {copiedKey === emailKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Password row with copy */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/50">
                        <span className="text-slate-400">
                          PWD: <strong className="text-emerald-400">{acc.password}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.password, passKey)}
                          className="text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0"
                          title="Copy Password"
                        >
                          {copiedKey === passKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* TOTP 2FA code helper */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/50">
                        <span className="text-slate-400">
                          2FA: <strong className="text-indigo-300">749281</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('749281', `totp_${acc.email}`)}
                          className="text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0"
                          title="Copy 2FA Code"
                        >
                          {copiedKey === `totp_${acc.email}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTestSecurityAuthForPersona(acc)}
                      disabled={isLoading}
                      className="py-2 px-2 bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border border-slate-700/80 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center space-x-1"
                      title="Test the 2-Factor Authentication Shield"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Test 2FA Shield</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      disabled={isLoading}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                        isAdmin
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo'
                          : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30'
                      }`}
                    >
                      <span>1-Click Launch &rarr;</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>CyberShield by TerraMind • Protected with TOTP Multi-Factor Authentication & Biometric FIDO2 Passkeys.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
