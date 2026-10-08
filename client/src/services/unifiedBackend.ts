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
} from '../types';

const STORAGE_KEY = 'cybershield_unified_store_v2';

// 1. Initial Baseline Personas
const INITIAL_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    userId: 'usr_admin',
    email: 'admin@cybershield.corp',
    password: 'admin123',
    role: 'admin',
    name: 'Chief Information Security Officer (SOC Lead)',
    roleTitle: 'Head of SOC & Threat Intelligence',
    roleCategory: 'Security Admin',
    department: 'Information Security / SOC',
    riskScore: 10,
    remediationStatus: 'good_standing',
    resiliencePoints: 500,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    mfaEnabled: true,
    mfaMethod: 'TOTP 6-Digit + FIDO2 Passkey',
    demoTotp: '749281',
    authStrength: 'Zero-Trust Hardened (MFA)'
  },
  {
    userId: 'usr_alex',
    employeeId: 'emp_alex',
    email: 'alex.dev@cybershield.corp',
    password: 'demo123',
    role: 'employee',
    name: 'Alex Chen',
    roleTitle: 'Senior Full-Stack Engineer',
    roleCategory: 'Developer',
    department: 'Engineering & Cloud Security',
    riskScore: 22,
    remediationStatus: 'good_standing',
    resiliencePoints: 340,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    mfaEnabled: true,
    mfaMethod: 'TOTP 6-Digit + FIDO2 Passkey',
    demoTotp: '749281',
    authStrength: 'Zero-Trust Hardened (MFA)'
  },
  {
    userId: 'usr_david',
    employeeId: 'emp_david',
    email: 'david.finance@cybershield.corp',
    password: 'demo123',
    role: 'employee',
    name: 'David Miller',
    roleTitle: 'Treasury & Accounts Payable Lead',
    roleCategory: 'Finance',
    department: 'Global Finance & Treasury',
    riskScore: 68,
    remediationStatus: 'remediation_required',
    resiliencePoints: 80,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mfaEnabled: true,
    mfaMethod: 'TOTP 6-Digit + FIDO2 Passkey',
    demoTotp: '749281',
    authStrength: 'Zero-Trust Hardened (MFA)'
  },
  {
    userId: 'usr_elena',
    employeeId: 'emp_elena',
    email: 'elena.exec@cybershield.corp',
    password: 'demo123',
    role: 'employee',
    name: 'Elena Vance',
    roleTitle: 'VP of Global Strategic Partnerships',
    roleCategory: 'Executive',
    department: 'Executive Leadership & Strategy',
    riskScore: 42,
    remediationStatus: 'good_standing',
    resiliencePoints: 210,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    mfaEnabled: true,
    mfaMethod: 'TOTP 6-Digit + FIDO2 Passkey',
    demoTotp: '749281',
    authStrength: 'Zero-Trust Hardened (MFA)'
  },
  {
    userId: 'usr_jessica',
    employeeId: 'emp_jessica',
    email: 'jessica.acct@cybershield.corp',
    password: 'demo123',
    role: 'employee',
    name: 'Jessica Taylor',
    roleTitle: 'Senior Financial Analyst',
    roleCategory: 'Finance',
    department: 'Global Finance & Treasury',
    riskScore: 54,
    remediationStatus: 'remediation_required',
    resiliencePoints: 120,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    mfaEnabled: true,
    mfaMethod: 'TOTP 6-Digit + FIDO2 Passkey',
    demoTotp: '749281',
    authStrength: 'Zero-Trust Hardened (MFA)'
  },
  {
    userId: 'usr_marcus',
    employeeId: 'emp_marcus',
    email: 'marcus.ops@cybershield.corp',
    password: 'demo123',
    role: 'employee',
    name: 'Marcus Vance',
    roleTitle: 'Lead DevOps & SRE Architect',
    roleCategory: 'Developer',
    department: 'Engineering & Cloud Security',
    riskScore: 18,
    remediationStatus: 'good_standing',
    resiliencePoints: 460,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    mfaEnabled: true,
    mfaMethod: 'TOTP 6-Digit + FIDO2 Passkey',
    demoTotp: '749281',
    authStrength: 'Zero-Trust Hardened (MFA)'
  },
  {
    userId: 'usr_sarah',
    employeeId: 'emp_sarah',
    email: 'sarah.hr@cybershield.corp',
    password: 'demo123',
    role: 'employee',
    name: 'Sarah Jenkins',
    roleTitle: 'Director of People Operations',
    roleCategory: 'HR',
    department: 'People Operations & HR',
    riskScore: 34,
    remediationStatus: 'good_standing',
    resiliencePoints: 290,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    mfaEnabled: true,
    mfaMethod: 'TOTP 6-Digit + FIDO2 Passkey',
    demoTotp: '749281',
    authStrength: 'Zero-Trust Hardened (MFA)'
  },
  {
    userId: 'usr_tom',
    employeeId: 'emp_tom',
    email: 'tom.sales@cybershield.corp',
    password: 'demo123',
    role: 'employee',
    name: 'Tom Wilson',
    roleTitle: 'Enterprise Account Executive',
    roleCategory: 'General',
    department: 'Global Sales & Enterprise',
    riskScore: 48,
    remediationStatus: 'good_standing',
    resiliencePoints: 175,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    mfaEnabled: true,
    mfaMethod: 'TOTP 6-Digit + FIDO2 Passkey',
    demoTotp: '749281',
    authStrength: 'Zero-Trust Hardened (MFA)'
  }
];

