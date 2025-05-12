// models/TeacherModel.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

/**
 * Teacher schema.
 */
const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subjects: {
    type: [String],
    default: [],
  },
  availability: {
    type: {
      monday: [{ start: String, end: String }],
      tuesday: [{ start: String, end: String }],
      wednesday: [{ start: String, end: String }],
      thursday: [{ start: String, end: String }],
      friday: [{ start: String, end: String }],
      saturday: [{ start: String, end: String }],
      sunday: [{ start: String, end: String }],
    },
    default: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  },
});

TeacherSchema.add(BaseSchema);

module.exports = mongoose.model('Teacher', TeacherSchema);