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

module.exports = router;
