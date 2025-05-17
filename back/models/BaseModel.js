const mongoose = require('mongoose');

/**
 * Base schema with common fields and methods.
 */
const BaseSchema = new mongoose.Schema(
  {
    // id field removed to avoid conflict
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

module.exports = BaseSchema;
