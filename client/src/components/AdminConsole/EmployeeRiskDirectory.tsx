import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  GraduationCap, 
  Clock, 
  X, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  RotateCcw
} from 'lucide-react';
import { Avatar } from '../Avatar';

interface EmployeeRiskDirectoryProps {
  onNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const EmployeeRiskDirectory: React.FC<EmployeeRiskDirectoryProps> = ({ onNotification }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected employee detail drawer
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [empDetails, setEmpDetails] = useState<any | null>(null);
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [selectedModuleToAssign, setSelectedModuleToAssign] = useState('');

  const loadEmployees = async () => {
    try {
      const res = await api.getEmployees({
        departmentId: deptFilter,
        roleCategory: roleFilter,
        remediationStatus: statusFilter,
        search
      });
      setEmployees(res.employees);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [deptFilter, roleFilter, statusFilter, search]);

  useEffect(() => {
    async function loadMeta() {
      const [statsRes, tmRes] = await Promise.all([
        api.getDashboardStats(),
        api.getTrainingModules()
      ]);
      setDepartments(statsRes.departments);
      setTrainingModules(tmRes.modules);
      if (tmRes.modules.length > 0) setSelectedModuleToAssign(tmRes.modules[0].id);
    }
    loadMeta();
  }, []);

  const openEmployeeDetail = async (emp: any) => {
    setSelectedEmp(emp);
    try {
      const details = await api.getEmployeeDetails(emp.id);
      setEmpDetails(details);
    } catch {
      onNotification('Failed to load employee details', 'warning');
    }
  };

  const handleAssignTraining = async () => {
    if (!selectedEmp || !selectedModuleToAssign) return;
    try {
      await api.assignTraining(selectedEmp.id, selectedModuleToAssign);
      onNotification(`Micro-training assigned to ${selectedEmp.name}`, 'success');
      // Refresh details
      const details = await api.getEmployeeDetails(selectedEmp.id);
      setEmpDetails(details);
      loadEmployees();
    } catch {
      onNotification('Failed to assign training', 'warning');
    }
  };

  const getRiskBadge = (score: number) => {
    if (score > 70) return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">Crit Risk: {score}</span>;
    if (score > 45) return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">High Risk: {score}</span>;
    if (score > 25) return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Med Risk: {score}</span>;
    return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Low Risk: {score}</span>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'remediation_required':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">REMEDIATION REQUIRED</span>;
      case 'training_completed':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">TRAINING PASSED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">GOOD STANDING</span>;
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
              Hoxhunt Behavioral Profiling
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Human Risk & Employee Directory</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {employees.length} Personnel Monitored
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explainable vulnerability scores, Hoxhunt simulation telemetry, and active remediation tracking
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name, title..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dept Filter */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Developer">Developer</option>
            <option value="Payroll">Payroll</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Executive">Executive</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
          >
            <option value="all">All Remediation States</option>
            <option value="remediation_required">Remediation Required</option>
            <option value="training_completed">Training Completed</option>
            <option value="good_standing">Good Standing</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A12]/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4 text-center">Risk Score</th>
                <th className="py-3.5 px-4 text-center">Simulations</th>
                <th className="py-3.5 px-4">Remediation Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.map((emp) => (
                <tr 
                  key={emp.id} 
                  className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                  onClick={() => openEmployeeDetail(emp)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={emp.avatar_url}
                        name={emp.name}
                        className="w-9 h-9 rounded-full border border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-slate-100">{emp.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{emp.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-slate-200 font-medium">{emp.role_title}</p>
                    <p className="text-[11px] text-slate-400">{emp.department_name}</p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {getRiskBadge(emp.risk_score)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="text-[11px] text-slate-300">
                      <span>Tested: <strong>{emp.simulations_tested}</strong></span>
                      <span className="text-slate-600 mx-1.5">•</span>
                      <span className="text-rose-400">Clicks: <strong>{emp.simulations_clicked}</strong></span>
                      <span className="text-slate-600 mx-1.5">•</span>
                      <span className="text-emerald-400">Reports: <strong>{emp.simulations_reported}</strong></span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(emp.remediation_status)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEmployeeDetail(emp);
                      }}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-indigo-500/30 transition-all"
                    >
                      Audit Score &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainable Risk Detail Drawer / Modal */}
      {selectedEmp && empDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-[#0F1523] border border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3.5">
                <Avatar
                  src={empDetails.employee.avatar_url}
                  name={empDetails.employee.name}
                  className="w-12 h-12 rounded-full border border-slate-700"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{empDetails.employee.name}</h3>
                    {getStatusBadge(empDetails.employee.remediation_status)}
                  </div>
                  <p className="text-xs text-slate-400">{empDetails.employee.role_title} • {empDetails.employee.department_name}</p>
                </div>
              </div>

              <button
                onClick={() => { setSelectedEmp(null); setEmpDetails(null); }}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Tabs / Scrollable Area */}
            <div className="overflow-y-auto py-4 space-y-6 flex-1 text-xs">
              
              {/* Score & Explainable Factor Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center flex flex-col justify-center">
                  <span className="text-[11px] uppercase font-bold text-slate-400">Current Risk Score</span>
                  <div className="text-4xl font-black text-rose-400 my-2">{empDetails.employee.risk_score}</div>
                  <span className="text-[11px] text-slate-400">Scale: 0 (Immunized) to 100 (Critical)</span>
                  <div className="mt-3 text-[11px] text-emerald-400 font-semibold">
                    Resilience XP: {empDetails.employee.resilience_points} pts
                  </div>
                </div>

                <div className="md:col-span-2 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Explainable Risk Factors</h4>
                  <div className="space-y-2">
                    {empDetails.explainableFactors.map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div>
                          <span className="font-semibold text-slate-200">{f.factor}</span>
                          <p className="text-[10px] text-slate-400">{f.description}</p>
                        </div>
                        <span className={`font-mono font-bold ${f.impact.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {f.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score History Trail */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Historical Score Audit Trail (Why Score Changed)</h4>
                <div className="space-y-2">
                  {empDetails.riskHistory.map((rh: any) => (
                    <div key={rh.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">{new Date(rh.created_at).toLocaleString()}</span>
                        <span className={`font-mono font-bold ${rh.change_delta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {rh.change_delta > 0 ? `+${rh.change_delta}` : rh.change_delta} pts ({rh.previous_score} &rarr; {rh.new_score})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{rh.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Remediation Section */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Targeted Micro-Training Assignments</h4>
                  
                  {/* Manual Assignment Controls */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <select
                      value={selectedModuleToAssign}
                      onChange={(e) => setSelectedModuleToAssign(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-[11px]"
                    >
                      {trainingModules.map((tm) => (
                        <option key={tm.id} value={tm.id}>{tm.title}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignTraining}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold whitespace-nowrap"
                    >
                      Assign Training
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {empDetails.trainingAssignments.length === 0 ? (
                    <p className="text-slate-500 text-center py-2">No active training assignments</p>
                  ) : (
                    empDetails.trainingAssignments.map((ta: any) => (
                      <div key={ta.id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-200">{ta.module_title}</p>
                          <p className="text-[10px] text-slate-400">Assigned: {new Date(ta.assigned_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ta.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {ta.status === 'completed' ? `COMPLETED (${ta.score}%)` : 'PENDING'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
