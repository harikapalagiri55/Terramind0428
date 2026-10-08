const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { recordPhishingClick, recordPhishingReport, generateId } = require('../riskEngine');

// Helper to get employeeId from query or authenticated user
function resolveEmployeeId(req) {
  if (req.query.employeeId) return req.query.employeeId;
  if (req.user) {
    const emp = db.prepare(`SELECT id FROM employees WHERE user_id = ?`).get(req.user.id);
    if (emp) return emp.id;
  }
  return null;
}

// Get simulated inbox for an employee
router.get('/inbox', (req, res) => {
  let employeeId = resolveEmployeeId(req);

  // If no employee ID provided, fallback to first employee
  if (!employeeId) {
    const firstEmp = db.prepare(`SELECT id FROM employees LIMIT 1`).get();
    employeeId = firstEmp ? firstEmp.id : null;
  }

  if (!employeeId) return res.status(404).json({ error: 'No employee specified or found' });

  const employee = db.prepare(`
    SELECT e.*, d.name as department_name 
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = ?
  `).get(employeeId);

  // Fetch all active simulations targeted to this employee
  const simulationTargets = db.prepare(`
    SELECT ct.id as target_id, ct.status as target_status, ct.delivered_at, ct.opened_at, ct.clicked_at, ct.reported_at,
           c.id as campaign_id, c.name as campaign_name, c.status as campaign_status,
           t.id as template_id, t.title as template_title, t.scenario, t.difficulty,
           t.sender_name, t.sender_email, t.subject, t.body_html, t.simulated_link_text, 
           t.simulated_link_url, t.red_flags_json, t.recommended_training_id
    FROM campaign_targets ct
    JOIN campaigns c ON ct.campaign_id = c.id
    JOIN phishing_templates t ON c.template_id = t.id
    WHERE ct.employee_id = ? AND c.status = 'active'
    ORDER BY ct.delivered_at DESC
  `).all(employeeId);

  const simulationEmails = simulationTargets.map(st => ({
    id: `sim_${st.campaign_id}`,
    isSimulation: true,
    campaignId: st.campaign_id,
    targetId: st.target_id,
    senderName: st.sender_name,
    senderEmail: st.sender_email,
    subject: st.subject,
    bodyHtml: st.body_html,
    linkText: st.simulated_link_text,
    linkUrl: st.simulated_link_url,
    difficulty: st.difficulty,
    scenario: st.scenario,
    redFlags: JSON.parse(st.red_flags_json || '[]'),
    recommendedTrainingId: st.recommended_training_id,
    status: st.target_status, // 'delivered', 'opened', 'clicked', 'reported'
    timestamp: st.delivered_at,
    isUnread: st.target_status === 'delivered'
  }));

  // Add realistic benign corporate emails to make inbox authentic
  const benignEmails = [
    {
      id: 'benign_1',
      isSimulation: false,
      senderName: 'Internal IT Helpdesk',
      senderEmail: 'helpdesk@cybershield.corp',
      subject: 'Scheduled Maintenance: Identity SSO Upgrade this Saturday',
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; color: #334155;">
          <p>Hi Team,</p>
          <p>This is a reminder that internal Single Sign-On (SSO) systems will undergo scheduled routine maintenance on Saturday between 02:00 - 04:00 UTC.</p>
          <p>No password changes or credential updates are required.</p>
          <p style="margin-top: 20px;">Best regards,<br/><strong>IT Operations Team</strong></p>
        </div>
      `,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      isUnread: false
    },
    {
      id: 'benign_2',
      isSimulation: false,
      senderName: 'People & Workplace Team',
      senderEmail: 'workplace@cybershield.corp',
      subject: 'Office Facilities Update: New Healthy Snack Stations on Floor 4',
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; color: #334155;">
          <p>Hello Everyone!</p>
          <p>We are delighted to share that new organic coffee and beverage stations are now live on the 4th floor lounge.</p>
          <p>Enjoy your break!</p>
        </div>
      `,
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      isUnread: false
    }
  ];

  // Combine and sort by date
  const allEmails = [...simulationEmails, ...benignEmails];

  res.json({
    employee,
    emails: allEmails,
    totalSimulations: simulationEmails.length,
    pendingSimulations: simulationEmails.filter(e => e.status !== 'clicked' && e.status !== 'reported').length
  });
});

// Mark email as opened
router.post('/open', (req, res) => {
  const { campaignId, employeeId } = req.body;
  if (!campaignId || !employeeId) return res.status(400).json({ error: 'campaignId and employeeId required' });

  const target = db.prepare(`SELECT * FROM campaign_targets WHERE campaign_id = ? AND employee_id = ?`).get(campaignId, employeeId);
  if (!target) return res.status(404).json({ error: 'Simulation target not found' });

  if (target.status === 'delivered') {
    db.prepare(`
      UPDATE campaign_targets 
      SET status = 'opened', opened_at = CURRENT_TIMESTAMP 
      WHERE campaign_id = ? AND employee_id = ?
    `).run(campaignId, employeeId);

    db.prepare(`UPDATE campaigns SET opened_count = opened_count + 1 WHERE id = ?`).run(campaignId);

    const eventId = generateId('evt');
    db.prepare(`
      INSERT INTO interaction_events (id, campaign_id, employee_id, event_type, payload_json, created_at)
      VALUES (?, ?, ?, 'EMAIL_OPENED', ?, CURRENT_TIMESTAMP)
    `).run(
      eventId,
      campaignId,
      employeeId,
      JSON.stringify({ client: 'CyberShield Simulated Mailbox' })
    );
  }

  res.json({ success: true, status: 'opened' });
});

// Employee clicked simulated phishing link!
router.post('/click', (req, res) => {
  const { campaignId, employeeId, userAgent, ip } = req.body;
  if (!campaignId || !employeeId) {
    return res.status(400).json({ error: 'campaignId and employeeId required' });
  }

  try {
    const result = recordPhishingClick(campaignId, employeeId, { userAgent, ip });
    res.json(result);
  } catch (error) {
    console.error('Error recording phishing click:', error);
    res.status(500).json({ error: error.message });
  }
});

// Employee reported simulated phishing email (Hoxhunt-style positive shield button)
router.post('/report', (req, res) => {
  const { campaignId, employeeId } = req.body;
  if (!campaignId || !employeeId) {
    return res.status(400).json({ error: 'campaignId and employeeId required' });
  }

  try {
    const result = recordPhishingReport(campaignId, employeeId);
    res.json(result);
  } catch (error) {
    console.error('Error recording phishing report:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
