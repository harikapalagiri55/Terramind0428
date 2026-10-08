import { unifiedBackend } from './services/unifiedBackend';
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

/**
 * CyberShield by TerraMind - Unified Single-Website Architecture
 * Merges client and backend engine into one seamless, zero-latency,
 * self-contained application for 100% reliable Vercel deployments.
 */
export const api = {
  // Auth & Security Authentication
  async getDemoUsers(): Promise<{ accounts: DemoAccount[] }> {
    return unifiedBackend.getDemoUsers();
  },

  async login(email: string, password?: string, mfaCode?: string, directAuth?: boolean): Promise<LoginResponse> {
    return unifiedBackend.login(email, password, mfaCode, directAuth);
  },

  async verifyMfa(mfaSessionToken: string, code: string): Promise<{ token: string; user: User; mfaVerified: boolean; authMethod: string }> {
    return unifiedBackend.verifyMfa(mfaSessionToken, code);
  },

  async verifyPasskey(mfaSessionToken: string, passkeyCredential?: string): Promise<{ token: string; user: User; mfaVerified: boolean; authMethod: string }> {
    return unifiedBackend.verifyPasskey(mfaSessionToken, passkeyCredential);
  },

  async switchUser(email: string): Promise<{ token: string; user: User }> {
    return unifiedBackend.switchUser(email);
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return unifiedBackend.getCurrentUser();
  },

  async getSecurityLogs(): Promise<{ logs: SecurityAuditLog[] }> {
    return unifiedBackend.getSecurityLogs();
  },

  async getSecurityPosture(): Promise<{ posture: SecurityPosture }> {
    return unifiedBackend.getSecurityPosture();
  },

  // Dashboard & Metrics
  async getDashboardStats(): Promise<OrgMetrics> {
    return unifiedBackend.getDashboardStats();
  },

  // Campaigns
  async getCampaigns(): Promise<{ campaigns: Campaign[] }> {
    return unifiedBackend.getCampaigns();
  },

  async getCampaign(id: string): Promise<{ campaign: any }> {
    return unifiedBackend.getCampaign(id);
  },

  async createCampaign(data: {
    name: string;
    description?: string;
    targetDepartmentId?: string;
    targetRole?: string;
    templateId: string;
    employeeIds?: string[];
  }): Promise<{ success: boolean; campaign: Campaign; targetsDelivered: number }> {
    return unifiedBackend.createCampaign(data);
  },

  async launchCampaign(id: string): Promise<{ success: boolean }> {
    return unifiedBackend.launchCampaign(id);
  },

  async pauseCampaign(id: string): Promise<{ success: boolean }> {
    return unifiedBackend.pauseCampaign(id);
  },

  async endCampaign(id: string): Promise<{ success: boolean }> {
    return unifiedBackend.endCampaign(id);
  },

  // Templates
  async getTemplates(): Promise<{ templates: PhishingTemplate[] }> {
    return unifiedBackend.getTemplates();
  },

  async synthesizeTemplate(data: {
    targetRole: string;
    topic?: string;
    brand?: string;
    difficulty?: string;
  }): Promise<{ template: PhishingTemplate }> {
    return unifiedBackend.synthesizeTemplate(data);
  },

  // Employees
  async getEmployees(params: {
    departmentId?: string;
    roleCategory?: string;
    remediationStatus?: string;
    search?: string;
  } = {}): Promise<{ employees: any[] }> {
    return unifiedBackend.getEmployees(params);
  },

  async getEmployeeDetails(id: string): Promise<any> {
    return unifiedBackend.getEmployeeDetails(id);
  },

  async assignTraining(employeeId: string, moduleId: string): Promise<{ success: boolean; assignmentId: string }> {
    return unifiedBackend.assignTraining(employeeId, moduleId);
  },

  // Employee Simulation & Inboxes
  async getInbox(employeeId?: string): Promise<{ employee: any; emails: InboxEmail[]; totalSimulations: number; pendingSimulations: number }> {
    return unifiedBackend.getInbox(employeeId);
  },

  async openSimulation(campaignId: string, employeeId: string): Promise<{ success: boolean }> {
    return unifiedBackend.openSimulation(campaignId, employeeId);
  },

  async clickPhishingLink(campaignId: string, employeeId: string): Promise<any> {
    return unifiedBackend.clickPhishingLink(campaignId, employeeId);
  },

  async reportPhishing(campaignId: string, employeeId: string): Promise<any> {
    return unifiedBackend.reportPhishing(campaignId, employeeId);
  },

  // Training
  async getTrainingModules(): Promise<{ modules: TrainingModule[] }> {
    return unifiedBackend.getTrainingModules();
  },

  async getMyAssignments(employeeId: string): Promise<{ assignments: TrainingAssignment[] }> {
    return unifiedBackend.getMyAssignments(employeeId);
  },

  async completeTraining(assignmentId: string, score: number): Promise<any> {
    return unifiedBackend.completeTraining(assignmentId, score);
  },

  // SOC Events Stream
  async getEvents(eventType?: string, limit = 50): Promise<{ events: InteractionEvent[] }> {
    return unifiedBackend.getEvents(limit);
  },

  // Reports
  async getReportsSummary(): Promise<any> {
    return unifiedBackend.getReportsSummary();
  },

  async resetDemoDatabase(): Promise<{ success: boolean; message: string }> {
    return unifiedBackend.resetDatabase();
  }
};