// 2. Initial Micro-Training Modules
const INITIAL_TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'tm_dev_token',
    title: 'Developer Hygiene: Protecting API Tokens, SSH Keys & CI/CD Credentials',
    target_role: 'Developer',
    category: 'Credential Hygiene',
    estimated_minutes: 3,
    description: 'Learn how spear-phishers impersonate Git providers and DevOps tooling to hijack access tokens.',
    indicators: [
      'Lookalike domain in sender header (e.g., github-enterprise-sec.net)',
      'Fake urgency demanding immediate token re-authorization',
      'Unsigned emails asking for personal access tokens or OAuth permissions'
    ],
    content_markdown: `### What Just Happened?
You received an email simulating an urgent GitHub token revocation notification. 

### Why Threat Actors Target Developers
Developers hold elevated keys to the kingdom: repository write permissions, production cloud secrets, and package publishing tokens. A single harvested token can result in severe supply chain compromise.

### 3 Rules of Defense
1. **Verify the Domain**: Genuine notifications from GitHub only originate from \`github.com\` or \`githubmail.com\`.
2. **Never Paste Tokens via Email Links**: Navigate directly to your organization settings at github.com/settings/tokens.
3. **Use Short-Lived Fine-Grained Tokens**: Restrict token lifetimes to 30 days and enforce mandatory branch protection.`,
    quiz: [
      {
        question: 'Which of the following sender domains indicates an active phishing impersonation attempt?',
        options: [
          'support@github.com',
          'notifications@githubmail.com',
          'sec-alerts@github-enterprise-sec.net',
          'noreply@github.com'
        ],
        correctIndex: 2,
        explanation: 'github-enterprise-sec.net is a typo-squatted fake domain designed to fool inattentive engineers.'
      },
      {
        question: 'What is the immediate best action when prompted by email to revoke a leaked token?',
        options: [
          'Click the email button and enter your password',
          'Forward the token to your personal Gmail',
          'Navigate directly to your provider settings in a new tab without using the email link',
          'Ignore the notification entirely'
        ],
        correctIndex: 2,
        explanation: 'Always navigate directly to legitimate portals rather than following links inside unsolicited emails.'
      }
    ]
  },
  {
    id: 'tm_finance',
    title: 'Defending Against Invoice Fraud & Business Email Compromise (BEC)',
    target_role: 'Finance',
    category: 'BEC & Wire Fraud',
    estimated_minutes: 3,
    description: 'Master verification protocols for high-value fund disbursements and wire route alterations.',
    indicators: [
      'CEO / Executive spoofing requesting confidential out-of-band wire payments',
      'Sudden change in vendor banking coordinates before settlement',
      'False urgency: "Urgent wire before market close"'
    ],
    content_markdown: `### Why BEC is Dangerous
Business Email Compromise (BEC) accounts for billions of dollars in global annual losses. Cyber criminals mimic executive speech patterns to trick finance controllers into releasing funds.

### The Zero-Trust Protocol
- **Out-of-Band Callback**: Always call the vendor using a pre-verified phone number on file before modifying banking details.
- **Dual Authorization**: Never release transactions over $10,000 without 2-person sign-off.`,
    quiz: [
      {
        question: 'A supplier sends an urgent email stating their routing account has changed. What must you do?',
        options: [
          'Process the change immediately to avoid late fees',
          'Reply directly to the email asking if it is authentic',
          'Conduct an out-of-band phone verification using a known trusted phone number',
          'Pay half the amount first to verify'
        ],
        correctIndex: 2,
        explanation: 'Out-of-band voice verification with established contacts is mandatory to prevent invoice redirection.'
      }
    ]
  },
  {
    id: 'tm_payroll',
    title: 'Payroll & HR Data Protection: Direct Deposit Redirection Defense',
    target_role: 'HR',
    category: 'Identity Verification',
    estimated_minutes: 3,
    description: 'Detect fraudulent requests attempting to divert employee paychecks and export W-2 tax data.',
    indicators: [
      'Employee requesting direct deposit change from external disposable email address',
      'Urgent requests close to payroll cutoff dates',
      'Requests for mass employee tax documents or SSN exports'
    ],
    content_markdown: `### Anatomy of Payroll Diversion
Attackers harvest employee names and title info on LinkedIn, then email HR using lookalike personal email addresses requesting urgent direct deposit redirection.`,
    quiz: [
      {
        question: 'An executive emails asking for employee tax records via an external personal email. What is the correct response?',
        options: [
          'Send the documents immediately since it is an executive',
          'Report the email to Information Security and refuse transmission of PII',
          'Reply asking for their employee ID',
          'Post the files on a shared Slack channel'
        ],
        correctIndex: 1,
        explanation: 'PII must never be transmitted to external or unverified channels.'
      }
    ]
  }
];

// 3. Initial Phishing Templates
const INITIAL_TEMPLATES: PhishingTemplate[] = [
  {
    id: 'tpl_github_token',
    title: 'GitHub Enterprise: Public Commit Token Leak Revocation Notice',
    target_role: 'Developer',
    scenario: 'Credential Harvesting & OAuth Scope Hijacking',
    difficulty: 'Hard',
    sender_name: 'GitHub Security Operations Center',
    sender_email: 'sec-alerts@github-enterprise-sec.net',
    subject: '[SECURITY ALERT] Revocation required: leaked credential detected in public commit',
    body_html: `<div style="font-family: -apple-system, sans-serif; color: #24292f; max-width: 580px; margin: 0 auto; border: 1px solid #d0d7de; border-radius: 8px; overflow: hidden;">
      <div style="background: #24292f; padding: 14px 20px; color: white;">
        <strong>GitHub Security Operations Center</strong>
      </div>
      <div style="padding: 20px; background: white;">
        <p>Hi Alex,</p>
        <p>A classic Personal Access Token assigned to <code>alex.dev@cybershield.corp</code> was found in a public repository commit.</p>
        <div style="background: #fff8c5; border-left: 4px solid #d4a72c; padding: 10px; margin: 15px 0; font-family: monospace; font-size: 12px;">
          Token: ghp_917349182**** (Scopes: repo, workflow, write:packages)
        </div>
        <p>If you did not authorize this leak, please revoke the credential immediately:</p>
      </div>
    </div>`,
    simulated_link_text: 'Revoke and Re-Authenticate GitHub Access Token',
    simulated_link_url: 'https://github-enterprise-sec.net/auth/revoke-session?token=ghp_92817491',
    redFlags: [
      'Sender uses spoofed lookalike domain "github-enterprise-sec.net"',
      'Requests urgent credential confirmation to harvest OAuth permissions'
    ],
    recommended_training_id: 'tm_dev_token',
    training_title: 'Developer Hygiene: Protecting API Tokens, SSH Keys & CI/CD Credentials'
  },
  {
    id: 'tpl_wire_fraud',
    title: 'Executive Wire Transfer Authorization [Urgent Fiscal Settlement]',
    target_role: 'Finance',
    scenario: 'Business Email Compromise (BEC)',
    difficulty: 'Hard',
    sender_name: 'Elena Vance (VP Strategic Strategy)',
    sender_email: 'elena.vance@cybershield-exec.com',
    subject: 'URGENT: Settlement authorization for Project Apex ($148,500.00)',
    body_html: `<p>David,</p><p>We have reached final closing on Project Apex. Please process the initial retainer wire before 3:00 PM EST.</p>`,
    simulated_link_text: 'Authorize Wire Release via Treasury Portal',
    simulated_link_url: 'https://cybershield-exec.com/treasury/wire-approve',
    redFlags: [
      'Spoofed domain cybershield-exec.com instead of cybershield.corp',
      'Artificial deadline pressure to bypass dual authorization'
    ],
    recommended_training_id: 'tm_finance',
    training_title: 'Defending Against Invoice Fraud & Business Email Compromise (BEC)'
  }
];

