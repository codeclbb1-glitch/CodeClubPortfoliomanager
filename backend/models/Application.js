const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 150 },
    phone: { type: String, required: true, maxlength: 20 },
    address: { type: String, maxlength: 255 },
    education: { type: String, maxlength: 150 },
    experience: { type: String, maxlength: 150 },
    skills: { type: String, maxlength: 255 },
    linkedin: { type: String, required: true, maxlength: 255 },
    github: { type: String, maxlength: 255 },
    resume: { type: String, required: true },
    cover_letter: { type: String, maxlength: 1000 },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
  },
  {
    timestamps: { createdAt: 'applied_at', updatedAt: false },
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

module.exports = mongoose.model('Application', applicationSchema);
