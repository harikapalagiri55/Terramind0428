const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { generateId } = require('../riskEngine');

// List all campaigns
router.get('/', (req, res) => {
  const campaigns = db.prepare(`
    SELECT c.*, 
           t.title as template_title, t.scenario, t.difficulty, t.target_role,
           d.name as department_name,
           (SELECT COUNT(*) FROM campaign_targets WHERE campaign_id = c.id) as total_targets,
           (SELECT COUNT(*) FROM campaign_targets WHERE campaign_id = c.id AND status = 'clicked') as clicked_count,
           (SELECT COUNT(*) FROM campaign_targets WHERE campaign_id = c.id AND status = 'reported') as reported_count,
           (SELECT COUNT(*) FROM campaign_targets WHERE campaign_id = c.id AND status = 'opened') as opened_count
    FROM campaigns c
    JOIN phishing_templates t ON c.template_id = t.id
    LEFT JOIN departments d ON c.target_department_id = d.id
    ORDER BY c.created_at DESC
  `).all();

  const formatted = campaigns.map(c => ({
    ...c,
    clickRate: c.total_targets > 0 ? Math.round((c.clicked_count / c.total_targets) * 100) : 0,
    reportRate: c.total_targets > 0 ? Math.round((c.reported_count / c.total_targets) * 100) : 0
  }));

  res.json({ campaigns: formatted });
});

// Get single campaign with targets
router.get('/:id', (req, res) => {
  const campaign = db.prepare(`
    SELECT c.*, 
           t.title as template_title, t.scenario, t.difficulty, t.target_role, 
           t.sender_name, t.sender_email, t.subject, t.body_html, t.simulated_link_text, 
           t.simulated_link_url, t.red_flags_json,
           d.name as department_name
    FROM campaigns c
    JOIN phishing_templates t ON c.template_id = t.id
    LEFT JOIN departments d ON c.target_department_id = d.id
    WHERE c.id = ?
  `).get(req.params.id);

  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const targets = db.prepare(`
    SELECT ct.*, e.name as employee_name, e.email as employee_email, 
           e.role_title, e.role_category, e.risk_score, e.remediation_status, e.avatar_url
    FROM campaign_targets ct
    JOIN employees e ON ct.employee_id = e.id
    WHERE ct.campaign_id = ?
    ORDER BY e.name ASC
  `).all(req.params.id);

  res.json({
    campaign: {
      ...campaign,
      redFlags: JSON.parse(campaign.red_flags_json || '[]'),
      targets
    }
  });
});

// List available phishing templates
router.get('/templates/list', (req, res) => {
  const templates = db.prepare(`
    SELECT pt.*, tm.title as training_title
    FROM phishing_templates pt
    LEFT JOIN training_modules tm ON pt.recommended_training_id = tm.id
    ORDER BY pt.target_role ASC, pt.created_at DESC
  `).all().map(t => ({
    ...t,
    redFlags: JSON.parse(t.red_flags_json || '[]')
  }));

  res.json({ templates });
});

