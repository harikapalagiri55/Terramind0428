const { db } = require('./db');
const crypto = require('crypto');

function generateId(prefix = 'id') {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

// Get organization-wide metrics & Human Vulnerability Index (HVI)
function getOrgMetrics() {
  const employees = db.prepare(`SELECT * FROM employees`).all();
  const totalEmployees = employees.length || 1;

  const totalRiskSum = employees.reduce((acc, e) => acc + (e.risk_score || 0), 0);
  const hvi = Math.round(totalRiskSum / totalEmployees);
  const orgSecurityScore = Math.max(0, 100 - hvi);

  // Active campaigns
  const activeCampaigns = db.prepare(`SELECT COUNT(*) as count FROM campaigns WHERE status = 'active'`).get().count;
  const totalCampaigns = db.prepare(`SELECT COUNT(*) as count FROM campaigns`).get().count;

  // Interaction totals
  const targets = db.prepare(`SELECT status, COUNT(*) as count FROM campaign_targets GROUP BY status`).all();
  let totalTested = db.prepare(`SELECT COUNT(*) as count FROM campaign_targets`).get().count;
  let clickedTotal = 0;
  let reportedTotal = 0;
  let openedTotal = 0;

  for (const t of targets) {
    if (t.status === 'clicked') clickedTotal += t.count;
    if (t.status === 'reported') reportedTotal += t.count;
    if (t.status === 'opened') openedTotal += t.count;
  }

  const clickRate = totalTested > 0 ? Math.round((clickedTotal / totalTested) * 100) : 0;
  const reportRate = totalTested > 0 ? Math.round((reportedTotal / totalTested) * 100) : 0;

  // Remediation counts
  const remediationRequired = employees.filter(e => e.remediation_status === 'remediation_required').length;
  const trainingCompleted = employees.filter(e => e.remediation_status === 'training_completed').length;
  const goodStanding = employees.filter(e => e.remediation_status === 'good_standing').length;

  // Department risk breakdown
  const departments = db.prepare(`
    SELECT d.id, d.name, 
      COUNT(e.id) as employee_count,
      AVG(e.risk_score) as avg_risk,
      SUM(e.simulations_tested) as total_simulations,
      SUM(e.simulations_clicked) as total_clicks,
      SUM(e.simulations_reported) as total_reports
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id
    GROUP BY d.id
  `).all().map(d => ({
    id: d.id,
    name: d.name,
    employee_count: d.employee_count || 0,
    avg_risk: Math.round(d.avg_risk || 0),
    total_simulations: d.total_simulations || 0,
    total_clicks: d.total_clicks || 0,
    total_reports: d.total_reports || 0,
    click_rate: d.total_simulations > 0 ? Math.round((d.total_clicks / d.total_simulations) * 100) : 0
  }));

  // Role risk breakdown
  const roleRisk = db.prepare(`
    SELECT role_category, 
      COUNT(id) as count,
      AVG(risk_score) as avg_risk,
      SUM(simulations_clicked) as clicks,
      SUM(simulations_reported) as reports
    FROM employees
    GROUP BY role_category
  `).all().map(r => ({
    role: r.role_category,
    count: r.count,
    avg_risk: Math.round(r.avg_risk || 0),
    clicks: r.clicks || 0,
    reports: r.reports || 0
  }));

  // Risk band categorization
  let riskBand = 'Low Risk';
  let riskBandColor = 'emerald';
  if (hvi > 70) {
    riskBand = 'Critical Risk';
    riskBandColor = 'rose';
  } else if (hvi > 45) {
    riskBand = 'High Risk';
    riskBandColor = 'rose';
  } else if (hvi > 25) {
    riskBand = 'Medium Risk';
    riskBandColor = 'amber';
  }

  return {
    hvi,
    orgSecurityScore,
    riskBand,
    riskBandColor,
    activeCampaigns,
    totalCampaigns,
    totalEmployees: employees.length,
    totalTested,
    clickedTotal,
    reportedTotal,
    openedTotal,
    clickRate,
    reportRate,
    remediationRequired,
    trainingCompleted,
    goodStanding,
    departments,
    roleRisk
  };
}

// Record an employee link click in simulated phishing attack
function recordPhishingClick(campaignId, employeeId, details = {}) {
  const employee = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(employeeId);
  if (!employee) throw new Error('Employee not found');

  const campaign = db.prepare(`
    SELECT c.*, t.title as template_title, t.scenario, t.target_role, t.red_flags_json, t.recommended_training_id
    FROM campaigns c
    JOIN phishing_templates t ON c.template_id = t.id
    WHERE c.id = ?
  `).get(campaignId);

  // 1. Update target status
  db.prepare(`
    UPDATE campaign_targets
    SET status = 'clicked', clicked_at = CURRENT_TIMESTAMP
    WHERE campaign_id = ? AND employee_id = ?
  `).run(campaignId, employeeId);

  // 2. Increment campaign clicked count
  db.prepare(`
    UPDATE campaigns
    SET clicked_count = clicked_count + 1
    WHERE id = ?
  `).run(campaignId);

  // 3. Log interaction event
  const eventId = generateId('evt');
  db.prepare(`
    INSERT INTO interaction_events (id, campaign_id, employee_id, event_type, payload_json, created_at)
    VALUES (?, ?, ?, 'LINK_CLICKED', ?, CURRENT_TIMESTAMP)
  `).run(
    eventId,
    campaignId,
    employeeId,
    JSON.stringify({
      campaign_name: campaign ? campaign.name : 'Unknown Campaign',
      scenario: campaign ? campaign.scenario : 'General',
      userAgent: details.userAgent || 'Enterprise Browser',
      ip: details.ip || '10.0.4.12'
    })
  );

  // 4. Calculate explainable risk increase
  const prevScore = employee.risk_score;
  const riskDelta = 26; // High vulnerability impact
  const newScore = Math.min(100, prevScore + riskDelta);

  const reason = `Risk increased from ${prevScore} -> ${newScore} (+${riskDelta} pts) because simulated phishing link was clicked in campaign "${campaign ? campaign.name : 'Simulated Campaign'}"`;

  // 5. Update employee state: status -> remediation_required
  db.prepare(`
    UPDATE employees
    SET risk_score = ?,
        remediation_status = 'remediation_required',
        simulations_clicked = simulations_clicked + 1,
        streak_count = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newScore, employeeId);

  // 6. Record Risk History record
  const riskHistId = generateId('rh');
  db.prepare(`
    INSERT INTO risk_history (id, employee_id, previous_score, new_score, change_delta, reason, trigger_event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(riskHistId, employeeId, prevScore, newScore, riskDelta, reason, eventId);

  // 7. Auto-assign appropriate targeted micro-training
  let trainingModule = null;
  if (campaign && campaign.recommended_training_id) {
    trainingModule = db.prepare(`SELECT * FROM training_modules WHERE id = ?`).get(campaign.recommended_training_id);
  }
  if (!trainingModule) {
    // Fallback to role-matching module or general
    trainingModule = db.prepare(`
      SELECT * FROM training_modules 
      WHERE target_role = ? OR target_role = 'General' 
      ORDER BY CASE WHEN target_role = ? THEN 0 ELSE 1 END
      LIMIT 1
    `).get(employee.role_category, employee.role_category);
  }

  let assignmentId = null;
  if (trainingModule) {
    // Check if already assigned
    const existing = db.prepare(`
      SELECT id FROM training_assignments 
      WHERE employee_id = ? AND module_id = ? AND status != 'completed'
    `).get(employeeId, trainingModule.id);

    if (existing) {
      assignmentId = existing.id;
    } else {
      assignmentId = generateId('ta');
      db.prepare(`
        INSERT INTO training_assignments (id, employee_id, module_id, campaign_id, status, assigned_at)
        VALUES (?, ?, ?, ?, 'assigned', CURRENT_TIMESTAMP)
      `).run(assignmentId, employeeId, trainingModule.id, campaignId);

      // Log Remediation Assigned event
      const remEventId = generateId('evt');
      db.prepare(`
        INSERT INTO interaction_events (id, campaign_id, employee_id, event_type, payload_json, created_at)
        VALUES (?, ?, ?, 'REMEDIATION_ASSIGNED', ?, CURRENT_TIMESTAMP)
      `).run(
        remEventId,
        campaignId,
        employeeId,
        JSON.stringify({
          module_id: trainingModule.id,
          module_title: trainingModule.title,
          reason: 'Automated remediation triggered upon simulated link click'
        })
      );
    }
  }

  return {
    success: true,
    previousScore: prevScore,
    newScore,
    riskDelta,
    reason,
    remediationStatus: 'remediation_required',
    trainingModule: trainingModule ? {
      id: trainingModule.id,
      title: trainingModule.title,
      estimated_minutes: trainingModule.estimated_minutes,
      assignmentId
    } : null,
    campaign: campaign ? {
      name: campaign.name,
      scenario: campaign.scenario,
      red_flags: JSON.parse(campaign.red_flags_json || '[]')
    } : null
  };
}

// Record an employee reporting the simulated phishing email (Hoxhunt-style positive behavior)
function recordPhishingReport(campaignId, employeeId, details = {}) {
  const employee = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(employeeId);
  if (!employee) throw new Error('Employee not found');

  const campaign = db.prepare(`SELECT * FROM campaigns WHERE id = ?`).get(campaignId);

  // 1. Update target status
  db.prepare(`
    UPDATE campaign_targets
    SET status = 'reported', reported_at = CURRENT_TIMESTAMP
    WHERE campaign_id = ? AND employee_id = ?
  `).run(campaignId, employeeId);

  // 2. Increment campaign reported count
  db.prepare(`
    UPDATE campaigns
    SET reported_count = reported_count + 1
    WHERE id = ?
  `).run(campaignId);

  // 3. Log interaction event
  const eventId = generateId('evt');
  db.prepare(`
    INSERT INTO interaction_events (id, campaign_id, employee_id, event_type, payload_json, created_at)
    VALUES (?, ?, ?, 'SIMULATION_REPORTED', ?, CURRENT_TIMESTAMP)
  `).run(
    eventId,
    campaignId,
    employeeId,
    JSON.stringify({
      campaign_name: campaign ? campaign.name : 'Unknown Campaign',
      reportedVia: 'CyberShield Outlook/Web Plugin',
      badgeEarned: 'Phish Hunter Shield (+50 XP)'
    })
  );

  // 4. Calculate risk decrease & resilience boost
  const prevScore = employee.risk_score;
  const riskDelta = -12; // Risk reduction for proactive detection
  const newScore = Math.max(5, prevScore + riskDelta);
  const pointsAwarded = 50;

  const reason = `Risk decreased from ${prevScore} -> ${newScore} (-${Math.abs(riskDelta)} pts) because employee correctly detected and reported simulated spear-phishing attack`;

  // 5. Update employee record
  db.prepare(`
    UPDATE employees
    SET risk_score = ?,
        resilience_points = resilience_points + ?,
        streak_count = streak_count + 1,
        simulations_reported = simulations_reported + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newScore, pointsAwarded, employeeId);

  // 6. Record Risk History
  const riskHistId = generateId('rh');
  db.prepare(`
    INSERT INTO risk_history (id, employee_id, previous_score, new_score, change_delta, reason, trigger_event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(riskHistId, employeeId, prevScore, newScore, riskDelta, reason, eventId);

  return {
    success: true,
    previousScore: prevScore,
    newScore,
    riskDelta,
    reason,
    pointsAwarded,
    newStreak: employee.streak_count + 1,
    resiliencePoints: employee.resilience_points + pointsAwarded
  };
}

// Complete a micro-training module
function recordTrainingCompletion(assignmentId, score = 100) {
  const assignment = db.prepare(`
    SELECT ta.*, tm.title as module_title, tm.category, tm.target_role
    FROM training_assignments ta
    JOIN training_modules tm ON ta.module_id = tm.id
    WHERE ta.id = ?
  `).get(assignmentId);

  if (!assignment) throw new Error('Training assignment not found');

  const employee = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(assignment.employee_id);
  if (!employee) throw new Error('Employee not found');

  // 1. Update assignment status
  db.prepare(`
    UPDATE training_assignments
    SET status = 'completed', score = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(score, assignmentId);

  // 2. Log training completed event
  const eventId = generateId('evt');
  db.prepare(`
    INSERT INTO interaction_events (id, campaign_id, employee_id, event_type, payload_json, created_at)
    VALUES (?, ?, ?, 'TRAINING_COMPLETED', ?, CURRENT_TIMESTAMP)
  `).run(
    eventId,
    assignment.campaign_id,
    assignment.employee_id,
    JSON.stringify({
      module_title: assignment.module_title,
      score: `${score}%`,
      badgeAwarded: 'Remediation Cleared'
    })
  );

  // 3. Calculate risk improvement
  const prevScore = employee.risk_score;
  const riskDelta = -20; // Healthy recovery
  const newScore = Math.max(5, prevScore + riskDelta);
  const pointsAwarded = 35;

  const reason = `Risk decreased from ${prevScore} -> ${newScore} (-${Math.abs(riskDelta)} pts) upon successful 100% completion of micro-training "${assignment.module_title}"`;

  // 4. Check if other assignments are still pending
  const pendingAssignments = db.prepare(`
    SELECT COUNT(*) as count 
    FROM training_assignments 
    WHERE employee_id = ? AND status != 'completed' AND id != ?
  `).get(assignment.employee_id, assignmentId).count;

  const newRemediationStatus = pendingAssignments === 0 ? 'training_completed' : 'remediation_required';

  // 5. Update employee
  db.prepare(`
    UPDATE employees
    SET risk_score = ?,
        remediation_status = ?,
        resilience_points = resilience_points + ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newScore, newRemediationStatus, pointsAwarded, assignment.employee_id);

  // 6. Record Risk History
  const riskHistId = generateId('rh');
  db.prepare(`
    INSERT INTO risk_history (id, employee_id, previous_score, new_score, change_delta, reason, trigger_event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(riskHistId, assignment.employee_id, prevScore, newScore, riskDelta, reason, eventId);

  return {
    success: true,
    previousScore: prevScore,
    newScore,
    riskDelta,
    reason,
    remediationStatus: newRemediationStatus,
    pointsAwarded,
    moduleTitle: assignment.module_title
  };
}

module.exports = {
  generateId,
  getOrgMetrics,
  recordPhishingClick,
  recordPhishingReport,
  recordTrainingCompletion
};
