const { db } = require('./db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  console.log('Seeding CyberShield database with realistic enterprise SOC & simulation data...');

  // Clear existing data safely
  db.exec(`
    DELETE FROM risk_history;
    DELETE FROM interaction_events;
    DELETE FROM training_assignments;
    DELETE FROM campaign_targets;
    DELETE FROM campaigns;
    DELETE FROM phishing_templates;
    DELETE FROM training_modules;
    DELETE FROM employees;
    DELETE FROM users;
    DELETE FROM departments;
  `);

  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  const demoHash = bcrypt.hashSync('demo123', salt);

  // 1. Departments
  const departments = [
    { id: 'dept_eng', name: 'Engineering & Cloud Security', description: 'Core product developers, DevOps, and platform engineers', head_count: 24 },
    { id: 'dept_hr', name: 'People, Culture & HR', description: 'Talent acquisition, employee relations, and benefits', head_count: 12 },
    { id: 'dept_finance', name: 'Global Finance & Treasury', description: 'Accounts payable, financial planning, billing, and accounting', head_count: 16 },
    { id: 'dept_payroll', name: 'Compensation & Payroll Operations', description: 'Salary administration, bonuses, and tax compliance', head_count: 8 },
    { id: 'dept_exec', name: 'Executive Leadership & Strategy', description: 'C-suite executives, legal counsel, and board liaisons', head_count: 6 }
  ];

  const insertDept = db.prepare(`INSERT INTO departments (id, name, description, head_count) VALUES (?, ?, ?, ?)`);
  for (const d of departments) {
    insertDept.run(d.id, d.name, d.description, d.head_count);
  }

  // 2. Training Modules
  const trainingModules = [
    {
      id: 'tm_payroll',
      title: 'Detecting Payroll, Direct Deposit & W-2 Phishing Attacks',
      target_role: 'Payroll',
      category: 'Payroll & Tax Fraud',
      estimated_minutes: 3,
      description: 'Learn how spear-phishers impersonate executives and payroll portals to divert direct deposits and steal tax documents.',
      indicators_json: JSON.stringify([
        'Spoofed sender domain (e.g., adp-portal-update.com instead of adp.com)',
        'Artificial urgency claiming direct deposit will be suspended if not verified within 4 hours',
        'Generic greeting or mismatched employee identification numbers',
        'External portal link requesting full bank routing credentials'
      ]),
      content_markdown: `### Core Threat Anatomy: Payroll Phishing
Payroll fraud is one of the highest-yield spear-phishing attack vectors. Attackers target payroll specialists and employees to divert direct deposit bank accounts or harvest employee W-2 tax forms.

#### Key Phishing Indicators:
1. **Domain Spoofing**: Notice subtle variations such as \`adp-portal-update.com\` or \`workday-verify.net\` instead of verified internal corporate SSO.
2. **Artificial Urgency**: Phishers often create false panic ("Direct deposit paused", "Tax compliance penalty within 4 hours").
3. **Out-of-Band Verification**: Never update bank accounts or wire details based solely on an email request. Always verify via phone or in-person channel.`,
      quiz_json: JSON.stringify([
        {
          question: 'You receive an urgent email from "ADP Notifications" claiming your payroll deposit failed. What is your first step?',
          options: [
            'Click the link immediately to prevent payroll disruption',
            'Forward the email to all colleagues to warn them',
            'Inspect the sender domain closely and report it using the CyberShield Phish Report button',
            'Reply asking the sender to verify their identity'
          ],
          correctIndex: 2,
          explanation: 'Always inspect the sender domain and report suspicious emails through the CyberShield button. Never click urgent unsolicited links.'
        },
        {
          question: 'Which of the following domains is most likely a malicious phishing lookalike for ADP?',
          options: [
            'portal.adp.com',
            'adp-payroll-verification.co',
            'login.adp.com',
            'adp.com/support'
          ],
          correctIndex: 1,
          explanation: 'adp-payroll-verification.co is a classic spear-phishing typo/lookalike domain not owned by ADP.'
        }
      ])
    },
    {
      id: 'tm_dev',
      title: 'Recognizing Fake GitHub & CI/CD Pipeline Security Alerts',
      target_role: 'Developer',
      category: 'Supply Chain & Cloud',
      estimated_minutes: 3,
      description: 'Identify modern supply chain phishing attacks impersonating GitHub token revocations, NPM malware alerts, and CI/CD secret compromises.',
      indicators_json: JSON.stringify([
        'Domain typo (e.g. github-enterprise-sec.net instead of github.com)',
        'Claiming your personal access token (PAT) was breached and requires re-authorization',
        'Embedded credential harvester designed like an OAuth prompt',
        'Unsolicited dependency security warning asking you to download a patch script'
      ]),
      content_markdown: `### Developer Threat Vector: Supply Chain & Credential Thefts
Software developers are prime high-value targets because your credentials unlock code repositories, CI/CD pipelines, and cloud production environments.

#### Real-World Attack Scenarios:
- **Fake Token Revocation**: An alert claiming an unauthorized token was created on your account, directing you to a fake login.
- **Malicious Dependency Warning**: Phishing emails spoofing GitHub Security Advisories or NPM asking you to run an \`npx\` or \`curl | sh\` command.

#### Golden Rules:
1. Navigate directly to github.com/settings/tokens rather than clicking email links.
2. Verify GitHub PGP signatures on automated emails.
3. Keep hardware 2FA (FIDO2 / YubiKey) enabled.`,
      quiz_json: JSON.stringify([
        {
          question: 'An email claims your GitHub PAT has leaked and links to "github-enterprise-sec.net/revoke". What should you do?',
          options: [
            'Click the link and quickly revoke the token',
            'Enter your 2FA code to confirm your identity',
            'Report the email with CyberShield and check your tokens directly on github.com',
            'Download the attachment to view the breach log'
          ],
          correctIndex: 2,
          explanation: 'The domain "github-enterprise-sec.net" is an external adversary portal. Always navigate directly to github.com.'
        },
        {
          question: 'What is the most secure way for developers to protect cloud credentials from phishing?',
          options: [
            'Writing passwords in private notes',
            'Using FIDO2 / WebAuthn hardware security keys that are cryptographically phishing-resistant',
            'Changing passwords every 24 hours',
            'Allowing browser auto-fill on unknown domains'
          ],
          correctIndex: 1,
          explanation: 'FIDO2 / WebAuthn ties the cryptographic response directly to the verified browser origin, preventing credential harvesting.'
        }
      ])
    },
    {
      id: 'tm_finance',
      title: 'Defending Against Invoice Fraud & Business Email Compromise (BEC)',
      target_role: 'Finance',
      category: 'Financial Wire Fraud',
      estimated_minutes: 3,
      description: 'Protect company funds against high-risk wire transfer requests, vendor account changes, and spoofed executive invoices.',
      indicators_json: JSON.stringify([
        'Last minute changes to vendor bank routing or international IBAN',
        'High urgency insisting on bypassing standard dual-approval workflow',
        'Executive impersonation requesting confidentiality ("keep this quiet until deal closes")',
        'Invoices lacking standard purchase order (PO) numbers'
      ]),
      content_markdown: `### Business Email Compromise (BEC)
BEC attacks account for billions of dollars in enterprise losses annually. Fraudsters closely monitor company news and spoof CFOs or key vendors to request expedited wires.

#### Standard Operating Procedures:
1. **Dual Authorization**: Never release wires above threshold without two authorized signers.
2. **Call-Back Verification**: Verify bank account changes via verified voice contact using the vendor contact information on file, not the phone number in the email.`,
      quiz_json: JSON.stringify([
        {
          question: 'A known vendor sends an urgent invoice stating their bank changed to a new European IBAN. What is mandatory?',
          options: [
            'Process immediately to avoid late fees',
            'Perform out-of-band phone verification using their existing phone number on file',
            'Reply asking them to email a scan of a void check',
            'Forward directly to the bank'
          ],
          correctIndex: 1,
          explanation: 'Out-of-band verification via known trusted contact channels is the only safe defense against vendor bank modification fraud.'
        }
      ])
    },
    {
      id: 'tm_hr',
      title: 'Spotting Spoofed HR Portals & Fake Benefits Open Enrollment',
      target_role: 'HR',
      category: 'Identity & Benefits Fraud',
      estimated_minutes: 3,
      description: 'Detect phishing campaigns timed around annual health insurance renewals, employee bonuses, and performance reviews.',
      indicators_json: JSON.stringify([
        'Generic link disguised as single sign-on (SSO)',
        'Threatens cancellation of health coverage if not completed by end of day',
        'Sender email originating from an external lookalike provider',
        'Requests sensitive personal data (SSN, home address) over unencrypted forms'
      ]),
      content_markdown: `### HR & Employee Benefits Phishing
Attackers capitalize on high-stress deadlines like annual health enrollment or bonus statements to trigger impulsive clicks.

#### Defense Strategies:
1. Bookmark your company Workday/BambooHR portal and access it directly.
2. Look out for external email banners warning of non-corporate origin.`,
      quiz_json: JSON.stringify([
        {
          question: 'An email arrives at 4:55 PM stating "Open Enrollment closes at 5:00 PM. Click here to maintain medical coverage." What should you do?',
          options: [
            'Click and enter login credentials immediately',
            'Recognize the psychological pressure tactic and report the email to the CyberShield SOC team',
            'Send personal insurance documents to the sender',
            'Delete without notifying IT'
          ],
          correctIndex: 1,
          explanation: 'Manufactured deadline pressure is a hallmark of spear-phishing. Report it through the platform.'
        }
      ])
    },
    {
      id: 'tm_exec',
      title: 'Executive Impersonation & High-Privilege Phishing Defense',
      target_role: 'Executive',
      category: 'Whaling & Strategic Risk',
      estimated_minutes: 3,
      description: 'Specialized defensive posture for executive staff facing targeted whaling attacks, board packet interception, and legal subpoenas.',
      indicators_json: JSON.stringify([
        'Spoofed Board of Directors communications',
        'Fake DocuSign / Adobe Sign legal merger documents',
        'SMS / WhatsApp outreach claiming to be the CEO in an urgent meeting',
        'Vishing (voice AI deepfake) follow-up'
      ]),
      content_markdown: `### Whaling & Executive Threat Landscape
Executives have access to sensitive financial forecasts, M&A strategy, and corporate secrets. Whaling attacks are tailored with detailed reconnaissance from LinkedIn and press releases.`,
      quiz_json: JSON.stringify([
        {
          question: 'You receive an urgent message purporting to be from legal counsel requesting immediate signature on an NDA via an unfamiliar link. What should you do?',
          options: [
            'Sign immediately from mobile',
            'Verify through corporate Slack or direct phone call before opening external documents',
            'Forward to external personal email',
            'Disable antivirus to allow the file to load'
          ],
          correctIndex: 1,
          explanation: 'Executives should always verify out-of-band through known corporate channels.'
        }
      ])
    }
  ];

  const insertModule = db.prepare(`
    INSERT INTO training_modules (id, title, target_role, category, estimated_minutes, description, indicators_json, content_markdown, quiz_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const tm of trainingModules) {
    insertModule.run(tm.id, tm.title, tm.target_role, tm.category, tm.estimated_minutes, tm.description, tm.indicators_json, tm.content_markdown, tm.quiz_json);
  }

  // 3. Phishing Templates
  const phishingTemplates = [
    {
      id: 'tpl_payroll_salary',
      title: 'ADP Bi-Weekly Payroll Statement & Direct Deposit Verification',
      target_role: 'Payroll',
      scenario: 'Payroll Statement / Direct Deposit Suspension',
      difficulty: 'Medium',
      sender_name: 'ADP Secure Payroll Services',
      sender_email: 'notifications@adp-portal-update.com',
      subject: 'ACTION REQUIRED: Confirm Direct Deposit Account for Cycle 2026-10B',
      body_html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1f2937;">
          <div style="background: #002d62; padding: 18px 24px; color: #fff; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">ADP TotalSource® Payroll Notification</h2>
          </div>
          <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; background: #ffffff; border-radius: 0 0 8px 8px;">
            <p style="font-size: 15px; line-height: 1.5;">Dear Valued Employee,</p>
            <p style="font-size: 15px; line-height: 1.5;">During our scheduled payroll audit for the current pay cycle, an automated flag was triggered regarding your registered ACH direct deposit routing number.</p>
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 18px 0;">
              <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 14px;">Warning: Direct deposit will be withheld and converted to paper mail check unless re-verified within 4 hours.</p>
            </div>
            <p style="font-size: 14px; color: #4b5563;">Please review your statement breakdown and confirm your account information below:</p>
            <div style="margin: 25px 0; text-align: center;">
              <a href="#simulate-click" class="sim-phish-btn" style="background: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Verify Direct Deposit Details & View Statement</a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 14px; margin-top: 24px;">This is an automated notification from ADP TotalSource Security & Compliance. Do not reply to this email.</p>
          </div>
        </div>
      `,
      simulated_link_text: 'Verify Direct Deposit Details & View Statement',
      simulated_link_url: 'https://adp-portal-update.com/auth/verify-deposit?token=98x21a',
      red_flags_json: JSON.stringify([
        'Lookalike domain: adp-portal-update.com is not official adp.com',
        'High urgency deadline: "within 4 hours or salary will be withheld"',
        'Requests banking authorization via an unverified external link'
      ]),
      recommended_training_id: 'tm_payroll'
    },
    {
      id: 'tpl_dev_github',
      title: 'GitHub Security Advisory: Critical Token Compromise',
      target_role: 'Developer',
      scenario: 'CI/CD & Personal Access Token Leak',
      difficulty: 'Hard',
      sender_name: 'GitHub Security Operations',
      sender_email: 'alerts@github-enterprise-sec.net',
      subject: '[SECURITY ALERT] Revocation required: leaked credential detected in public commit',
      body_html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #24292f;">
          <div style="background: #24292f; padding: 18px 24px; color: #fff; border-radius: 8px 8px 0 0; display: flex; align-items: center;">
            <span style="font-size: 18px; font-weight: 600;">GitHub Security Advisory</span>
          </div>
          <div style="padding: 24px; border: 1px solid #d0d7de; border-top: none; background: #ffffff; border-radius: 0 0 8px 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <span style="background: #ffebe9; color: #cf222e; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid rgba(207,34,46,0.2);">CRITICAL SEVERITY</span>
            </div>
            <p style="font-size: 14px; line-height: 1.6;">Our automated secret scanning detected a GitHub Personal Access Token (PAT) with <code>repo:write</code> and <code>workflow</code> scopes published in an external public branch.</p>
            <div style="background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 14px; font-family: monospace; font-size: 13px; margin: 16px 0;">
              <div><strong>Token Prefix:</strong> ghp_99a8********************</div>
              <div><strong>Detected Scope:</strong> admin:repo_hook, write:packages</div>
              <div><strong>Time Detected:</strong> 12 minutes ago</div>
            </div>
            <p style="font-size: 14px;">To mitigate supply chain injection into your organization's deployment pipeline, re-authorize your session and invalidate active developer credentials:</p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="#simulate-click" class="sim-phish-btn" style="background: #1f883d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Revoke Compromised PAT & Re-authenticate</a>
            </div>
            <p style="font-size: 12px; color: #57606a; border-top: 1px solid #d0d7de; padding-top: 14px; margin-top: 20px;">GitHub Enterprise Security Bot • Ref: SEC-2026-X991</p>
          </div>
        </div>
      `,
      simulated_link_text: 'Revoke Compromised PAT & Re-authenticate',
      simulated_link_url: 'https://github-enterprise-sec.net/session/security-audit?ref=sec-991',
      red_flags_json: JSON.stringify([
        'External lookalike domain: github-enterprise-sec.net instead of github.com',
        'Direct link to re-authentication rather than directing user to standard GitHub settings',
        'Exploits developer instinct to fix an urgent security alert immediately'
      ]),
      recommended_training_id: 'tm_dev'
    },
    {
      id: 'tpl_finance_invoice',
      title: 'Apex Cloud Services: Overdue Invoice & Wire Transfer Notice',
      target_role: 'Finance',
      scenario: 'Vendor Billing & Bank Modification Request',
      difficulty: 'Medium',
      sender_name: 'Apex Infrastructure Billing Dept',
      sender_email: 'ar@apex-cloud-billing.com',
      subject: 'FINAL NOTICE: Invoice #INV-2026-4891 Past Due - Immediate Suspension',
      body_html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b;">
          <div style="background: #0f172a; padding: 18px 24px; color: #38bdf8; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 19px; font-weight: 700;">APEX INFRASTRUCTURE CORP</h2>
          </div>
          <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; line-height: 1.6;">Dear Finance & Accounts Payable Team,</p>
            <p style="font-size: 14px; line-height: 1.6;">Our records show that Invoice <strong>#INV-2026-4891</strong> ($18,450.00 USD) for Enterprise Cloud Compute Services is now 14 days overdue.</p>
            <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 14px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0 0 6px 0; font-weight: 600; font-size: 14px; color: #92400e;">Notice of Service Suspension:</p>
              <p style="margin: 0; font-size: 13px; color: #b45309;">Production database replicas and API clusters will be paused at 17:00 EST today unless wire confirmation is received.</p>
            </div>
            <p style="font-size: 14px;">Note: We have updated our remittance receiving account for Q4. Please download the revised wire authorization letter below:</p>
            <div style="margin: 22px 0; text-align: center;">
              <a href="#simulate-click" class="sim-phish-btn" style="background: #0284c7; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Download Invoice & Revised Wire Instructions (PDF)</a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 20px;">Apex Accounts Receivable • Contact: billing-support@apex-cloud-billing.com</p>
          </div>
        </div>
      `,
      simulated_link_text: 'Download Invoice & Revised Wire Instructions (PDF)',
      simulated_link_url: 'https://apex-cloud-billing.com/invoices/download?id=4891',
      red_flags_json: JSON.stringify([
        'Threatens immediate production outage to compel rapid payment without verification',
        'Requests routing money to "updated remittance receiving account" without dual confirmation',
        'External lookalike domain apex-cloud-billing.com'
      ]),
      recommended_training_id: 'tm_finance'
    },
    {
      id: 'tpl_hr_benefits',
      title: 'Workday HR: Mandatory 2026 Benefits Open Enrollment Review',
      target_role: 'HR',
      scenario: 'Employee Benefits / Handbook Acknowledgement',
      difficulty: 'Easy',
      sender_name: 'Workday Enterprise Notifications',
      sender_email: 'benefits@internal-workday-portal.org',
      subject: 'URGENT: 24 Hours Left to Confirm Your Healthcare & 401(k) Elections',
      body_html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b;">
          <div style="background: #005cb9; padding: 18px 24px; color: #ffffff; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">workday® Employee Services</h2>
          </div>
          <div style="padding: 24px; border: 1px solid #cbd5e1; border-top: none; background: #ffffff; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; line-height: 1.6;">Hello,</p>
            <p style="font-size: 14px; line-height: 1.6;">Your organization's Annual Benefits Open Enrollment window is concluding. Our records indicate your 2026 medical, dental, and 401(k) election documents have not been digitally acknowledged.</p>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0;">
              <p style="margin: 0; font-size: 13px; color: #1e40af;">If you fail to acknowledge your elections before the deadline, you will automatically be enrolled in the high-deductible default plan.</p>
            </div>
            <div style="margin: 24px 0; text-align: center;">
              <a href="#simulate-click" class="sim-phish-btn" style="background: #005cb9; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Review & Sign Benefits Package on Workday</a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 20px;">Workday HCM Enterprise Systems • Do not forward this email</p>
          </div>
        </div>
      `,
      simulated_link_text: 'Review & Sign Benefits Package on Workday',
      simulated_link_url: 'https://internal-workday-portal.org/elections/review',
      red_flags_json: JSON.stringify([
        'Sender domain uses .org extension (internal-workday-portal.org) rather than corporate SSO',
        'Creates panic regarding losing healthcare or default medical package assignment',
        'Directs employee to an unauthenticated external login portal'
      ]),
      recommended_training_id: 'tm_hr'
    },
    {
      id: 'tpl_exec_board',
      title: 'Confidential Executive Briefing: M&A Diligence Access',
      target_role: 'Executive',
      scenario: 'Merger & Acquisition Virtual Data Room (VDR)',
      difficulty: 'Hard',
      sender_name: 'Board Secretary & Special Counsel',
      sender_email: 'board-advisory@executive-briefing-room.com',
      subject: 'CONFIDENTIAL: Q4 Strategic Acquisition Target - Diligence Room Access',
      body_html: `
        <div style="font-family: Georgia, serif; max-width: 600px; color: #0f172a;">
          <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px;">
            <h3 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Office of the Board of Directors</h3>
            <span style="font-size: 12px; color: #64748b; font-family: sans-serif;">STRICTLY CONFIDENTIAL • EXCLUSIVE TO EXECUTIVE COMMITTEE</span>
          </div>
          <div style="padding: 10px 0;">
            <p style="font-size: 14px; line-height: 1.7;">Dear Colleague,</p>
            <p style="font-size: 14px; line-height: 1.7;">In accordance with yesterday's non-disclosure covenant, the encrypted virtual data room (VDR) containing the financial forecasts and valuation models for Project Titan has been initialized.</p>
            <p style="font-size: 14px; line-height: 1.7;">Due to SEC regulatory filing deadlines, board members and key executives must review the executive summary and submit preliminary advisory notes before 18:00 EST.</p>
            <div style="margin: 26px 0; text-align: center;">
              <a href="#simulate-click" class="sim-phish-btn" style="background: #0f172a; color: #ffffff; font-family: sans-serif; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; display: inline-block;">Access Encrypted Board Diligence Room</a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; font-family: sans-serif; margin-top: 24px;">Security Classification: Restricted Level 4 • Single Device Authorization</p>
          </div>
        </div>
      `,
      simulated_link_text: 'Access Encrypted Board Diligence Room',
      simulated_link_url: 'https://executive-briefing-room.com/vdr/project-titan/login',
      red_flags_json: JSON.stringify([
        'Whaling tactic leveraging high-stakes M&A confidentiality to deter verification',
        'Domain executive-briefing-room.com is an unvetted third-party domain',
        'Requests corporate executive credentials via external link'
      ]),
      recommended_training_id: 'tm_exec'
    }
  ];

  const insertTemplate = db.prepare(`
    INSERT INTO phishing_templates (id, title, target_role, scenario, difficulty, sender_name, sender_email, subject, body_html, simulated_link_text, simulated_link_url, red_flags_json, recommended_training_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const t of phishingTemplates) {
    insertTemplate.run(t.id, t.title, t.target_role, t.scenario, t.difficulty, t.sender_name, t.sender_email, t.subject, t.body_html, t.simulated_link_text, t.simulated_link_url, t.red_flags_json, t.recommended_training_id);
  }

  // 4. Users & Employees
  const usersToCreate = [
    {
      id: 'usr_admin',
      email: 'admin@cybershield.corp',
      password_hash: adminHash,
      role: 'admin',
      employee: null
    },
    {
      id: 'usr_alex',
      email: 'alex.dev@cybershield.corp',
      password_hash: demoHash,
      role: 'employee',
      employee: {
        id: 'emp_alex',
        name: 'Alex Chen',
        department_id: 'dept_eng',
        role_title: 'Senior Cloud & Platform Engineer',
        role_category: 'Developer',
        risk_score: 22,
        remediation_status: 'good_standing',
        resilience_points: 240,
        streak_count: 3,
        simulations_tested: 5,
        simulations_clicked: 0,
        simulations_reported: 5,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    },
    {
      id: 'usr_sarah',
      email: 'sarah.hr@cybershield.corp',
      password_hash: demoHash,
      role: 'employee',
      employee: {
        id: 'emp_sarah',
        name: 'Sarah Connor',
        department_id: 'dept_hr',
        role_title: 'Senior HR Business Partner',
        role_category: 'HR',
        risk_score: 35,
        remediation_status: 'good_standing',
        resilience_points: 150,
        streak_count: 2,
        simulations_tested: 4,
        simulations_clicked: 1,
        simulations_reported: 3,
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      }
    },
    {
      id: 'usr_david',
      email: 'david.finance@cybershield.corp',
      password_hash: demoHash,
      role: 'employee',
      employee: {
        id: 'emp_david',
        name: 'David Miller',
        department_id: 'dept_finance',
        role_title: 'Senior Financial Controller',
        role_category: 'Finance',
        risk_score: 68,
        remediation_status: 'remediation_required',
        resilience_points: 60,
        streak_count: 0,
        simulations_tested: 3,
        simulations_clicked: 2,
        simulations_reported: 1,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      }
    },
    {
      id: 'usr_rachel',
      email: 'rachel.payroll@cybershield.corp',
      password_hash: demoHash,
      role: 'employee',
      employee: {
        id: 'emp_rachel',
        name: 'Rachel Green',
        department_id: 'dept_payroll',
        role_title: 'Payroll Operations Lead',
        role_category: 'Payroll',
        risk_score: 20,
        remediation_status: 'good_standing',
        resilience_points: 310,
        streak_count: 4,
        simulations_tested: 6,
        simulations_clicked: 0,
        simulations_reported: 6,
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      }
    },
    {
      id: 'usr_elena',
      email: 'elena.exec@cybershield.corp',
      password_hash: demoHash,
      role: 'employee',
      employee: {
        id: 'emp_elena',
        name: 'Elena Vance',
        department_id: 'dept_exec',
        role_title: 'VP of Enterprise Operations',
        role_category: 'Executive',
        risk_score: 42,
        remediation_status: 'good_standing',
        resilience_points: 180,
        streak_count: 1,
        simulations_tested: 4,
        simulations_clicked: 1,
        simulations_reported: 2,
        avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'
      }
    },
    {
      id: 'usr_marcus',
      email: 'marcus.devops@cybershield.corp',
      password_hash: demoHash,
      role: 'employee',
      employee: {
        id: 'emp_marcus',
        name: 'Marcus Brody',
        department_id: 'dept_eng',
        role_title: 'Lead Site Reliability Engineer',
        role_category: 'Developer',
        risk_score: 15,
        remediation_status: 'good_standing',
        resilience_points: 400,
        streak_count: 6,
        simulations_tested: 6,
        simulations_clicked: 0,
        simulations_reported: 6,
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      }
    },
    {
      id: 'usr_jessica',
      email: 'jessica.acct@cybershield.corp',
      password_hash: demoHash,
      role: 'employee',
      employee: {
        id: 'emp_jessica',
        name: 'Jessica Taylor',
        department_id: 'dept_finance',
        role_title: 'Accounts Payable Specialist',
        role_category: 'Finance',
        risk_score: 75,
        remediation_status: 'remediation_required',
        resilience_points: 45,
        streak_count: 0,
        simulations_tested: 4,
        simulations_clicked: 3,
        simulations_reported: 0,
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      }
    }
  ];

  const insertUser = db.prepare(`INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)`);
  const insertEmp = db.prepare(`
    INSERT INTO employees (id, user_id, name, email, department_id, role_title, role_category, risk_score, remediation_status, resilience_points, streak_count, simulations_tested, simulations_clicked, simulations_reported, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of usersToCreate) {
    insertUser.run(u.id, u.email, u.password_hash, u.role);
    if (u.employee) {
      insertEmp.run(
        u.employee.id,
        u.id,
        u.employee.name,
        u.email,
        u.employee.department_id,
        u.employee.role_title,
        u.employee.role_category,
        u.employee.risk_score,
        u.employee.remediation_status,
        u.employee.resilience_points,
        u.employee.streak_count,
        u.employee.simulations_tested,
        u.employee.simulations_clicked,
        u.employee.simulations_reported,
        u.employee.avatar_url
      );
    }
  }

  // 5. Seed Campaigns
  const campaigns = [
    {
      id: 'cmp_payroll_2026',
      name: 'Q4 Payroll & Direct Deposit Spear-Phishing Drill',
      description: 'Simulated payroll ACH update targeting compensation teams and HR staff.',
      target_department_id: 'dept_payroll',
      target_role: 'Payroll',
      template_id: 'tpl_payroll_salary',
      status: 'active',
      total_targets: 1,
      clicked_count: 0,
      reported_count: 0,
      opened_count: 1
    },
    {
      id: 'cmp_dev_token',
      name: 'Cloud Security Advisory: Fake PAT Revocation',
      description: 'High-fidelity GitHub Personal Access Token breach notification targeting cloud and software developers.',
      target_department_id: 'dept_eng',
      target_role: 'Developer',
      template_id: 'tpl_dev_github',
      status: 'active',
      total_targets: 2,
      clicked_count: 0,
      reported_count: 1,
      opened_count: 2
    },
    {
      id: 'cmp_finance_wire',
      name: 'Apex Infrastructure Urgent Wire & Past Due Invoice',
      description: 'Simulated Business Email Compromise targeting financial controllers and AP specialists.',
      target_department_id: 'dept_finance',
      target_role: 'Finance',
      template_id: 'tpl_finance_invoice',
      status: 'active',
      total_targets: 2,
      clicked_count: 2,
      reported_count: 0,
      opened_count: 2
    },
    {
      id: 'cmp_hr_enrollment',
      name: 'Workday Open Enrollment Deadline Push',
      description: 'Benefits acknowledgement spoof targeting HR partners.',
      target_department_id: 'dept_hr',
      target_role: 'HR',
      template_id: 'tpl_hr_benefits',
      status: 'active',
      total_targets: 1,
      clicked_count: 0,
      reported_count: 1,
      opened_count: 1
    }
  ];

  const insertCmp = db.prepare(`
    INSERT INTO campaigns (id, name, description, target_department_id, target_role, template_id, status, total_targets, clicked_count, reported_count, opened_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of campaigns) {
    insertCmp.run(c.id, c.name, c.description, c.target_department_id, c.target_role, c.template_id, c.status, c.total_targets, c.clicked_count, c.reported_count, c.opened_count);
  }

  // 6. Campaign Targets (Assign to employees so their inboxes have active simulations!)
  const targets = [
    // Rachel Green receives the Payroll simulation (status: opened, awaiting user action!)
    { id: 'tgt_rachel_payroll', campaign_id: 'cmp_payroll_2026', employee_id: 'emp_rachel', status: 'opened' },
    // Alex Chen receives Developer GitHub simulation (status: opened, awaiting action!)
    { id: 'tgt_alex_dev', campaign_id: 'cmp_dev_token', employee_id: 'emp_alex', status: 'opened' },
    // Marcus Brody also receives Developer simulation (already reported!)
    { id: 'tgt_marcus_dev', campaign_id: 'cmp_dev_token', employee_id: 'emp_marcus', status: 'reported' },
    // David Miller clicked Finance simulation (remediation required!)
    { id: 'tgt_david_finance', campaign_id: 'cmp_finance_wire', employee_id: 'emp_david', status: 'clicked' },
    // Jessica Taylor clicked Finance simulation
    { id: 'tgt_jessica_finance', campaign_id: 'cmp_finance_wire', employee_id: 'emp_jessica', status: 'clicked' },
    // Sarah Connor receives HR benefits simulation (status: opened)
    { id: 'tgt_sarah_hr', campaign_id: 'cmp_hr_enrollment', employee_id: 'emp_sarah', status: 'opened' }
  ];

  const insertTarget = db.prepare(`
    INSERT INTO campaign_targets (id, campaign_id, employee_id, status)
    VALUES (?, ?, ?, ?)
  `);
  for (const t of targets) {
    insertTarget.run(t.id, t.campaign_id, t.employee_id, t.status);
  }

  // 7. Seed initial training assignments for employees requiring remediation
  const assignments = [
    {
      id: 'ta_david_finance',
      employee_id: 'emp_david',
      module_id: 'tm_finance',
      campaign_id: 'cmp_finance_wire',
      status: 'assigned',
      score: 0
    },
    {
      id: 'ta_jessica_finance',
      employee_id: 'emp_jessica',
      module_id: 'tm_finance',
      campaign_id: 'cmp_finance_wire',
      status: 'assigned',
      score: 0
    }
  ];

  const insertAssign = db.prepare(`
    INSERT INTO training_assignments (id, employee_id, module_id, campaign_id, status, score)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const a of assignments) {
    insertAssign.run(a.id, a.employee_id, a.module_id, a.campaign_id, a.status, a.score);
  }

  // 8. Seed interaction events & SOC telemetry
  const events = [
    {
      id: 'evt_seed_1',
      campaign_id: 'cmp_finance_wire',
      employee_id: 'emp_david',
      event_type: 'EMAIL_DELIVERED',
      payload_json: JSON.stringify({ message: 'Delivered to corporate mailbox david.finance@cybershield.corp' })
    },
    {
      id: 'evt_seed_2',
      campaign_id: 'cmp_finance_wire',
      employee_id: 'emp_david',
      event_type: 'EMAIL_OPENED',
      payload_json: JSON.stringify({ client: 'Outlook for Windows' })
    },
    {
      id: 'evt_seed_3',
      campaign_id: 'cmp_finance_wire',
      employee_id: 'emp_david',
      event_type: 'LINK_CLICKED',
      payload_json: JSON.stringify({ campaign_name: 'Apex Infrastructure Urgent Wire', scenario: 'Vendor Billing' })
    },
    {
      id: 'evt_seed_4',
      campaign_id: 'cmp_finance_wire',
      employee_id: 'emp_david',
      event_type: 'REMEDIATION_ASSIGNED',
      payload_json: JSON.stringify({ module_title: 'Defending Against Invoice Fraud & Business Email Compromise (BEC)', reason: 'Automated remediation triggered upon simulated link click' })
    },
    {
      id: 'evt_seed_5',
      campaign_id: 'cmp_dev_token',
      employee_id: 'emp_marcus',
      event_type: 'SIMULATION_REPORTED',
      payload_json: JSON.stringify({ campaign_name: 'Cloud Security Advisory: Fake PAT Revocation', reportedVia: 'CyberShield Outlook Plugin' })
    }
  ];

  const insertEvent = db.prepare(`
    INSERT INTO interaction_events (id, campaign_id, employee_id, event_type, payload_json)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const e of events) {
    insertEvent.run(e.id, e.campaign_id, e.employee_id, e.event_type, e.payload_json);
  }

  // 9. Initial risk history
  const riskHistories = [
    {
      id: 'rh_david_1',
      employee_id: 'emp_david',
      previous_score: 42,
      new_score: 68,
      change_delta: 26,
      reason: 'Risk increased from 42 -> 68 (+26 pts) because simulated phishing link was clicked in campaign "Apex Infrastructure Urgent Wire & Past Due Invoice"',
      trigger_event_id: 'evt_seed_3'
    },
    {
      id: 'rh_marcus_1',
      employee_id: 'emp_marcus',
      previous_score: 27,
      new_score: 15,
      change_delta: -12,
      reason: 'Risk decreased from 27 -> 15 (-12 pts) because employee correctly detected and reported simulated spear-phishing attack',
      trigger_event_id: 'evt_seed_5'
    }
  ];

  const insertHist = db.prepare(`
    INSERT INTO risk_history (id, employee_id, previous_score, new_score, change_delta, reason, trigger_event_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const rh of riskHistories) {
    insertHist.run(rh.id, rh.employee_id, rh.previous_score, rh.new_score, rh.change_delta, rh.reason, rh.trigger_event_id);
  }

  console.log('CyberShield database successfully seeded with realistic enterprise data!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