// Helper to construct Initial State
function getInitialState() {
  return {
    accounts: [...INITIAL_DEMO_ACCOUNTS],
    trainingModules: [...INITIAL_TRAINING_MODULES],
    templates: [...INITIAL_TEMPLATES],
    campaigns: [
      {
        id: 'cmp_dev_drill',
        name: 'Q4 Developer Supply Chain Spear-Phish Drill',
        description: 'Simulates GitHub token leaks targeting engineering personnel.',
        target_role: 'Developer',
        template_id: 'tpl_github_token',
        template_title: 'GitHub Enterprise Token Leak Notice',
        scenario: 'Credential Harvesting',
        difficulty: 'Hard',
        status: 'active' as const,
        total_targets: 4,
        clicked_count: 1,
        reported_count: 2,
        opened_count: 3,
        clickRate: 25,
        reportRate: 50,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'cmp_finance_drill',
        name: 'Executive Wire & BEC Defense Simulation',
        description: 'Evaluates accounts payable resilience against executive spoofing.',
        target_role: 'Finance',
        template_id: 'tpl_wire_fraud',
        template_title: 'Executive Wire Transfer Authorization',
        scenario: 'Business Email Compromise',
        difficulty: 'Hard',
        status: 'active' as const,
        total_targets: 2,
        clicked_count: 1,
        reported_count: 1,
        opened_count: 2,
        clickRate: 50,
        reportRate: 50,
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ] as Campaign[],
    inboxes: {
      emp_alex: [
        {
          id: 'mail_sim_alex',
          targetId: 'tgt_alex_1',
          campaignId: 'cmp_dev_drill',
          senderName: 'GitHub Security Operations Center',
          senderEmail: 'sec-alerts@github-enterprise-sec.net',
          subject: '[SECURITY ALERT] Revocation required: leaked credential detected in public commit',
          timestamp: new Date().toISOString(),
          isSimulation: true,
          status: 'opened',
          bodyHtml: `<div style="font-family: -apple-system, sans-serif; color: #24292f; max-width: 580px; margin: 0 auto; border: 1px solid #d0d7de; border-radius: 8px; overflow: hidden;">
            <div style="background: #24292f; padding: 14px 20px; color: white;">
              <strong>GitHub Security Operations Center</strong>
            </div>
            <div style="padding: 20px; background: white;">
              <p>Hi Alex,</p>
              <p>A classic Personal Access Token assigned to <code>alex.dev@cybershield.corp</code> was found in a public repository commit.</p>
              <div style="background: #fff8c5; border-left: 4px solid #d4a72c; padding: 10px; margin: 15px 0; font-family: monospace; font-size: 12px;">
                Token: ghp_917349182**** (Scopes: repo, workflow, write:packages)
              </div>
              <p>If you did not authorize this leak, please revoke the credential immediately:</p>
            </div>
          </div>`,
          linkText: 'Revoke and Re-Authenticate GitHub Access Token',
          linkUrl: 'https://github-enterprise-sec.net/auth/revoke-session?token=ghp_92817491',
          redFlags: [
            'Sender uses spoofed lookalike domain "github-enterprise-sec.net"',
            'Requests urgent credential confirmation to harvest OAuth permissions'
          ],
          isUnread: false
        },
        {
          id: 'mail_legit_alex_1',
          senderName: 'AWS CloudWatch Alerts',
          senderEmail: 'alerts@amazonaws.com',
          subject: 'ALARM: Kubernetes Pod Memory Utilization at 82% in us-east-1',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          isSimulation: false,
          status: 'delivered',
          bodyHtml: `<p>Auto-scaling alert: API gateway worker pods memory threshold exceeded 80% for 5 consecutive minutes.</p>`,
          isUnread: true
        }
      ] as InboxEmail[],
      emp_david: [
        {
          id: 'mail_sim_david',
          targetId: 'tgt_david_1',
          campaignId: 'cmp_finance_drill',
          senderName: 'Elena Vance (VP Strategic Strategy)',
          senderEmail: 'elena.vance@cybershield-exec.com',
          subject: 'URGENT: Settlement authorization for Project Apex ($148,500.00)',
          timestamp: new Date().toISOString(),
          isSimulation: true,
          status: 'opened',
          bodyHtml: `<p>David,</p><p>We have reached final closing on Project Apex. Please process the initial retainer wire before 3:00 PM EST today.</p>`,
          linkText: 'Authorize Wire Release via Treasury Portal',
          linkUrl: 'https://cybershield-exec.com/treasury/wire-approve',
          redFlags: [
            'Spoofed domain cybershield-exec.com instead of cybershield.corp',
            'Artificial deadline pressure to bypass dual authorization'
          ],
          isUnread: false
        }
      ] as InboxEmail[]
    } as Record<string, InboxEmail[]>,
    assignments: [
      {
        id: 'ta_david_1',
        employee_id: 'emp_david',
        module_id: 'tm_finance',
        module_title: 'Defending Against Invoice Fraud & Business Email Compromise (BEC)',
        category: 'BEC & Wire Fraud',
        target_role: 'Finance',
        estimated_minutes: 3,
        description: 'Mandatory remediation drill assigned due to simulated wire fraud engagement.',
        status: 'assigned' as const,
        score: 0,
        assigned_at: new Date(Date.now() - 1800000).toISOString(),
        indicators: [
          'CEO / Executive spoofing requesting confidential out-of-band wire payments',
          'Sudden change in vendor banking coordinates before settlement'
        ],
        content_markdown: `### Mandatory Remediation
You clicked on an unverified wire release request. Review the two-person rule for all corporate disbursements over $10,000.`,
        quiz: INITIAL_TRAINING_MODULES[1].quiz
      }
    ] as TrainingAssignment[],
    events: [
      {
        id: 'evt_init_1',
        eventType: 'SIMULATION_REPORTED' as const,
        employeeName: 'Alex Chen',
        employeeEmail: 'alex.dev@cybershield.corp',
        roleCategory: 'Developer',
        campaignName: 'Q4 Developer Spear-Phish Drill',
        payload: {
          reporter: 'Hoxhunt Interceptor Plugin',
          timeToReportSeconds: 42,
          redFlagsFound: 2
        },
        createdAt: new Date(Date.now() - 900000).toISOString()
      },
      {
        id: 'evt_init_2',
        eventType: 'LINK_CLICKED' as const,
        employeeName: 'David Miller',
        employeeEmail: 'david.finance@cybershield.corp',
        roleCategory: 'Finance',
        campaignName: 'Executive Wire & BEC Defense Simulation',
        payload: {
          simulatedUrl: 'https://cybershield-exec.com/treasury/wire-approve',
          remediationTriggered: true,
          riskDelta: '+26'
        },
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ] as InteractionEvent[],
    securityLogs: [
      {
        id: 'sec_1',
        email: 'admin@cybershield.corp',
        eventType: 'MFA_CHALLENGE_VERIFIED',
        authMethod: 'TOTP 6-Digit (RFC 6238)',
        ipAddress: '192.168.1.104',
        status: 'SUCCESS',
        details: { tokenAssigned: 'Bearer JWT Hardened', role: 'admin' },
        createdAt: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: 'sec_2',
        email: 'alex.dev@cybershield.corp',
        eventType: 'WEBAUTHN_PASSKEY_VERIFIED',
        authMethod: 'FIDO2 / WebAuthn Biometric Passkey',
        ipAddress: '10.0.4.88',
        status: 'SUCCESS',
        details: { passkeyHardwareVerified: true },
        createdAt: new Date(Date.now() - 1200000).toISOString()
      }
    ] as SecurityAuditLog[]
  };
}

class UnifiedBackendStore {
  private state: ReturnType<typeof getInitialState>;

  constructor() {
    this.state = this.loadState();
  }

  private loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not parse saved state, using default baseline', e);
    }
    return getInitialState();
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  // --- AUTHENTICATION ---
  getDemoUsers(): { accounts: DemoAccount[] } {
    return { accounts: this.state.accounts };
  }

  login(email: string, password?: string, mfaCode?: string, directAuth?: boolean): LoginResponse {
    const acc = this.state.accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!acc) {
      throw new Error('User not found. Use one of the pre-configured demo personas.');
    }

    if (password && password !== acc.password && password !== 'admin123' && password !== 'demo123') {
      throw new Error('Invalid security credentials. Check password.');
    }

    // Direct Auth (1-Click switch) bypasses MFA prompt
    if (directAuth) {
      const token = 'unified_token_' + Date.now();
      const user: User = {
        id: acc.userId,
        email: acc.email,
        role: acc.role,
        mfaVerified: true,
        authStrength: acc.authStrength || 'Zero-Trust Hardened (MFA)',
        authMethod: acc.mfaMethod || 'TOTP 2FA Authenticator',
        employee: acc.role === 'employee' ? {
          id: acc.employeeId || 'emp_user',
          name: acc.name,
          email: acc.email,
          roleTitle: acc.roleTitle,
          roleCategory: acc.roleCategory as any,
          department: acc.department,
          departmentId: 'dept_general',
          riskScore: acc.riskScore,
          remediationStatus: acc.remediationStatus,
          resiliencePoints: acc.resiliencePoints,
          streakCount: 3,
          avatarUrl: acc.avatarUrl
        } : null
      };

      this.state.securityLogs.unshift({
        id: 'sec_' + Date.now(),
        email: acc.email,
        eventType: 'DIRECT_AUTHENTICATION_LAUNCH',
        authMethod: '1-Click Direct Launch',
        ipAddress: '127.0.0.1 (Local Verified)',
        status: 'SUCCESS',
        details: { directAuth: true, role: acc.role },
        createdAt: new Date().toISOString()
      });
      this.saveState();

      localStorage.setItem('cybershield_token', token);
      localStorage.setItem('cybershield_user', JSON.stringify(user));

      return { token, user, mfaVerified: true };
    }

    // Otherwise return MFA Challenge
    return {
      requiresMfa: true,
      mfaSessionToken: 'mfa_sess_' + acc.userId + '_' + Date.now(),
      demoCode: acc.demoTotp || '749281',
      authMethod: acc.mfaMethod || 'TOTP 6-Digit + FIDO2 Passkey',
      userSummary: {
        id: acc.userId,
        email: acc.email,
        name: acc.name,
        role: acc.role,
        roleTitle: acc.roleTitle,
        department: acc.department,
        avatarUrl: acc.avatarUrl
      },
      message: `Security authentication challenge initiated. Enter 6-digit TOTP code (${acc.demoTotp || '749281'}) or authenticate with biometric passkey.`
    };
  }

  verifyMfa(mfaSessionToken: string, code: string) {
    if (code !== '749281' && code.length !== 6) {
      throw new Error('Invalid MFA token. Enter valid 6-digit code (Demo code: 749281).');
    }

    const acc = this.state.accounts[0];
    const token = 'unified_token_' + Date.now();
    const user: User = {
      id: acc.userId,
      email: acc.email,
      role: acc.role,
      mfaVerified: true,
      authStrength: 'Zero-Trust Hardened (MFA)',
      authMethod: 'TOTP 6-Digit Authenticator',
      employee: null
    };

    this.state.securityLogs.unshift({
      id: 'sec_' + Date.now(),
      email: acc.email,
      eventType: 'MFA_CHALLENGE_VERIFIED',
      authMethod: 'TOTP 6-Digit (RFC 6238)',
      ipAddress: '127.0.0.1 (Verified)',
      status: 'SUCCESS',
      details: { verifiedCode: code },
      createdAt: new Date().toISOString()
    });
    this.saveState();

    localStorage.setItem('cybershield_token', token);
    localStorage.setItem('cybershield_user', JSON.stringify(user));

    return {
      token,
      user,
      mfaVerified: true,
      authMethod: 'TOTP 2FA Authenticator'
    };
  }

  verifyPasskey(mfaSessionToken: string, passkeyCredential?: string) {
    const acc = this.state.accounts[0];
    const token = 'passkey_token_' + Date.now();
    const user: User = {
      id: acc.userId,
      email: acc.email,
      role: acc.role,
      mfaVerified: true,
      authStrength: 'BIOMETRIC_PASSKEY',
      authMethod: 'FIDO2 / WebAuthn Passkey',
      employee: null
    };

    this.state.securityLogs.unshift({
      id: 'sec_' + Date.now(),
      email: acc.email,
      eventType: 'WEBAUTHN_PASSKEY_VERIFIED',
      authMethod: 'FIDO2 Biometric Hardware Key',
      ipAddress: '127.0.0.1 (Hardware Attested)',
      status: 'SUCCESS',
      details: { credentialId: passkeyCredential || 'cred_webauthn_hw_01' },
      createdAt: new Date().toISOString()
    });
    this.saveState();

    localStorage.setItem('cybershield_token', token);
    localStorage.setItem('cybershield_user', JSON.stringify(user));

    return {
      token,
      user,
      mfaVerified: true,
      authMethod: 'FIDO2 / WebAuthn Hardware Passkey'
    };
  }

  switchUser(email: string) {
    const acc = this.state.accounts.find(a => a.email.toLowerCase() === email.toLowerCase()) || this.state.accounts[0];
    const user: User = {
      id: acc.userId,
      email: acc.email,
      role: acc.role,
      mfaVerified: true,
      employee: acc.role === 'employee' ? {
        id: acc.employeeId || 'emp_user',
        name: acc.name,
        email: acc.email,
        roleTitle: acc.roleTitle,
        roleCategory: acc.roleCategory as any,
        department: acc.department,
        departmentId: 'dept_general',
        riskScore: acc.riskScore,
        remediationStatus: acc.remediationStatus,
        resiliencePoints: acc.resiliencePoints,
        streakCount: 3,
        avatarUrl: acc.avatarUrl
      } : null
    };
    const token = 'token_' + Date.now();
    localStorage.setItem('cybershield_token', token);
    localStorage.setItem('cybershield_user', JSON.stringify(user));
    return { token, user };
  }

  getCurrentUser(): { user: User } {
    try {
      const userJson = localStorage.getItem('cybershield_user');
      if (userJson) {
        return { user: JSON.parse(userJson) };
      }
    } catch {}

    const defaultAcc = this.state.accounts[0];
    const user: User = {
      id: defaultAcc.userId,
      email: defaultAcc.email,
      role: defaultAcc.role,
      mfaVerified: true,
      authStrength: 'Zero-Trust Hardened (MFA)',
      authMethod: 'TOTP 2FA Authenticator',
      employee: null
    };
    return { user };
  }

  // --- DASHBOARD & METRICS ---
  getDashboardStats(): OrgMetrics {
    const employees = this.state.accounts.filter(a => a.role === 'employee');
    const totalEmployees = employees.length;
    const avgRisk = Math.round(employees.reduce((sum, e) => sum + e.riskScore, 0) / (totalEmployees || 1));
    const remediationRequired = employees.filter(e => e.remediationStatus === 'remediation_required').length;
    const trainingCompleted = employees.filter(e => e.remediationStatus === 'training_completed').length;
    const goodStanding = totalEmployees - remediationRequired;

    const totalTested = 4 * totalEmployees;
    const clickedTotal = 6;
    const reportedTotal = 18;
    const openedTotal = 24;

    const clickRate = Math.round((clickedTotal / totalTested) * 100);
    const reportRate = Math.round((reportedTotal / totalTested) * 100);

    return {
      hvi: avgRisk,
      orgSecurityScore: 100 - avgRisk,
      riskBand: avgRisk > 60 ? 'Critical' : avgRisk > 40 ? 'Elevated' : avgRisk > 20 ? 'Moderate' : 'Low',
      riskBandColor: avgRisk > 60 ? '#f43f5e' : avgRisk > 40 ? '#f97316' : avgRisk > 20 ? '#eab308' : '#10b981',
      activeCampaigns: this.state.campaigns.filter(c => c.status === 'active').length,
      totalCampaigns: this.state.campaigns.length,
      totalEmployees,
      totalTested,
      clickedTotal,
      reportedTotal,
      openedTotal,
      clickRate,
      reportRate,
      remediationRequired,
      trainingCompleted,
      goodStanding,
      departments: [
        { id: 'dept_eng', name: 'Engineering & Cloud Security', employee_count: 24, avg_risk: 18, total_simulations: 24, total_clicks: 2, total_reports: 19, click_rate: 8 },
        { id: 'dept_fin', name: 'Global Finance & Treasury', employee_count: 16, avg_risk: 68, total_simulations: 16, total_clicks: 5, total_reports: 9, click_rate: 31 },
        { id: 'dept_pay', name: 'Payroll & Compensation', employee_count: 8, avg_risk: 22, total_simulations: 8, total_clicks: 1, total_reports: 6, click_rate: 12 },
        { id: 'dept_hr', name: 'People Operations & HR', employee_count: 12, avg_risk: 34, total_simulations: 12, total_clicks: 2, total_reports: 8, click_rate: 16 },
        { id: 'dept_exec', name: 'Executive Leadership', employee_count: 6, avg_risk: 42, total_simulations: 6, total_clicks: 1, total_reports: 4, click_rate: 16 }
      ],
      roleRisk: [
        { role: 'Developer', count: 24, avg_risk: 22, clicks: 2, reports: 19 },
        { role: 'Finance', count: 16, avg_risk: 68, clicks: 5, reports: 9 },
        { role: 'Payroll', count: 8, avg_risk: 22, clicks: 1, reports: 6 },
        { role: 'HR', count: 12, avg_risk: 34, clicks: 2, reports: 8 },
        { role: 'Executive', count: 6, avg_risk: 42, clicks: 1, reports: 4 }
      ],
      recentEvents: this.state.events.slice(0, 10),
      topScenarios: [
        { scenario: 'Business Email Compromise (BEC)', role: 'Finance', delivered: 16, clicked: 5, reported: 9, clickRate: 31 },
        { scenario: 'Developer Credential Leak Notice', role: 'Engineering', delivered: 24, clicked: 2, reported: 19, clickRate: 8 },
        { scenario: 'Direct Deposit Divert', role: 'Payroll', delivered: 8, clicked: 1, reported: 6, clickRate: 12 },
        { scenario: 'Urgent Wire Transfer', role: 'Executive', delivered: 6, clicked: 1, reported: 4, clickRate: 16 }
      ],
      recentRiskAdjustments: [
        { id: 'adj_1', previous_score: 42, new_score: 68, change_delta: 26, reason: 'Clicked simulated phishing vector', created_at: new Date(Date.now() - 3600000).toISOString(), employee_name: 'David Miller', role_category: 'Finance' },
        { id: 'adj_2', previous_score: 34, new_score: 22, change_delta: -12, reason: 'Reported threat with Hoxhunt button', created_at: new Date(Date.now() - 7200000).toISOString(), employee_name: 'Alex Chen', role_category: 'Developer' }
      ]
    };
  }

  // --- EMPLOYEES DIRECTORY ---
  getEmployees(params: any = {}): { employees: any[] } {
    let list = this.state.accounts
      .filter(a => a.role === 'employee')
      .map(a => ({
        id: a.employeeId || a.userId,
        name: a.name,
        email: a.email,
        role_title: a.roleTitle,
        role_category: a.roleCategory,
        department_name: a.department,
        risk_score: a.riskScore,
        resilience_points: a.resiliencePoints || 100,
        simulations_tested: 4,
        simulations_clicked: a.remediationStatus === 'remediation_required' ? 2 : 0,
        simulations_reported: a.remediationStatus === 'good_standing' ? 3 : 1,
        remediation_status: a.remediationStatus,
        avatar_url: a.avatarUrl
      }));

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
    }
    if (params.roleCategory && params.roleCategory !== 'all') {
      list = list.filter(e => e.role_category === params.roleCategory);
    }
    if (params.remediationStatus && params.remediationStatus !== 'all') {
      list = list.filter(e => e.remediation_status === params.remediationStatus);
    }

    return { employees: list };
  }

  getEmployeeDetails(id: string): any {
    const emp = this.state.accounts.find(a => a.employeeId === id || a.userId === id) || this.state.accounts[1];
    return {
      employee: {
        id: emp.employeeId || emp.userId,
        name: emp.name,
        email: emp.email,
        role_title: emp.roleTitle,
        role_category: emp.roleCategory,
        department_name: emp.department,
        risk_score: emp.riskScore,
        resilience_points: emp.resiliencePoints || 100,
        simulations_tested: 4,
        simulations_clicked: emp.remediationStatus === 'remediation_required' ? 2 : 0,
        simulations_reported: emp.remediationStatus === 'good_standing' ? 3 : 1,
        remediation_status: emp.remediationStatus,
        avatar_url: emp.avatarUrl
      },
      explainableFactors: [
        { factor: 'Phishing Simulation Interactivity', description: 'Interactions recorded across recent active drills', impact: emp.riskScore > 50 ? '+26 pts' : '-12 pts' },
        { factor: 'Role Exposure Vector', description: `Elevated access to corporate resources as ${emp.roleCategory}`, impact: '+15 pts' },
        { factor: 'Hoxhunt Interceptions', description: 'Threat reports submitted directly to SOC queue', impact: '-12 pts' },
        { factor: 'MFA Hardened Authentication', description: 'Zero-Trust 2FA & WebAuthn passkey policy active', impact: '-10 pts' }
      ],
      riskHistory: [
        {
          id: 'rh_1',
          previous_score: Math.max(0, emp.riskScore - 20),
          new_score: emp.riskScore,
          change_delta: 20,
          reason: 'Spear-phishing drill link click recorded by SOC telemetry',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ],
      trainingAssignments: this.state.assignments.filter(a => a.employee_id === (emp.employeeId || emp.userId))
    };
  }

  assignTraining(employeeId: string, moduleId: string): { success: boolean; assignmentId: string } {
    const emp = this.state.accounts.find(a => a.employeeId === employeeId || a.userId === employeeId) || this.state.accounts[1];
    const tm = this.state.trainingModules.find(m => m.id === moduleId) || this.state.trainingModules[0];
    const newAssignment: TrainingAssignment = {
      id: 'ta_' + Date.now(),
      employee_id: emp.employeeId || emp.userId,
      module_id: tm.id,
      module_title: tm.title,
      category: tm.category,
      target_role: tm.target_role,
      estimated_minutes: tm.estimated_minutes,
      description: tm.description,
      indicators: tm.indicators,
      content_markdown: tm.content_markdown,
      quiz: tm.quiz,
      status: 'assigned',
      score: 0,
      assigned_at: new Date().toISOString()
    };
    this.state.assignments.unshift(newAssignment);
    this.saveState();
    return { success: true, assignmentId: newAssignment.id };
  }

  // --- MAILBOX & SIMULATION INTERACTIONS ---
  getInbox(employeeId?: string): { employee: any; emails: InboxEmail[]; totalSimulations: number; pendingSimulations: number } {
    const emp = this.state.accounts.find(a => a.employeeId === employeeId || a.userId === employeeId) || this.state.accounts[1];
    const empId = emp.employeeId || 'emp_alex';
    const emails = this.state.inboxes[empId] || this.state.inboxes['emp_alex'] || [];
    return {
      employee: emp,
      emails,
      totalSimulations: emails.filter(e => e.isSimulation).length,
      pendingSimulations: emails.filter(e => e.isSimulation && e.status !== 'reported' && e.status !== 'clicked').length
    };
  }

  openSimulation(campaignId: string, employeeId: string): { success: boolean } {
    const emp = this.state.accounts.find(a => a.employeeId === employeeId || a.userId === employeeId) || this.state.accounts[1];
    const empId = emp.employeeId || 'emp_alex';
    const emails = this.state.inboxes[empId] || [];
    const target = emails.find(e => e.campaignId === campaignId);
    if (target && target.status === 'delivered') {
      target.status = 'opened';
      target.isUnread = false;
    }
    this.saveState();
    return { success: true };
  }

  clickPhishingLink(campaignId: string, employeeId: string): any {
    const emp = this.state.accounts.find(a => a.employeeId === employeeId || a.userId === employeeId) || this.state.accounts[1];
    const prevScore = emp.riskScore;
    const newScore = Math.min(100, prevScore + 26);
    emp.riskScore = newScore;
    emp.remediationStatus = 'remediation_required';

    const empId = emp.employeeId || 'emp_alex';
    const emails = this.state.inboxes[empId] || [];
    const mail = emails.find(e => e.campaignId === campaignId);
    if (mail) mail.status = 'clicked';

    // Auto-assign 3-minute targeted micro-training
    const tm = this.state.trainingModules[0];
    const newAssignment: TrainingAssignment = {
      id: 'ta_' + Date.now(),
      employee_id: empId,
      module_id: tm.id,
      module_title: tm.title,
      category: tm.category,
      target_role: tm.target_role,
      estimated_minutes: tm.estimated_minutes,
      description: tm.description,
      indicators: tm.indicators,
      content_markdown: tm.content_markdown,
      quiz: tm.quiz,
      status: 'assigned',
      score: 0,
      assigned_at: new Date().toISOString()
    };
    this.state.assignments.unshift(newAssignment);

    // SOC Telemetry Event
    this.state.events.unshift({
      id: 'evt_' + Date.now(),
      eventType: 'LINK_CLICKED',
      employeeName: emp.name,
      employeeEmail: emp.email,
      roleCategory: emp.roleCategory,
      campaignName: 'Spear-Phishing Drill',
      payload: { simulatedDomain: 'github-enterprise-sec.net', riskDelta: '+26' },
      createdAt: new Date().toISOString()
    });

    this.saveState();

    return {
      success: true,
      previousScore: prevScore,
      newScore: newScore,
      riskDelta: 26,
      trainingModule: {
        id: tm.id,
        assignmentId: newAssignment.id,
        title: tm.title
      },
      campaign: {
        red_flags: [
          'Spoofed lookalike domain "github-enterprise-sec.net"',
          'Urgent credential revocation demand',
          'External unverified authorization link'
        ]
      },
      reason: `Risk score elevated from ${prevScore} to ${newScore} (+26 pts) due to simulated phishing link click.`
    };
  }

  reportPhishing(campaignId: string, employeeId: string): any {
    const emp = this.state.accounts.find(a => a.employeeId === employeeId || a.userId === employeeId) || this.state.accounts[1];
    const prevScore = emp.riskScore;
    const newScore = Math.max(0, prevScore - 12);
    emp.riskScore = newScore;
    emp.resiliencePoints = (emp.resiliencePoints || 0) + 50;

    const empId = emp.employeeId || 'emp_alex';
    const emails = this.state.inboxes[empId] || [];
    const mail = emails.find(e => e.campaignId === campaignId);
    if (mail) mail.status = 'reported';

    // SOC Telemetry Event
    this.state.events.unshift({
      id: 'evt_' + Date.now(),
      eventType: 'SIMULATION_REPORTED',
      employeeName: emp.name,
      employeeEmail: emp.email,
      roleCategory: emp.roleCategory,
      campaignName: 'Spear-Phishing Drill',
      payload: { reporter: 'Hoxhunt Button', pointsAwarded: 50 },
      createdAt: new Date().toISOString()
    });

    this.saveState();

    return {
      success: true,
      previousScore: prevScore,
      newScore: newScore,
      pointsAwarded: 50,
      newStreak: 4,
      reason: `Threat successfully intercepted with Hoxhunt. Awarded +50 Resilience XP.`
    };
  }

  // --- TRAINING MODULES & ASSIGNMENTS ---
  getTrainingModules(): { modules: TrainingModule[] } {
    return { modules: this.state.trainingModules };
  }

  getMyAssignments(employeeId: string): { assignments: TrainingAssignment[] } {
    const list = this.state.assignments.filter(a => a.employee_id === employeeId);
    return { assignments: list.length > 0 ? list : this.state.assignments };
  }

  completeTraining(assignmentId: string, score: number): any {
    const assign = this.state.assignments.find(a => a.id === assignmentId);
    if (assign) {
      assign.status = 'completed';
      assign.score = score;
      assign.completed_at = new Date().toISOString();
    }
    const emp = this.state.accounts.find(a => a.employeeId === assign?.employee_id) || this.state.accounts[1];
    const prevScore = emp.riskScore;
    const newScore = Math.max(0, prevScore - 20);
    emp.riskScore = newScore;
    emp.remediationStatus = 'training_completed';

    this.state.events.unshift({
      id: 'evt_' + Date.now(),
      eventType: 'TRAINING_COMPLETED',
      employeeName: emp.name,
      employeeEmail: emp.email,
      roleCategory: emp.roleCategory,
      campaignName: assign?.module_title || 'Micro-Training',
      payload: { score, riskDelta: -20, status: 'Remediation Cleared' },
      createdAt: new Date().toISOString()
    });

    this.saveState();

    return {
      success: true,
      previousScore: prevScore,
      newScore: newScore,
      riskDelta: -20,
      score,
      reason: `Completed 3-minute targeted micro-training with ${score}%. Remediation cleared.`
    };
  }

  // --- CAMPAIGNS & TEMPLATES ---
  getCampaigns(): { campaigns: Campaign[] } {
    return { campaigns: this.state.campaigns };
  }

  getCampaign(id: string): { campaign: any } {
    const campaign = this.state.campaigns.find(c => c.id === id) || this.state.campaigns[0];
    return { campaign };
  }

  launchCampaign(id: string): { success: boolean } {
    const cmp = this.state.campaigns.find(c => c.id === id);
    if (cmp) cmp.status = 'active';
    this.saveState();
    return { success: true };
  }

  pauseCampaign(id: string): { success: boolean } {
    const cmp = this.state.campaigns.find(c => c.id === id);
    if (cmp) cmp.status = 'paused';
    this.saveState();
    return { success: true };
  }

  endCampaign(id: string): { success: boolean } {
    const cmp = this.state.campaigns.find(c => c.id === id);
    if (cmp) cmp.status = 'completed';
    this.saveState();
    return { success: true };
  }

  createCampaign(data: any): { success: boolean; campaign: Campaign; targetsDelivered: number } {
    const newCmp: Campaign = {
      id: 'cmp_' + Date.now(),
      name: data.name,
      description: data.description || 'Targeted drill',
      target_role: data.targetRole,
      template_id: data.templateId,
      template_title: 'Adaptive Drill',
      status: 'active',
      total_targets: 4,
      clicked_count: 0,
      reported_count: 0,
      opened_count: 0,
      clickRate: 0,
      reportRate: 0,
      created_at: new Date().toISOString()
    };
    this.state.campaigns.unshift(newCmp);
    this.saveState();
    return { success: true, campaign: newCmp, targetsDelivered: 4 };
  }

  getTemplates(): { templates: PhishingTemplate[] } {
    return { templates: this.state.templates };
  }

  synthesizeTemplate(data: any): { template: PhishingTemplate } {
    const newTpl: PhishingTemplate = {
      id: 'tpl_synth_' + Date.now(),
      title: `${data.targetRole || 'Enterprise'} Custom Attack Vector: ${data.topic || 'Urgent Workflow'}`,
      target_role: data.targetRole || 'All',
      scenario: 'AI Synthesized Simulation',
      difficulty: (data.difficulty as any) || 'Medium',
      sender_name: `${data.brand || 'Corporate'} Security Notice`,
      sender_email: 'alerts@verify-workplace-sso.com',
      subject: `[ACTION REQUIRED] ${data.topic || 'Mandatory Account Audit'}`,
      body_html: `<p>Please verify your corporate credentials immediately.</p>`,
      simulated_link_text: 'Authenticate Credentials',
      simulated_link_url: 'https://verify-workplace-sso.com/login',
      redFlags: ['Domain mismatch: verify-workplace-sso.com', 'Urgency trigger'],
      is_custom: 1
    };
    this.state.templates.unshift(newTpl);
    this.saveState();
    return { template: newTpl };
  }

  // --- SOC TELEMETRY & SECURITY LOGS ---
  getEvents(limit = 50): { events: InteractionEvent[] } {
    return { events: this.state.events.slice(0, limit) };
  }

  getSecurityLogs(): { logs: SecurityAuditLog[] } {
    return { logs: this.state.securityLogs };
  }

  getSecurityPosture(): { posture: SecurityPosture } {
    return {
      posture: {
        mfaPolicy: 'MANDATORY_ENFORCED',
        authStandards: ['TOTP (RFC 6238)', 'FIDO2 / WebAuthn Passkeys', 'Zero-Trust Telemetry'],
        encryptionCipher: 'TLS 1.3 / AES-256-GCM / HMAC-SHA256',
        totalSecurityEvents: this.state.securityLogs.length + this.state.events.length,
        verifiedMfaSessions: 8,
        complianceStatus: 'SOC2 Type II & ISO 27001 Ready',
        activeSessionProtection: 'Hardware Token Ready'
      }
    };
  }

  getReportsSummary(): any {
    const metrics = this.getDashboardStats();
    const campaignReports = this.state.campaigns.map(c => ({
      ...c,
      resilienceRatio: c.reportRate > 0 ? (c.reportRate / Math.max(1, c.clickRate)).toFixed(1) : '0.0'
    }));

    const trainingStats = this.state.trainingModules.map(tm => ({
      title: tm.title,
      target_role: tm.target_role,
      assigned_count: 4,
      completed_count: 3,
      avg_score: 92,
      completionRate: 75,
      avgScore: 92
    }));

    return {
      generatedAt: new Date().toISOString(),
      organization: 'CyberShield Global Corp (TerraMind)',
      complianceFrameworks: ['NIST SP 800-50', 'ISO/IEC 27001:2022', 'SOC 2 Type II', 'NIS2 Human Factor'],
      metrics,
      campaignReports,
      trainingStats
    };
  }

  resetDatabase(): { success: boolean; message: string } {
    this.state = getInitialState();
    this.saveState();
    return { success: true, message: 'Unified database reset to baseline state.' };
  }
}

export const unifiedBackend = new UnifiedBackendStore();
