const express = require('express');
const Schedule = require('../models/ScheduleModel');

const router = express.Router();

// Get all schedule items
router.get('/schedule', async (req, res) => {
  try {
    const scheduleItems = await Schedule.find();
    res.json(scheduleItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule items' });
  }
});

// Update schedule (replace all entries)
router.post('/schedule', async (req, res) => {
  try {
    const data = req.body; // Array of schedule entries

    // Clear existing schedule
    await Schedule.deleteMany();

    // Insert new schedule entries
    await Schedule.insertMany(data);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Save generated schedule (append or replace)
router.post('/schedule/save', async (req, res) => {
  try {
    const data = req.body; // Array of schedule entries
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'No schedule data provided' });
    }
    // Optionally: clear existing schedule or just insert new
    await Schedule.deleteMany();
    await Schedule.insertMany(data);
    res.json({ success: true, message: 'Schedule saved to database' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save schedule' });
  }
});

module.exports = router;
