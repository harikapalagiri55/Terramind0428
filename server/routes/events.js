const express = require('express');
const router = express.Router();
const { db } = require('../db');

// List interaction events
router.get('/', (req, res) => {
  const { eventType, limit = 50 } = req.query;

  let query = `
    SELECT ie.id, ie.campaign_id, ie.employee_id, ie.event_type, ie.payload_json, ie.created_at,
           e.name as employee_name, e.email as employee_email, e.role_category, e.avatar_url,
           d.name as department_name,
           c.name as campaign_name
    FROM interaction_events ie
    JOIN employees e ON ie.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN campaigns c ON ie.campaign_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (eventType && eventType !== 'all') {
    query += ` AND ie.event_type = ?`;
    params.push(eventType);
  }

  query += ` ORDER BY ie.created_at DESC LIMIT ?`;
  params.push(parseInt(limit, 10));

  const events = db.prepare(query).all(...params).map(e => ({
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

  res.json({ events });
});

module.exports = router;
