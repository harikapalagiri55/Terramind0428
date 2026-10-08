import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Download, FileText, CheckCircle2, RotateCcw, ShieldCheck, Award } from 'lucide-react';

interface ReportsViewProps {
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onNotification }) => {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getReportsSummary();
        setReport(data);
      } catch {
        onNotification('Failed to load report summary', 'warning');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDownloadCsv = () => {
    window.open('/api/reports/export-csv', '_blank');
    onNotification('Exporting campaign audit CSV...', 'info');
  };

  const handleReset = async () => {
    if (confirm('Reset database to clean initial seeded demo state?')) {
      try {
        await api.resetDemoDatabase();
        onNotification('Database reset successfully! Reloading...', 'success');
        window.location.reload();
      } catch {
        onNotification('Failed to reset database', 'warning');
      }
    }
  };

  if (loading || !report) {
    return <div className="p-8 text-center text-xs text-slate-500">Generating compliance report...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>CyberShield Executive Audit</span>
            <span className="text-xs font-semibold text-slate-400">by</span>
            <span className="text-sm font-bold text-indigo-400 font-mono">TerraMind</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Audit-ready documentation powered by Hoxhunt human risk behavioral models</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-glow-indigo transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 text-xs transition-all"
            title="Reset database to clean state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compliance Frameworks Alignment Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5">
          <Award className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Regulatory Security Framework Alignment</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {report.complianceFrameworks.map((fw: string, i: number) => (
            <div key={i} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold text-slate-200">{fw}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Audit Performance Table */}
      <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Campaign Drill Compliance Log</h3>
          <p className="text-xs text-slate-400">Verifiable delivery, failure click rates, and defense ratios</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A12]/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Target Role / Dept</th>
                <th className="py-3 px-4 text-center">Targets</th>
                <th className="py-3 px-4 text-center">Clicks (Fail Rate)</th>
                <th className="py-3 px-4 text-center">Reports (Catch Rate)</th>
                <th className="py-3 px-4 text-center">Defense Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report.campaignReports.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-900/60">
                  <td className="py-3.5 px-4 font-bold text-slate-100">{c.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{c.target_role || 'All'} • {c.department_name || 'Corp'}</td>
                  <td className="py-3.5 px-4 text-center font-mono">{c.total_targets}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-rose-400">{c.clicked_count} ({c.clickRate}%)</td>
                  <td className="py-3.5 px-4 text-center font-mono text-emerald-400">{c.reported_count} ({c.reportRate}%)</td>
                  <td className="py-3.5 px-4 text-center font-mono text-indigo-400 font-bold">{c.resilienceRatio}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
