export interface User {
  id: string;
  email: string;
  role: 'admin' | 'employee';
  mfaVerified?: boolean;
  authStrength?: string;
  authMethod?: string;
  employee?: EmployeeProfile | null;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  email?: string;
  roleTitle: string;
  roleCategory: 'Developer' | 'HR' | 'Finance' | 'Payroll' | 'Executive' | 'General';
  department: string;
  departmentId: string;
  riskScore: number;
  remediationStatus: 'good_standing' | 'remediation_required' | 'training_completed';
  resiliencePoints: number;
  streakCount: number;
  avatarUrl?: string;
  pendingTrainingCount?: number;
}

export interface DemoAccount {
  userId: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
  employeeId?: string;
  name: string;
  roleTitle: string;
  roleCategory: string;
  department: string;
  riskScore: number;
  remediationStatus: 'good_standing' | 'remediation_required' | 'training_completed';
  resiliencePoints: number;
  avatarUrl: string;
  mfaEnabled?: boolean;
  mfaMethod?: string;
  demoTotp?: string;
  authStrength?: string;
}

export interface MfaChallengeResponse {
  requiresMfa: true;
  mfaSessionToken: string;
  demoCode: string;
  authMethod: string;
  userSummary: {
    id: string;
    email: string;
    name: string;
    role: string;
    roleTitle: string;
    department: string;
    avatarUrl: string;
  };
  message: string;
}

export type LoginResponse = { token: string; user: User; mfaVerified?: boolean } | MfaChallengeResponse;

export interface SecurityAuditLog {
  id: string;
  userId?: string;
  email: string;
  eventType: string;
  authMethod: string;
  ipAddress: string;
  status: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface SecurityPosture {
  mfaPolicy: string;
  authStandards: string[];
  encryptionCipher: string;
  totalSecurityEvents: number;
  verifiedMfaSessions: number;
  complianceStatus: string;
  activeSessionProtection: string;
}

export interface PhishingTemplate {
  id: string;
  title: string;
  target_role: string;
  scenario: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sender_name: string;
  sender_email: string;
  subject: string;
  body_html: string;
  simulated_link_text: string;
  simulated_link_url: string;
  red_flags_json?: string;
  redFlags: string[];
  recommended_training_id?: string;
  training_title?: string;
  is_custom?: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  target_department_id?: string;
  target_role?: string;
  template_id: string;
  template_title?: string;
  scenario?: string;
  difficulty?: string;
  department_name?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  total_targets: number;
  clicked_count: number;
  reported_count: number;
  opened_count: number;
  clickRate: number;
  reportRate: number;
  created_at: string;
  launched_at?: string;
}

export interface CampaignTarget {
  id: string;
  campaign_id: string;
  employee_id: string;
  employee_name?: string;
  employee_email?: string;
  role_title?: string;
  role_category?: string;
  risk_score?: number;
  remediation_status?: string;
  avatar_url?: string;
  status: 'delivered' | 'opened' | 'clicked' | 'reported';
  delivered_at: string;
  opened_at?: string;
  clicked_at?: string;
  reported_at?: string;
}

export interface InteractionEvent {
  id: string;
  eventType: 'EMAIL_DELIVERED' | 'EMAIL_OPENED' | 'LINK_CLICKED' | 'SIMULATION_REPORTED' | 'TRAINING_OPENED' | 'TRAINING_COMPLETED' | 'REMEDIATION_ASSIGNED';
  employeeName: string;
  employeeEmail: string;
  roleCategory: string;
  department?: string;
  avatarUrl?: string;
  campaignName: string;
  payload: Record<string, any>;
  createdAt: string;
}

export interface RiskHistoryItem {
  id: string;
  previous_score: number;
  new_score: number;
  change_delta: number;
  reason: string;
  created_at: string;
  employee_name?: string;
  role_category?: string;
  avatar_url?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  target_role: string;
  category: string;
  estimated_minutes: number;
  description: string;
  indicators: string[];
  content_markdown: string;
  quiz: QuizQuestion[];
}

export interface TrainingAssignment {
  id: string;
  employee_id: string;
  module_id: string;
  campaign_id?: string;
  status: 'assigned' | 'in_progress' | 'completed';
  score: number;
  assigned_at: string;
  completed_at?: string;
  module_title: string;
  category: string;
  target_role: string;
  estimated_minutes: number;
  description: string;
  indicators: string[];
  content_markdown: string;
  quiz: QuizQuestion[];
  campaign_name?: string;
}

export interface OrgMetrics {
  hvi: number;
  orgSecurityScore: number;
  riskBand: string;
  riskBandColor: string;
  activeCampaigns: number;
  totalCampaigns: number;
  totalEmployees: number;
  totalTested: number;
  clickedTotal: number;
  reportedTotal: number;
  openedTotal: number;
  clickRate: number;
  reportRate: number;
  remediationRequired: number;
  trainingCompleted: number;
  goodStanding: number;
  departments: {
    id: string;
    name: string;
    employee_count: number;
    avg_risk: number;
    total_simulations: number;
    total_clicks: number;
    total_reports: number;
    click_rate: number;
  }[];
  roleRisk: {
    role: string;
    count: number;
    avg_risk: number;
    clicks: number;
    reports: number;
  }[];
  recentEvents: InteractionEvent[];
  topScenarios: {
    scenario: string;
    role: string;
    delivered: number;
    clicked: number;
    reported: number;
    clickRate: number;
  }[];
  recentRiskAdjustments: RiskHistoryItem[];
}

export interface InboxEmail {
  id: string;
  isSimulation: boolean;
  campaignId?: string;
  targetId?: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  bodyHtml: string;
  linkText?: string;
  linkUrl?: string;
  difficulty?: string;
  scenario?: string;
  redFlags?: string[];
  recommendedTrainingId?: string;
  status?: 'delivered' | 'opened' | 'clicked' | 'reported';
  timestamp: string;
  isUnread?: boolean;
}
