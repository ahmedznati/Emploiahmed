const mongoose = require('mongoose');

/**
 * Base schema with common fields and methods.
 */
const BaseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

module.exports = BaseSchema;
