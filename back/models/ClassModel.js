const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

/**
 * Class schema.
 */
const ClassSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    subjectRequirements: [
      {
        subject: { type: String, required: true },
        hoursPerWeek: { type: Number, required: true },
      },
    ],
  }
);

ClassSchema.add(BaseSchema);

module.exports = mongoose.model('Class', ClassSchema);
