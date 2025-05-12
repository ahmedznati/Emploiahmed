const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

/**
 * Schedule schema.
 */
const ScheduleSchema = new mongoose.Schema(
  {
    is_exam: {
      type: Boolean,
      default: false,
    },
  }
);

ScheduleSchema.add(BaseSchema);

module.exports = mongoose.model('Schedule', ScheduleSchema);
