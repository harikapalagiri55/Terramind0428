import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminConsole/AdminDashboard';
import { CampaignManager } from './components/AdminConsole/CampaignManager';
import { EmployeeRiskDirectory } from './components/AdminConsole/EmployeeRiskDirectory';
import { TemplateSynthesizer } from './components/AdminConsole/TemplateSynthesizer';
import { LiveSocEvents } from './components/AdminConsole/LiveSocEvents';
import { ReportsView } from './components/AdminConsole/ReportsView';
import { EmployeeMailbox } from './components/EmployeePortal/EmployeeMailbox';
import { MicroTrainingModal } from './components/EmployeePortal/MicroTrainingModal';
import { AuthModal } from './components/AuthModal';
import { 
  LayoutDashboard, 
  Mail, 
  Users, 
  Sparkles, 
  Activity, 
  FileCheck, 
  CheckCircle, 
  AlertCircle, 
  Info
} from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'admin' | 'inbox' | 'training'>('landing');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'campaigns' | 'employees' | 'synthesizer' | 'events' | 'reports'>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [targetTrainingId, setTargetTrainingId] = useState<string | undefined>(undefined);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleNavigateToTraining = (assignmentId?: string) => {
    setTargetTrainingId(assignmentId);
    setCurrentView('training');
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-3.5 rounded-2xl border text-xs shadow-2xl backdrop-blur-xl pointer-events-auto flex items-start space-x-2.5 animate-in slide-in-from-right duration-200 ${
              n.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : n.type === 'warning'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
            }`}
          >
            {n.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : n.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            )}
            <p className="font-medium leading-relaxed">{n.message}</p>
          </div>
        ))}
      </div>

      {/* Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => setCurrentView(view as any)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onNotification={showNotification}
      />

      {/* View Routing */}
      <main className="flex-1">
        {/* VIEW 1: Landing Page */}
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={(view) => setCurrentView(view as any)}
            onOpenAuthModal={() => setCurrentView('login')}
          />
        )}

        {/* VIEW 2: Dedicated Separate Login Page */}
        {currentView === 'login' && (
          <LoginPage
            onSuccess={(targetView) => setCurrentView(targetView as any)}
            onNavigateHome={() => setCurrentView('landing')}
            onNotification={showNotification}
          />
        )}

        {/* VIEW 3: SOC Admin Console */}
        {currentView === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Admin Tabs Bar */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
              <button
                onClick={() => setAdminTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  adminTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>SOC Dashboard</span>
              </button>

              <button
                onClick={() => setAdminTab('campaigns')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  adminTab === 'campaigns'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Campaigns</span>
              </button>

              <button
                onClick={() => setAdminTab('employees')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  adminTab === 'employees'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Employee Risk</span>
              </button>

              <button
                onClick={() => setAdminTab('synthesizer')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  adminTab === 'synthesizer'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Template Synthesizer</span>
              </button>

              <button
                onClick={() => setAdminTab('events')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  adminTab === 'events'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live SOC Events</span>
              </button>

              <button
                onClick={() => setAdminTab('reports')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  adminTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Audit Reports</span>
              </button>
            </div>

            {/* Admin Tab Content */}
            {adminTab === 'dashboard' && (
              <AdminDashboard
                onNavigateTab={(t) => setAdminTab(t as any)}
                onNotification={showNotification}
              />
            )}
            {adminTab === 'campaigns' && (
              <CampaignManager onNotification={showNotification} />
            )}
            {adminTab === 'employees' && (
              <EmployeeRiskDirectory onNotification={showNotification} />
            )}
            {adminTab === 'synthesizer' && (
              <TemplateSynthesizer onNotification={showNotification} />
            )}
            {adminTab === 'events' && (
              <LiveSocEvents onNotification={showNotification} />
            )}
            {adminTab === 'reports' && (
              <ReportsView onNotification={showNotification} />
            )}
          </div>
        )}

        {/* VIEW 4: Employee Simulation Mailbox */}
        {currentView === 'inbox' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EmployeeMailbox
              onNotification={showNotification}
              onNavigateToTraining={handleNavigateToTraining}
            />
          </div>
        )}

        {/* VIEW 5: Micro-Training */}
        {currentView === 'training' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MicroTrainingModal
              onNotification={showNotification}
              selectedAssignmentId={targetTrainingId}
              onCompleted={() => {
                showNotification('Training passed! Remediation successfully completed.', 'success');
              }}
            />
          </div>
        )}
      </main>

      {/* Global Sleek Footer */}
      <footer className="mt-auto border-t border-slate-900/90 bg-[#05070D]/95 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">CyberShield by TerraMind</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono font-semibold">Hoxhunt Behavioral Defense Engine</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 font-mono">SOC Engine Active</span>
            </span>
            <span className="text-slate-700">•</span>
            <button onClick={() => setCurrentView('login')} className="hover:text-indigo-400 text-slate-400 transition-colors">
              Demo Credentials
            </button>
            <span className="text-slate-700">•</span>
            <button onClick={() => setCurrentView('landing')} className="hover:text-indigo-400 text-slate-400 transition-colors">
              Showcase
            </button>
          </div>
        </div>
      </footer>

      {/* Demo Credentials & Quick Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(targetView) => setCurrentView(targetView as any)}
        onNotification={showNotification}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
