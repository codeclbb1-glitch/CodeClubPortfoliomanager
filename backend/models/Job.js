const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: String },
    job_type: { type: String, default: 'Full-time' },
    description: { type: String, required: true },
    requirements: { type: String },
    skills: { type: String },
    deadline: { type: Date },
    status: { type: String, enum: ['active', 'closed'], default: 'active' }
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

module.exports = mongoose.model('Job', jobSchema);
