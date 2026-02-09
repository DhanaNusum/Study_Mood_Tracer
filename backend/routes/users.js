const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile with favorites
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('name email favoriteSubjects')
      .lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ ...user, favoriteSubjects: user.favoriteSubjects || [] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update favorite subjects
router.put('/favorites', authenticateToken, async (req, res) => {
  try {
    const { favoriteSubjects } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { favoriteSubjects: Array.isArray(favoriteSubjects) ? favoriteSubjects : [] },
      { new: true }
    ).select('favoriteSubjects');
    res.json({ favoriteSubjects: user.favoriteSubjects || [] });
  } catch (error) {
    console.error('Error updating favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle favorite subject
router.post('/favorites/:subject', authenticateToken, async (req, res) => {
  try {
    const subject = req.params.subject.trim();
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.favoriteSubjects = user.favoriteSubjects || [];
    const idx = user.favoriteSubjects.map(s => s.toLowerCase()).indexOf(subject.toLowerCase());
    if (idx >= 0) {
      user.favoriteSubjects.splice(idx, 1);
    } else {
      user.favoriteSubjects.push(subject);
    }
    await user.save();
    res.json({ favoriteSubjects: user.favoriteSubjects });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
