// routes/subjectRoutes.js
const express = require('express');
const Subject = require('../models/SubjectModel');

const router = express.Router();

// Fetch all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Add a new subject
router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid subject name' });
  }

  try {
    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(400).json({ error: 'Subject already exists' });
    }

    const newSubject = new Subject({ name });
    await newSubject.save();

    res.status(201).json({ subject: newSubject });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

module.exports = router;