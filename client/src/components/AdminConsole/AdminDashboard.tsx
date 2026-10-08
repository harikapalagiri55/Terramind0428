import React, { useState, useEffect } from 'react';
import { OrgMetrics } from '../../types';
import { api } from '../../api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  CheckCircle2, 
  Activity, 
  Plus, 
  Sparkles,
  RotateCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Avatar } from '../Avatar';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, onNotification }) => {
  const [metrics, setMetrics] = useState<OrgMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await api.getDashboardStats();
      setMetrics(data);
      if (isManual) onNotification('Dashboard metrics refreshed from live database', 'info');
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 5 seconds to catch live events from employee actions
    const interval = setInterval(() => loadData(), 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <RotateCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading live SOC telemetry and Human Risk Index...</p>
        </div>
      </div>
    );
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'LINK_CLICKED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">LINK CLICKED</span>;
      case 'SIMULATION_REPORTED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">REPORTED (HOXHUNT)</span>;
      case 'TRAINING_COMPLETED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">TRAINING PASSED</span>;
      case 'REMEDIATION_ASSIGNED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">REMEDIATION QUEUED</span>;
      case 'EMAIL_OPENED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">EMAIL OPENED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700">DELIVERED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
            <span>CyberShield SOC Console</span>
            <span className="text-xs font-semibold text-slate-400">by</span>
            <span className="text-sm font-bold text-indigo-400 font-mono">TerraMind</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1"></span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Hoxhunt-Adaptive Human Vulnerability Indexing & Automated Remediation Telemetry</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => loadData(true)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
            title="Refresh metrics"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Live Sync</span>
          </button>

          <button
            onClick={() => onNavigateTab('campaigns')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-glow-indigo flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>

          <button
            onClick={() => onNavigateTab('synthesizer')}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Synthesizer</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Org Security Score */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Org Security Posture</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-white">{metrics.orgSecurityScore}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.orgSecurityScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Resilience Index</span>
            <span className="text-emerald-400 font-semibold font-mono">{(metrics.reportRate / Math.max(1, metrics.clickRate)).toFixed(1)}x Defense Ratio</span>
          </p>
        </div>

        {/* Card 2: Human Vulnerability Index (HVI) */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Human Vulnerability Index</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-400">{metrics.hvi}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              metrics.riskBandColor === 'rose'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : metrics.riskBandColor === 'amber'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {metrics.riskBand}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.hvi > 60 ? 'bg-rose-500' : metrics.hvi > 35 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${metrics.hvi}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Explainable aggregate across <span className="text-slate-200 font-semibold">{metrics.totalEmployees} active employees</span>
          </p>
        </div>

        {/* Card 3: Click vs Report Rate */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Phish Telemetry</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <p className="text-[10px] text-rose-400 font-semibold uppercase">Click Rate</p>
              <p className="text-2xl font-black text-rose-400">{metrics.clickRate}%</p>
              <p className="text-[10px] text-slate-500 font-mono">{metrics.clickedTotal} clicked</p>
            </div>
            <div>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase">Report Rate</p>
              <p className="text-2xl font-black text-emerald-400">{metrics.reportRate}%</p>
              <p className="text-[10px] text-slate-500 font-mono">{metrics.reportedTotal} reported</p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Total simulations tested: <span className="font-semibold text-slate-200">{metrics.totalTested}</span>
          </div>
        </div>

        {/* Card 4: Remediation Pipeline */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Remediation Pipeline</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-rose-400">{metrics.remediationRequired}</span>
            <span className="text-xs text-slate-400">requiring training</span>
          </div>
          <div className="mt-3 flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.trainingCompleted} completed</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>{metrics.goodStanding} good standing</span>
          </div>
          <button
            onClick={() => onNavigateTab('employees')}
            className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>View employee queue</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Live SOC Event Stream & Department Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Telemetry Stream */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live SOC Event Timeline Card */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live SOC Interaction Telemetry Feed</h3>
                  <p className="text-[11px] text-slate-400">Real-time database stream of employee link clicks, reports & training completions</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
              >
                <span>View Full Log</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {metrics.recentEvents.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No interaction events recorded yet</p>
              ) : (
                metrics.recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Avatar
                        src={evt.avatarUrl}
                        name={evt.employeeName}
                        className="w-8 h-8 rounded-full border border-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-200 truncate">{evt.employeeName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({evt.roleCategory})</span>
                          {getEventBadge(evt.eventType)}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Campaign: <span className="text-slate-300 font-medium">{evt.campaignName}</span>
                          {evt.payload?.reason && ` • ${evt.payload.reason}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono flex-shrink-0 pl-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Vulnerability Heatmap */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3">Department Risk & Exposure Matrix</h3>
            <div className="space-y-3">
              {metrics.departments.map((dept) => (
                <div key={dept.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-200">{dept.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({dept.employee_count} employees)</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-slate-400">Click Rate: <strong className="text-rose-400">{dept.click_rate}%</strong></span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dept.avg_risk > 50 ? 'bg-rose-500/20 text-rose-300' : dept.avg_risk > 30 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        Risk: {dept.avg_risk}/100
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dept.avg_risk > 50 ? 'bg-rose-500' : dept.avg_risk > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(8, dept.avg_risk)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Top Threat Vectors & Role Breakdown */}
        <div className="space-y-6">
          
          {/* Top Threat Vectors */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3">Top Phishing Attack Vectors</h3>
            <p className="text-[11px] text-slate-400 mb-4">Role-specific spear-phishing attack drills causing the highest vulnerability</p>

            <div className="space-y-3">
              {metrics.topScenarios.map((sc, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{sc.scenario}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {sc.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Delivered: <strong className="text-slate-300">{sc.delivered}</strong></span>
                    <span>Clicks: <strong className="text-rose-400">{sc.clicked}</strong></span>
                    <span>Fail Rate: <strong className="text-rose-400">{sc.clickRate}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable Risk Adjustments Stream */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2">Explainable Risk Audit</h3>
            <p className="text-[11px] text-slate-400 mb-3">Transparent delta justification for recent score movements</p>

            <div className="space-y-2.5">
              {metrics.recentRiskAdjustments.slice(0, 4).map((rh) => (
                <div key={rh.id} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">{rh.employee_name}</span>
                    <span className={`font-mono font-bold ${rh.change_delta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {rh.change_delta > 0 ? `+${rh.change_delta}` : rh.change_delta} pts ({rh.previous_score} &rarr; {rh.new_score})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{rh.reason}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
