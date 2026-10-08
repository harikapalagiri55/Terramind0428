import { 
  OrgMetrics, 
  Campaign, 
  PhishingTemplate, 
  TrainingModule, 
  TrainingAssignment, 
  InteractionEvent, 
  InboxEmail, 
  DemoAccount, 
  User,
  LoginResponse,
  SecurityAuditLog,
  SecurityPosture
} from './types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('cybershield_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth & Security Authentication
  async getDemoUsers(): Promise<{ accounts: DemoAccount[] }> {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return res.json();
  },

  async login(email: string, password?: string, mfaCode?: string, directAuth?: boolean): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, mfaCode, directAuth }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async verifyMfa(mfaSessionToken: string, code: string): Promise<{ token: string; user: User; mfaVerified: boolean; authMethod: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaSessionToken, code }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'MFA verification failed');
    }
    return res.json();
  },

  async verifyPasskey(mfaSessionToken: string, passkeyCredential?: string): Promise<{ token: string; user: User; mfaVerified: boolean; authMethod: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-passkey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaSessionToken, passkeyCredential }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Biometric Passkey verification failed');
    }
    return res.json();
  },

  async switchUser(email: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Switch user failed');
    return res.json();
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get current user');
    return res.json();
  },

  async getSecurityLogs(): Promise<{ logs: SecurityAuditLog[] }> {
    const res = await fetch(`${API_BASE}/auth/security-logs`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load security audit logs');
    return res.json();
  },

  async getSecurityPosture(): Promise<{ posture: SecurityPosture }> {
    const res = await fetch(`${API_BASE}/auth/security-posture`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load security posture metrics');
    return res.json();
  },

  // Dashboard & Metrics
  async getDashboardStats(): Promise<OrgMetrics> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return res.json();
  },

  // Campaigns
  async getCampaigns(): Promise<{ campaigns: Campaign[] }> {
    const res = await fetch(`${API_BASE}/campaigns`, { headers: getHeaders() });
    return res.json();
  },

  async getCampaign(id: string): Promise<{ campaign: any }> {
    const res = await fetch(`${API_BASE}/campaigns/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async createCampaign(data: {
    name: string;
    description?: string;
    targetDepartmentId?: string;
    targetRole?: string;
    templateId: string;
    employeeIds?: string[];
  }): Promise<{ success: boolean; campaign: Campaign; targetsDelivered: number }> {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create campaign');
    }
    return res.json();
  },

  async launchCampaign(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/campaigns/${id}/launch`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  async pauseCampaign(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/campaigns/${id}/pause`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  async endCampaign(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/campaigns/${id}/end`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  // Templates
  async getTemplates(): Promise<{ templates: PhishingTemplate[] }> {
    const res = await fetch(`${API_BASE}/campaigns/templates/list`, { headers: getHeaders() });
    return res.json();
  },

  async synthesizeTemplate(data: {
    targetRole: string;
    topic?: string;
    brand?: string;
    difficulty?: string;
  }): Promise<{ template: PhishingTemplate }> {
    const res = await fetch(`${API_BASE}/campaigns/templates/synthesize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Synthesis failed');
    return res.json();
  },

  // Employees
  async getEmployees(params: {
    departmentId?: string;
    roleCategory?: string;
    remediationStatus?: string;
    search?: string;
  } = {}): Promise<{ employees: any[] }> {
    const url = new URL(`${window.location.origin}${API_BASE}/employees`);
    if (params.departmentId) url.searchParams.set('departmentId', params.departmentId);
    if (params.roleCategory) url.searchParams.set('roleCategory', params.roleCategory);
    if (params.remediationStatus) url.searchParams.set('remediationStatus', params.remediationStatus);
    if (params.search) url.searchParams.set('search', params.search);

    const res = await fetch(url.toString(), { headers: getHeaders() });
    return res.json();
  },

  async getEmployeeDetails(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/employees/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get employee details');
    return res.json();
  },

  async assignTraining(employeeId: string, moduleId: string): Promise<{ success: boolean; assignmentId: string }> {
    const res = await fetch(`${API_BASE}/employees/${employeeId}/assign-training`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ moduleId }),
    });
    return res.json();
  },

  // Employee Simulation & Inboxes
  async getInbox(employeeId?: string): Promise<{ employee: any; emails: InboxEmail[]; totalSimulations: number; pendingSimulations: number }> {
    const url = employeeId ? `${API_BASE}/simulations/inbox?employeeId=${employeeId}` : `${API_BASE}/simulations/inbox`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async openSimulation(campaignId: string, employeeId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/simulations/open`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ campaignId, employeeId }),
    });
    return res.json();
  },

  async clickPhishingLink(campaignId: string, employeeId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/simulations/click`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ campaignId, employeeId, userAgent: navigator.userAgent }),
    });
    return res.json();
  },

  async reportPhishing(campaignId: string, employeeId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/simulations/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ campaignId, employeeId }),
    });
    return res.json();
  },

  // Training
  async getTrainingModules(): Promise<{ modules: TrainingModule[] }> {
    const res = await fetch(`${API_BASE}/training/modules`, { headers: getHeaders() });
    return res.json();
  },

  async getMyAssignments(employeeId: string): Promise<{ assignments: TrainingAssignment[] }> {
    const res = await fetch(`${API_BASE}/training/my-assignments?employeeId=${employeeId}`, { headers: getHeaders() });
    return res.json();
  },

  async completeTraining(assignmentId: string, score: number): Promise<any> {
    const res = await fetch(`${API_BASE}/training/assignments/${assignmentId}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ score }),
    });
    return res.json();
  },

  // SOC Events Stream
  async getEvents(eventType?: string, limit = 50): Promise<{ events: InteractionEvent[] }> {
    const url = new URL(`${window.location.origin}${API_BASE}/events`);
    if (eventType) url.searchParams.set('eventType', eventType);
    url.searchParams.set('limit', limit.toString());
    const res = await fetch(url.toString(), { headers: getHeaders() });
    return res.json();
  },

  // Reports
  async getReportsSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/summary`, { headers: getHeaders() });
    return res.json();
  },

  async resetDemoDatabase(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reports/reset-demo`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  }
};
