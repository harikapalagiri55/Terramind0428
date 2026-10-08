const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { recordTrainingCompletion } = require('../riskEngine');

// List all training modules
router.get('/modules', (req, res) => {
  const modules = db.prepare(`SELECT * FROM training_modules ORDER BY target_role ASC`).all();
  const formatted = modules.map(m => ({
    ...m,
    indicators: JSON.parse(m.indicators_json || '[]'),
    quiz: JSON.parse(m.quiz_json || '[]')
  }));
  res.json({ modules: formatted });
});

// Single training module
router.get('/modules/:id', (req, res) => {
  const module = db.prepare(`SELECT * FROM training_modules WHERE id = ?`).get(req.params.id);
  if (!module) return res.status(404).json({ error: 'Training module not found' });

  res.json({
    module: {
      ...module,
      indicators: JSON.parse(module.indicators_json || '[]'),
      quiz: JSON.parse(module.quiz_json || '[]')
    }
  });
});

// Get assignments for employee
router.get('/my-assignments', (req, res) => {
  const { employeeId } = req.query;
  if (!employeeId) return res.status(400).json({ error: 'employeeId is required' });

  const assignments = db.prepare(`
    SELECT ta.*, 
           tm.title as module_title, tm.category, tm.target_role, tm.estimated_minutes,
           tm.description, tm.indicators_json, tm.content_markdown, tm.quiz_json,
           c.name as campaign_name
    FROM training_assignments ta
    JOIN training_modules tm ON ta.module_id = tm.id
    LEFT JOIN campaigns c ON ta.campaign_id = c.id
    WHERE ta.employee_id = ?
    ORDER BY CASE WHEN ta.status != 'completed' THEN 0 ELSE 1 END, ta.assigned_at DESC
  `).all(employeeId);

  const formatted = assignments.map(a => ({
    ...a,
    indicators: JSON.parse(a.indicators_json || '[]'),
    quiz: JSON.parse(a.quiz_json || '[]')
  }));

  res.json({ assignments: formatted });
});

// Complete training assignment
router.post('/assignments/:id/complete', (req, res) => {
  const assignmentId = req.params.id;
  const { score = 100 } = req.body;

  try {
    const result = recordTrainingCompletion(assignmentId, score);
    res.json(result);
  } catch (error) {
    console.error('Error completing training assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
