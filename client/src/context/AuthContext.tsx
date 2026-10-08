import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DemoAccount, LoginResponse, MfaChallengeResponse } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  accounts: DemoAccount[];
  loading: boolean;
  mfaPendingSession: MfaChallengeResponse | null;
  login: (email: string, password?: string, mfaCode?: string, directAuth?: boolean) => Promise<LoginResponse>;
  verifyMfa: (mfaSessionToken: string, code: string) => Promise<User>;
  verifyPasskey: (mfaSessionToken: string, passkeyCredential?: string) => Promise<User>;
  cancelMfa: () => void;
  switchProfile: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaPendingSession, setMfaPendingSession] = useState<MfaChallengeResponse | null>(null);

  // Load demo accounts list and check existing token
  useEffect(() => {
    async function init() {
      try {
        const { accounts: demoList } = await api.getDemoUsers();
        setAccounts(demoList);

        const token = localStorage.getItem('cybershield_token');
        if (token) {
          try {
            const data = await api.getCurrentUser();
            setUser(data.user);
          } catch {
            localStorage.removeItem('cybershield_token');
          }
        }
      } catch (err) {
        console.error('Failed to init auth context:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const login = async (email: string, password?: string, mfaCode?: string, directAuth?: boolean): Promise<LoginResponse> => {
    const data = await api.login(email, password, mfaCode, directAuth);
    if ('requiresMfa' in data && data.requiresMfa) {
      setMfaPendingSession(data);
      return data;
    }

    if ('token' in data) {
      localStorage.setItem('cybershield_token', data.token);
      setUser(data.user);
      setMfaPendingSession(null);
    }
    return data;
  };

  const verifyMfa = async (mfaSessionToken: string, code: string): Promise<User> => {
    const data = await api.verifyMfa(mfaSessionToken, code);
    localStorage.setItem('cybershield_token', data.token);
    setUser(data.user);
    setMfaPendingSession(null);
    return data.user;
  };

  const verifyPasskey = async (mfaSessionToken: string, passkeyCredential?: string): Promise<User> => {
    const data = await api.verifyPasskey(mfaSessionToken, passkeyCredential);
    localStorage.setItem('cybershield_token', data.token);
    setUser(data.user);
    setMfaPendingSession(null);
    return data.user;
  };

  const cancelMfa = () => {
    setMfaPendingSession(null);
  };

  const switchProfile = async (email: string) => {
    try {
      const data = await api.switchUser(email);
      localStorage.setItem('cybershield_token', data.token);
      setUser(data.user);
      setMfaPendingSession(null);
    } catch (err) {
      console.error('Failed to switch profile:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('cybershield_token');
    setUser(null);
    setMfaPendingSession(null);
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accounts, 
      loading, 
      mfaPendingSession,
      login, 
      verifyMfa,
      verifyPasskey,
      cancelMfa,
      switchProfile, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
