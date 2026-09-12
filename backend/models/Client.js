const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Business Name / Title
    logo: { type: String }, // path/URL to logo image of the service
    service: { type: String }, // Service we provide / focus area
    description: { type: String }, // Description
    about: { type: String }, // Fallback / alias for description
    order: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Client', clientSchema);
