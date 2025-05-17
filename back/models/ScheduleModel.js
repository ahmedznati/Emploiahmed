const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

/**
 * Schedule schema.
 */
const ScheduleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    day: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    teacherId: {
      type: String,
      required: true
    },
    className: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    is_exam: {
      type: Boolean,
      default: false,
    },
    week: {
      type: Number,
      required: true
    }
  }
);

ScheduleSchema.add(BaseSchema);

module.exports = mongoose.model('Schedule', ScheduleSchema);
