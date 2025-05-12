const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/ClassModel');

const router = express.Router();

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Add a new class
router.post('/', async (req, res) => {
  try {
    console.log('Incoming request data:', req.body);

    const { id, name, subjectRequirements } = req.body;

    // Validate required fields
    if (!id || !name || !Array.isArray(subjectRequirements)) {
      console.error('Validation error: Missing or invalid fields', { id, name, subjectRequirements });
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    // Log the validated data
    console.log('Validated class data:', { id, name, subjectRequirements });

    // Check if the class name already exists
    const existingClass = await Class.findOne({ name });
    if (existingClass) {
      return res.status(400).json({ error: 'Class name already exists' });
    }

    const newClass = new Class({ id, name, subjectRequirements });
    await newClass.save();

    res.json({ success: true, id: newClass.id });
  } catch (error) {
    console.error('Error adding class:', error);
  }
});

// Update a class by ID
router.put('/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const data = req.body;

    // Validate subjectRequirements
    if (data.subjectRequirements && !Array.isArray(data.subjectRequirements)) {
      return res.status(400).json({ error: 'subjectRequirements must be an array' });
    }

    // Update the class using the custom `id` field
    const updatedClass = await Class.findOneAndUpdate({ id: classId }, data, { new: true });

    if (!updatedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Fetch all class names
router.get('/names', async (req, res) => {
  try {
    const classes = await Class.find({}, 'id name');
    res.json(classes);
  } catch (error) {
    console.error('Error fetching class names:', error);
    res.status(500).json({ error: 'Failed to fetch class names' });
  }
});

// Add subject requirements to a class
router.post('/:classId/requirements', async (req, res) => {
  try {
    const { classId } = req.params;
    const { subjectRequirements } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $set: { subjectRequirements } },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(updatedClass);
  } catch (error) {
    console.error('Error adding subject requirements:', error);
    res.status(500).json({ error: 'Failed to add subject requirements' });
  }
});

// Delete a class by ID
router.delete('/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    // Try to delete by custom id field first
    const deleted = await Class.findOneAndDelete({ id: classId });
    if (!deleted) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

module.exports = router;
