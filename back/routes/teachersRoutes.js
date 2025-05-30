// routes/teacherRoutes.js
const express = require('express');
const Teacher = require('../models/TeacherModel');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Add a new teacher
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, subjects, availability } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if a teacher with the same name already exists (case-insensitive)
    const existing = await Teacher.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ error: 'The teacher already exists' });
    }

    const newTeacher = new Teacher({ name, subjects, availability });
    await newTeacher.save();

    res.json({ success: true, id: newTeacher._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add teacher' });
  }
});

// Update a teacher by ID
router.put('/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, subjects, availability } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { name, subjects, availability },
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

// Delete a teacher by ID
router.delete('/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const result = await Teacher.findByIdAndDelete(teacherId);

    if (!result) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

module.exports = router;