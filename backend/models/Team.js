const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String },
    experience: { type: String }, // e.g. "5+ Years"
    stack: { type: String }, // comma-separated, e.g. "Golang, Python, AWS"
    photo: { type: String }, // path/URL to member profile photo
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

module.exports = mongoose.model('Team', teamSchema);
