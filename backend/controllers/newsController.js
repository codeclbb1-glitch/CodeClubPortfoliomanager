const News = require('../models/News');

// GET /api/news or /news
async function getNews(req, res) {
  try {
    const { search, limit } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { date: searchRegex }
        ]
      };
    }

    let newsQuery = News.find(query).sort({ order: 1, created_at: -1 });

    if (limit && !isNaN(limit)) {
      newsQuery = newsQuery.limit(parseInt(limit));
    }

    const news = await newsQuery.exec();
    res.json({ success: true, count: news.length, news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/news/:id
async function getSingleNews(req, res) {
  try {
    const { id } = req.params;
    const newsItem = await News.findById(id);
    if (!newsItem) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }
    res.json({ success: true, news: newsItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/news (Admin only)
async function createNews(req, res) {
  try {
    const { title, description, summary, image, date, order } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const formattedDate = date && date.trim() ? date.trim() : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const newsItem = await News.create({
      title: title.trim(),
      description: (description || summary || '').trim(),
      image: (image || '').trim(),
      date: formattedDate,
      order: Number(order) || 0
    });

    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      news: newsItem
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/news/:id (Admin only)
async function updateNews(req, res) {
  try {
    const { id } = req.params;
    const { title, description, summary, image, date, order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const formattedDate = date && date.trim() ? date.trim() : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const newsItem = await News.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: (description || summary || '').trim(),
        image: (image || '').trim(),
        date: formattedDate,
        order: Number(order) || 0
      },
      { new: true, runValidators: true }
    );

    if (!newsItem) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    res.json({
      success: true,
      message: 'News article updated successfully',
      news: newsItem
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/news/:id (Admin only)
async function deleteNews(req, res) {
  try {
    const { id } = req.params;
    const newsItem = await News.findByIdAndDelete(id);
    if (!newsItem) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }
    res.json({ success: true, message: 'News article deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getNews,
  getSingleNews,
  createNews,
  updateNews,
  deleteNews
};
