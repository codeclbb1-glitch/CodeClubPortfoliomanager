const Testimonial = require('../models/Testimonial');

async function getTestimonials(req, res) {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1 });
    res.json({ success: true, testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createTestimonial(req, res) {
  try {
    const { name, role, content, avatar, rating, order } = req.body;
    if (!name || !content) {
      return res.status(400).json({ success: false, message: 'Name and content are required' });
    }
    const testimonial = await Testimonial.create({
      name,
      role,
      content,
      avatar,
      rating: Number(rating) || 5,
      order: Number(order) || 0
    });
    res.status(201).json({ success: true, message: 'Testimonial created successfully', testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateTestimonial(req, res) {
  try {
    const { id } = req.params;
    const { name, role, content, avatar, rating, order } = req.body;
    if (!name || !content) {
      return res.status(400).json({ success: false, message: 'Name and content are required' });
    }
    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { name, role, content, avatar, rating: Number(rating) || 5, order: Number(order) || 0 },
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial updated successfully', testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteTestimonial(req, res) {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
};
