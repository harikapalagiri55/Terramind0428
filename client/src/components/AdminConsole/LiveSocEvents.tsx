import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { InteractionEvent, SecurityAuditLog } from '../../types';
import { Activity, Clock, RotateCw, Filter, ShieldCheck, AlertTriangle, KeyRound, Fingerprint, Lock, Shield } from 'lucide-react';
import { Avatar } from '../Avatar';

interface LiveSocEventsProps {
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const LiveSocEvents: React.FC<LiveSocEventsProps> = ({ onNotification }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'security_auth'>('simulation');
  const [events, setEvents] = useState<InteractionEvent[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      if (activeTab === 'simulation') {
        const res = await api.getEvents(eventTypeFilter === 'all' ? undefined : eventTypeFilter, 100);
        setEvents(res.events);
      } else {
        const res = await api.getSecurityLogs();
        setSecurityLogs(res.logs);
      }
    } catch {
      onNotification('Failed to load telemetry feed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3500);
    return () => clearInterval(interval);
  }, [eventTypeFilter, activeTab]);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'LINK_CLICKED':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">LINK CLICKED</span>;
      case 'SIMULATION_REPORTED':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">HOXHUNT REPORT</span>;
      case 'TRAINING_COMPLETED':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">TRAINING PASSED</span>;
      case 'REMEDIATION_ASSIGNED':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">REMEDIATION QUEUED</span>;
      case 'EMAIL_OPENED':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">EMAIL OPENED</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700">DELIVERED</span>;
    }
  };

  const getSecurityAuditBadge = (type: string, status: string) => {
    if (status === 'FAILURE') {
      return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">AUTH FAILED</span>;
    }
    switch (type) {
      case 'MFA_VERIFIED_TOTP':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">MFA TOTP VERIFIED</span>;
      case 'MFA_VERIFIED_PASSKEY':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PASSKEY ATTESTED</span>;
      case 'MFA_CHALLENGE_ISSUED':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">MFA CHALLENGE ISSUED</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">SESSION AUTHORIZED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              CyberShield by TerraMind
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Hoxhunt Real-Time Telemetry
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>SOC Telemetry & Access Stream</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Granular interaction logs for simulated phishing attacks and Zero-Trust Security Authentication events
          </p>
        </div>

        {/* Stream Selector & Filters */}
        <div className="flex items-center space-x-2.5 text-xs">
          {/* Dual Stream Tabs */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'simulation'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Simulation Feeds</span>
            </button>
            <button
              onClick={() => setActiveTab('security_auth')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'security_auth'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security Auth Audit</span>
            </button>
          </div>

          {activeTab === 'simulation' && (
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
              >
                <option value="all">All Event Types</option>
                <option value="LINK_CLICKED">Phishing Link Clicks</option>
                <option value="SIMULATION_REPORTED">Simulation Reports</option>
                <option value="TRAINING_COMPLETED">Training Completions</option>
                <option value="REMEDIATION_ASSIGNED">Remediation Assignments</option>
                <option value="EMAIL_OPENED">Email Opens</option>
                <option value="EMAIL_DELIVERED">Email Deliveries</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* STREAM 1: SIMULATION EVENTS */}
      {activeTab === 'simulation' && (
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-3">
          {events.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">No simulation events match filter</p>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <Avatar
                    src={evt.avatarUrl}
                    name={evt.employeeName}
                    className="w-9 h-9 rounded-full border border-slate-700 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200">{evt.employeeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({evt.roleCategory})</span>
                      {getEventBadge(evt.eventType)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Campaign: <span className="text-slate-300 font-medium">{evt.campaignName}</span>
                      {evt.payload && ` • ${JSON.stringify(evt.payload)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>{new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* STREAM 2: SECURITY AUTHENTICATION AUDIT LOGS */}
      {activeTab === 'security_auth' && (
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-3">
          {securityLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No Security Authentication audit events recorded yet</span>
            </div>
          ) : (
            securityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    {log.authMethod.includes('Passkey') ? (
                      <Fingerprint className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200 font-mono">{log.email}</span>
                      {getSecurityAuditBadge(log.eventType, log.status)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Method: <span className="text-indigo-300 font-medium">{log.authMethod}</span>
                      <span className="text-slate-600 mx-1.5">•</span>
                      IP: <span className="text-slate-400 font-mono">{log.ipAddress}</span>
                      {log.details && log.details.codeUsed && (
                        <span className="text-slate-500 ml-1">({log.details.codeUsed})</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