// Dynamic Role-Based Phishing Template Synthesizer
router.post('/templates/synthesize', (req, res) => {
  const { targetRole, topic, brand, difficulty } = req.body;
  if (!targetRole) return res.status(400).json({ error: 'targetRole is required' });

  const roleClean = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
  const diff = difficulty || 'Medium';
  const orgBrand = brand || 'Global Enterprise';
  const templateId = generateId('tpl_syn');

  let title = '';
  let scenario = '';
  let senderName = '';
  let senderEmail = '';
  let subject = '';
  let bodyHtml = '';
  let linkText = '';
  let linkUrl = '';
  let redFlags = [];
  let trainingId = 'tm_payroll';

  switch (roleClean) {
    case 'Payroll':
      title = `${orgBrand} Payroll Audit: Direct Deposit Account Re-verification`;
      scenario = 'Direct Deposit Account Update / Payroll Verification';
      senderName = 'Payroll Operations Automated Desk';
      senderEmail = 'compliance@payroll-adp-reconcile.net';
      subject = `[URGENT] Verify ACH Account Details for ${orgBrand} Pay Period`;
      linkText = 'Review & Verify Direct Deposit Form';
      linkUrl = 'https://payroll-adp-reconcile.net/auth/ach-verify?session=2026';
      trainingId = 'tm_payroll';
      redFlags = [
        'Spoofed external domain: payroll-adp-reconcile.net',
        'Artificial urgency demanding banking check within 4 hours',
        'Direct link prompting for financial routing authentication'
      ];
      bodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b;">
          <div style="background: #1e3a8a; padding: 18px 24px; color: #ffffff; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 19px;">${orgBrand} Payroll Services</h2>
          </div>
          <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff; border-radius: 0 0 8px 8px;">
            <p>Hello,</p>
            <p>During automated reconciliation, your direct deposit record had a checksum error. Please re-authenticate your banking profile to prevent payroll postponement.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="#simulate-click" class="sim-phish-btn" style="background: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Review & Verify Direct Deposit Form</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">Notice ID: ACH-992-SEC</p>
          </div>
        </div>
      `;
      break;

    case 'Developer':
      title = `NPM Supply Chain Compromise Alert: Invalidate Pipeline Keys`;
      scenario = 'CI/CD & Token Compromise';
      senderName = 'GitHub Ecosystem Security Team';
      senderEmail = 'security-advisories@github-ci-pipeline.io';
      subject = `[CRITICAL ACTION] Malicious dependency detected in project manifest`;
      linkText = 'Authorize Secret Invalidation & View Affected Builds';
      linkUrl = 'https://github-ci-pipeline.io/advisories/token-revoke?repo=main';
      trainingId = 'tm_dev';
      redFlags = [
        'Lookalike domain: github-ci-pipeline.io instead of official github.com',
        'Requests full OAuth scope re-authorization',
        'Simulates urgent developer urgency regarding a broken CI pipeline'
      ];
      bodyHtml = `
        <div style="font-family: monospace; max-width: 600px; color: #1e293b; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px;">
          <div style="color: #dc2626; font-weight: bold; font-size: 16px; margin-bottom: 12px;">[CVE-2026-9042] Critical Supply Chain Alert</div>
          <p>A maintainer account for an imported dependency in your primary repo has been compromised. Build runner tokens must be rotated immediately.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="#simulate-click" class="sim-phish-btn" style="background: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: sans-serif;">Authorize Secret Invalidation & View Affected Builds</a>
          </div>
          <p style="font-size: 11px; color: #64748b;">Automated GitHub Enterprise Sentinel</p>
        </div>
      `;
      break;

    case 'Finance':
      title = `Vendor Wire Transfer Modification: Urgent Remittance Update`;
      scenario = 'Vendor Bank Modification / BEC';
      senderName = 'Global Tech Supplies Remittance';
      senderEmail = 'remittance@globaltech-supplier-portal.com';
      subject = `URGENT: Updated Bank Wire Instructions for Pending Invoice #90214`;
      linkText = 'Download Revised Wiring Form (Signed PDF)';
      linkUrl = 'https://globaltech-supplier-portal.com/remittance/pdf-download?id=90214';
      trainingId = 'tm_finance';
      redFlags = [
        'Requests sudden change to vendor wire banking coordinates',
        'Pressure to execute payment without standard voice call-back',
        'Phishing domain globaltech-supplier-portal.com'
      ];
      bodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; background: #fff;">
          <h3 style="color: #0f172a; margin-top: 0;">Vendor Remittance Notice</h3>
          <p>Please note that due to our Q4 corporate banking migration, all outgoing wires must be directed to our new custodial account.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="#simulate-click" class="sim-phish-btn" style="background: #0284c7; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Download Revised Wiring Form (Signed PDF)</a>
          </div>
        </div>
      `;
      break;

    case 'HR':
      title = `${orgBrand} Mandatory Annual Compliance Handbook Attestation`;
      scenario = 'Employee Handbook / Compliance Policy Signature';
      senderName = 'People Experience & Legal Compliance';
      senderEmail = 'legal@internal-docu-portal.net';
      subject = `Mandatory Action: Digitally Sign Updated 2026 Anti-Harassment Policy`;
      linkText = 'Review & Sign Compliance Policy Online';
      linkUrl = 'https://internal-docu-portal.net/docusign/sign?envelope=9021';
      trainingId = 'tm_hr';
      redFlags = [
        'Spoofed legal compliance sender on internal-docu-portal.net',
        'Threatens disciplinary review if not signed today',
        'Direct link bypassing company intranet'
      ];
      bodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; background: #fff;">
          <h3 style="color: #1e293b; margin-top: 0;">Employee Compliance Sign-Off</h3>
          <p>All staff are required to acknowledge the revised corporate governance policy before COB.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="#simulate-click" class="sim-phish-btn" style="background: #4f46e5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Review & Sign Compliance Policy Online</a>
          </div>
        </div>
      `;
      break;

    default:
      title = `Microsoft 365: Urgent Password Expiration Notice`;
      scenario = 'Credential Harvesting / SSO';
      senderName = 'Microsoft 365 Identity Alert';
      senderEmail = 'security@m365-office-access.org';
      subject = `Security Notice: Corporate SSO credentials will expire in 2 hours`;
      linkText = 'Keep Current Password & Re-verify Identity';
      linkUrl = 'https://m365-office-access.org/identity/keep-password';
      trainingId = 'tm_exec';
      redFlags = [
        'Fake password expiration designed to trigger panic',
        'Domain m365-office-access.org is completely unaffiliated with Microsoft',
        'Requests corporate credentials'
      ];
      bodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; background: #fff;">
          <h3 style="color: #0078d4; margin-top: 0;">Microsoft 365 Security Center</h3>
          <p>Your enterprise credentials will expire in 2 hours unless renewed. Retain your current credentials now:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="#simulate-click" class="sim-phish-btn" style="background: #0078d4; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Keep Current Password & Re-verify Identity</a>
          </div>
        </div>
      `;
  }

  // Insert into database
  db.prepare(`
    INSERT INTO phishing_templates (id, title, target_role, scenario, difficulty, sender_name, sender_email, subject, body_html, simulated_link_text, simulated_link_url, red_flags_json, recommended_training_id, is_custom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    templateId,
    title,
    roleClean,
    scenario,
    diff,
    senderName,
    senderEmail,
    subject,
    bodyHtml,
    linkText,
    linkUrl,
    JSON.stringify(redFlags),
    trainingId
  );

  const synthesized = db.prepare(`SELECT * FROM phishing_templates WHERE id = ?`).get(templateId);
  res.json({
    template: {
      ...synthesized,
      redFlags
    }
  });
});

// Create and launch a new campaign
router.post('/', (req, res) => {
  const { name, description, targetDepartmentId, targetRole, templateId, employeeIds } = req.body;

  if (!name || !templateId) {
    return res.status(400).json({ error: 'Campaign name and templateId are required' });
  }

  const campaignId = generateId('cmp');

  // Find target employees
  let targetEmployees = [];
  if (employeeIds && employeeIds.length > 0) {
    const placeholders = employeeIds.map(() => '?').join(',');
    targetEmployees = db.prepare(`SELECT * FROM employees WHERE id IN (${placeholders})`).all(...employeeIds);
  } else if (targetDepartmentId && targetRole) {
    targetEmployees = db.prepare(`SELECT * FROM employees WHERE department_id = ? AND role_category = ?`).all(targetDepartmentId, targetRole);
  } else if (targetDepartmentId) {
    targetEmployees = db.prepare(`SELECT * FROM employees WHERE department_id = ?`).all(targetDepartmentId);
  } else if (targetRole) {
    targetEmployees = db.prepare(`SELECT * FROM employees WHERE role_category = ?`).all(targetRole);
  } else {
    // All employees
    targetEmployees = db.prepare(`SELECT * FROM employees`).all();
  }

  // Insert campaign
  db.prepare(`
    INSERT INTO campaigns (id, name, description, target_department_id, target_role, template_id, status, total_targets)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
  `).run(
    campaignId,
    name,
    description || 'Targeted human risk simulation drill',
    targetDepartmentId || null,
    targetRole || null,
    templateId,
    targetEmployees.length
  );

  // Insert campaign targets and trigger interaction events
  const insertTarget = db.prepare(`
    INSERT INTO campaign_targets (id, campaign_id, employee_id, status, delivered_at)
    VALUES (?, ?, ?, 'delivered', CURRENT_TIMESTAMP)
  `);

  const insertEvent = db.prepare(`
    INSERT INTO interaction_events (id, campaign_id, employee_id, event_type, payload_json, created_at)
    VALUES (?, ?, ?, 'EMAIL_DELIVERED', ?, CURRENT_TIMESTAMP)
  `);

  const updateEmpSimCount = db.prepare(`
    UPDATE employees 
    SET simulations_tested = simulations_tested + 1 
    WHERE id = ?
  `);

  for (const emp of targetEmployees) {
    const targetId = generateId('tgt');
    insertTarget.run(targetId, campaignId, emp.id);

    const eventId = generateId('evt');
    insertEvent.run(
      eventId,
      campaignId,
      emp.id,
      JSON.stringify({
        campaign_name: name,
        recipient_email: emp.email,
        deliveryStatus: '250 OK - Queued for delivery'
      })
    );

    updateEmpSimCount.run(emp.id);
  }

  const createdCampaign = db.prepare(`SELECT * FROM campaigns WHERE id = ?`).get(campaignId);

  res.status(201).json({
    success: true,
    campaign: createdCampaign,
    targetsDelivered: targetEmployees.length
  });
});

// Launch paused campaign
router.post('/:id/launch', (req, res) => {
  db.prepare(`UPDATE campaigns SET status = 'active' WHERE id = ?`).run(req.params.id);
  res.json({ success: true, status: 'active' });
});

// Pause campaign
router.post('/:id/pause', (req, res) => {
  db.prepare(`UPDATE campaigns SET status = 'paused' WHERE id = ?`).run(req.params.id);
  res.json({ success: true, status: 'paused' });
});

// End / complete campaign
router.post('/:id/end', (req, res) => {
  db.prepare(`UPDATE campaigns SET status = 'completed' WHERE id = ?`).run(req.params.id);
  res.json({ success: true, status: 'completed' });
});

module.exports = router;
