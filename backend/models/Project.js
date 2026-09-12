const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    projectType: { type: String }, // e.g. "Full-Stack", "Mobile App", "AI/ML", "E-Commerce", "SaaS"
    description: { type: String },
    image: { type: String }, // path/URL to case study / project showcase image
    tags: [{ type: String }], // Array of tags
    techStack: { type: String }, // Comma-separated tags string for backward compatibility
    link: { type: String }, // Live link or website URL
    liveLink: { type: String }, // Alias for link
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

module.exports = mongoose.model('Project', projectSchema);
