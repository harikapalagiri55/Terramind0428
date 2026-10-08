const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { getOrgMetrics } = require('../riskEngine');
const { seedDatabase } = require('../seed');

// Executive summary report
router.get('/summary', (req, res) => {
  try {
    const metrics = getOrgMetrics();

    const campaignReports = db.prepare(`
      SELECT c.id, c.name, c.status, c.created_at,
             d.name as department_name,
             pt.scenario, pt.difficulty, pt.target_role,
             (SELECT COUNT(*) FROM campaign_targets WHERE campaign_id = c.id) as total_targets,
             (SELECT COUNT(*) FROM campaign_targets WHERE campaign_id = c.id AND status = 'opened') as opened_count,
             (SELECT COUNT(*) FROM campaign_targets WHERE campaign_id = c.id AND status = 'clicked') as clicked_count,
             (SELECT COUNT(*) FROM campaign_targets WHERE campaign_id = c.id AND status = 'reported') as reported_count
      FROM campaigns c
      JOIN phishing_templates pt ON c.template_id = pt.id
      LEFT JOIN departments d ON c.target_department_id = d.id
      ORDER BY c.created_at DESC
    `).all().map(c => {
      const clickRate = c.total_targets > 0 ? Math.round((c.clicked_count / c.total_targets) * 100) : 0;
      const reportRate = c.total_targets > 0 ? Math.round((c.reported_count / c.total_targets) * 100) : 0;
      return {
        ...c,
        clickRate,
        reportRate,
        resilienceRatio: reportRate > 0 ? (reportRate / Math.max(1, clickRate)).toFixed(1) : '0.0'
      };
    });

    const trainingStats = db.prepare(`
      SELECT tm.title, tm.target_role,
             COUNT(ta.id) as assigned_count,
             SUM(CASE WHEN ta.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
             AVG(ta.score) as avg_score
      FROM training_modules tm
      LEFT JOIN training_assignments ta ON tm.id = ta.module_id
      GROUP BY tm.id
    `).all().map(t => ({
      ...t,
      completionRate: t.assigned_count > 0 ? Math.round((t.completed_count / t.assigned_count) * 100) : 100,
      avgScore: Math.round(t.avg_score || 0)
    }));

    res.json({
      generatedAt: new Date().toISOString(),
      organization: 'CyberShield Global Corp',
      complianceFrameworks: ['NIST SP 800-50', 'ISO/IEC 27001:2022', 'SOC 2 Type II', 'NIS2 Human Factor'],
      metrics,
      campaignReports,
      trainingStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CSV Export endpoint
router.get('/export-csv', (req, res) => {
  try {
    const targets = db.prepare(`
      SELECT ct.id as target_id, ct.status, ct.delivered_at, ct.opened_at, ct.clicked_at, ct.reported_at,
             e.name as employee_name, e.email as employee_email, e.role_category, e.risk_score, e.remediation_status,
             c.name as campaign_name,
             pt.scenario, pt.difficulty
      FROM campaign_targets ct
      JOIN employees e ON ct.employee_id = e.id
      JOIN campaigns c ON ct.campaign_id = c.id
      JOIN phishing_templates pt ON c.template_id = pt.id
      ORDER BY ct.delivered_at DESC
    `).all();

    let csv = 'TargetID,EmployeeName,Email,Role,RiskScore,RemediationStatus,Campaign,Scenario,Difficulty,Status,DeliveredAt,ClickedAt,ReportedAt\n';

    for (const t of targets) {
      csv += `"${t.target_id}","${t.employee_name}","${t.employee_email}","${t.role_category}",${t.risk_score},"${t.remediation_status}","${t.campaign_name}","${t.scenario}","${t.difficulty}","${t.status}","${t.delivered_at || ''}","${t.clicked_at || ''}","${t.reported_at || ''}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cybershield_phishing_audit.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset demo database to clean seeded state
router.post('/reset-demo', (req, res) => {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Database reset to fresh demo state successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
