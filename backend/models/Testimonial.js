const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // reviewer/client name
    role: { type: String }, // e.g. "CTO, Fintech Corp"
    content: { type: String, required: true },
    avatar: { type: String }, // path/URL to reviewer photo
    rating: { type: Number, default: 5 }, // 1 to 5 rating
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

module.exports = mongoose.model('Testimonial', testimonialSchema);
