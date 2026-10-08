const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { generateId } = require('../riskEngine');

// List all employees with filter support
router.get('/', (req, res) => {
  const { departmentId, roleCategory, remediationStatus, search } = req.query;

  let query = `
    SELECT e.*, d.name as department_name,
           (SELECT COUNT(*) FROM training_assignments WHERE employee_id = e.id AND status != 'completed') as pending_training_count
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (departmentId && departmentId !== 'all') {
    query += ` AND e.department_id = ?`;
    params.push(departmentId);
  }

  if (roleCategory && roleCategory !== 'all') {
    query += ` AND e.role_category = ?`;
    params.push(roleCategory);
  }

  if (remediationStatus && remediationStatus !== 'all') {
    query += ` AND e.remediation_status = ?`;
    params.push(remediationStatus);
  }

  if (search) {
    query += ` AND (e.name LIKE ? OR e.email LIKE ? OR e.role_title LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += ` ORDER BY e.risk_score DESC, e.name ASC`;

  const employees = db.prepare(query).all(...params);

  res.json({ employees });
});

// Single employee detail with timeline and explainable risk factor breakdown
router.get('/:id', (req, res) => {
  const employee = db.prepare(`
    SELECT e.*, d.name as department_name, d.description as department_description
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  // Explainable risk history
  const riskHistory = db.prepare(`
    SELECT * FROM risk_history 
    WHERE employee_id = ? 
    ORDER BY created_at DESC
  `).all(req.params.id);

  // Event telemetry timeline
  const timeline = db.prepare(`
    SELECT ie.*, c.name as campaign_name
    FROM interaction_events ie
    LEFT JOIN campaigns c ON ie.campaign_id = c.id
    WHERE ie.employee_id = ?
    ORDER BY ie.created_at DESC
  `).all(req.params.id).map(e => ({
    ...e,
    payload: JSON.parse(e.payload_json || '{}')
  }));

  // Training assignments
  const trainingAssignments = db.prepare(`
    SELECT ta.*, tm.title as module_title, tm.category, tm.estimated_minutes
    FROM training_assignments ta
    JOIN training_modules tm ON ta.module_id = tm.id
    WHERE ta.employee_id = ?
    ORDER BY ta.assigned_at DESC
  `).all(req.params.id);

  // Simulations received
  const simulations = db.prepare(`
    SELECT ct.*, c.name as campaign_name, pt.scenario, pt.difficulty
    FROM campaign_targets ct
    JOIN campaigns c ON ct.campaign_id = c.id
    JOIN phishing_templates pt ON c.template_id = pt.id
    WHERE ct.employee_id = ?
    ORDER BY ct.delivered_at DESC
  `).all(req.params.id);

  // Explainable Risk Factor Breakdown
  const clickPenalties = employee.simulations_clicked * 25;
  const reportBonuses = employee.simulations_reported * 12;
  const completedTrainings = trainingAssignments.filter(t => t.status === 'completed').length;
  const trainingDiscount = completedTrainings * 20;

  const explainableFactors = [
    { factor: 'Baseline Role Exposure', impact: '+15 pts', description: `Standard baseline risk for ${employee.role_category} threat surface` },
    { factor: 'Phishing Simulation Clicks', impact: `+${clickPenalties} pts`, description: `${employee.simulations_clicked} link clicks in simulated attacks` },
    { factor: 'Proactive Phish Reports', impact: `-${reportBonuses} pts`, description: `${employee.simulations_reported} verified threat detections via CyberShield button` },
    { factor: 'Remediation Training Credits', impact: `-${trainingDiscount} pts`, description: `${completedTrainings} micro-training modules completed` }
  ];

  res.json({
    employee,
    explainableFactors,
    riskHistory,
    timeline,
    trainingAssignments,
    simulations
  });
});

// Admin manually assigns training
router.post('/:id/assign-training', (req, res) => {
  const { moduleId } = req.body;
  if (!moduleId) return res.status(400).json({ error: 'moduleId is required' });

  const employee = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const assignmentId = generateId('ta');
  db.prepare(`
    INSERT INTO training_assignments (id, employee_id, module_id, status, assigned_at)
    VALUES (?, ?, ?, 'assigned', CURRENT_TIMESTAMP)
  `).run(assignmentId, req.params.id, moduleId);

  db.prepare(`
    UPDATE employees 
    SET remediation_status = 'remediation_required', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(req.params.id);

  const eventId = generateId('evt');
  db.prepare(`
    INSERT INTO interaction_events (id, employee_id, event_type, payload_json, created_at)
    VALUES (?, ?, 'REMEDIATION_ASSIGNED', ?, CURRENT_TIMESTAMP)
  `).run(
    eventId,
    req.params.id,
    JSON.stringify({ moduleId, source: 'Manual Admin Assignment' })
  );

  res.json({ success: true, assignmentId });
});

module.exports = router;
