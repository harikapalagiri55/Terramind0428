const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { getOrgMetrics } = require('../riskEngine');

router.get('/stats', (req, res) => {
  try {
    const metrics = getOrgMetrics();

    // Fetch recent 10 events with employee details
    const recentEvents = db.prepare(`
      SELECT ie.id, ie.campaign_id, ie.employee_id, ie.event_type, ie.payload_json, ie.created_at,
             e.name as employee_name, e.email as employee_email, e.role_category, e.avatar_url,
             d.name as department_name,
             c.name as campaign_name
      FROM interaction_events ie
      JOIN employees e ON ie.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN campaigns c ON ie.campaign_id = c.id
      ORDER BY ie.created_at DESC
      LIMIT 12
    `).all().map(e => ({
      id: e.id,
      eventType: e.event_type,
      employeeName: e.employee_name,
      employeeEmail: e.employee_email,
      roleCategory: e.role_category,
      department: e.department_name,
      avatarUrl: e.avatar_url,
      campaignName: e.campaign_name || 'Direct Drill',
      payload: JSON.parse(e.payload_json || '{}'),
      createdAt: e.created_at
    }));

    // Top phishing vectors / scenarios by clicks
    const topScenarios = db.prepare(`
      SELECT pt.scenario, pt.target_role, 
             COUNT(ct.id) as delivered_count,
             SUM(CASE WHEN ct.status = 'clicked' THEN 1 ELSE 0 END) as clicked_count,
             SUM(CASE WHEN ct.status = 'reported' THEN 1 ELSE 0 END) as reported_count
      FROM phishing_templates pt
      JOIN campaigns c ON pt.id = c.template_id
      JOIN campaign_targets ct ON c.id = ct.campaign_id
      GROUP BY pt.scenario, pt.target_role
      ORDER BY clicked_count DESC
      LIMIT 5
    `).all().map(s => ({
      scenario: s.scenario,
      role: s.target_role,
      delivered: s.delivered_count,
      clicked: s.clicked_count,
      reported: s.reported_count,
      clickRate: s.delivered_count > 0 ? Math.round((s.clicked_count / s.delivered_count) * 100) : 0
    }));

    // Risk timeline: aggregation of risk history over the last 7 entries
    const recentRiskAdjustments = db.prepare(`
      SELECT rh.id, rh.previous_score, rh.new_score, rh.change_delta, rh.reason, rh.created_at,
             e.name as employee_name, e.role_category, e.avatar_url
      FROM risk_history rh
      JOIN employees e ON rh.employee_id = e.id
      ORDER BY rh.created_at DESC
      LIMIT 8
    `).all();

    res.json({
      ...metrics,
      recentEvents,
      topScenarios,
      recentRiskAdjustments
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
