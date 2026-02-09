const express = require('express');
const mongoose = require('mongoose');
const StudyGroup = require('../models/StudyGroup');
const StudyLog = require('../models/StudyLog');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a study group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = new StudyGroup({
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: userId,
      members: [{ user: userId }]
    });
    await group.save();

    const populated = await StudyGroup.findById(group._id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my study groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const groups = await StudyGroup.find({
      'members.user': userId
    })
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group by ID with member progress
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const group = await StudyGroup.findOne({
      _id: id,
      'members.user': userId
    })
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const memberIds = group.members.map(m => m.user._id);
    const progress = await StudyLog.aggregate([
      {
        $match: {
          user_id: { $in: memberIds.map(id => new mongoose.Types.ObjectId(id)) },
          study_time: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$user_id',
          totalSessions: { $sum: 1 },
          totalMinutes: { $sum: { $ifNull: ['$duration', 0] } }
        }
      }
    ]);

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p._id.toString()] = { totalSessions: p.totalSessions, totalMinutes: p.totalMinutes };
    });

    const membersWithProgress = group.members.map(m => ({
      ...m.toObject(),
      progress: progressMap[m.user._id.toString()] || { totalSessions: 0, totalMinutes: 0 }
    }));

    res.json({ ...group.toObject(), members: membersWithProgress });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Invite user to group by email
router.post('/:id/invite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user.userId;

    const group = await StudyGroup.findOne({
      _id: id,
      'members.user': userId
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const inviteEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: inviteEmail });
    if (!user) {
      return res.status(404).json({ error: 'No user found with this email' });
    }
    if (group.members.some(m => m.user.toString() === user._id.toString())) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    group.members.push({ user: user._id });
    group.invitations = group.invitations || [];
    group.invitations.push({ email: inviteEmail, invitedBy: userId });
    await group.save();

    const populated = await StudyGroup.findById(group._id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');
    res.json(populated);
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave group
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const group = await StudyGroup.findOne({ _id: id });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    group.members = group.members.filter(m => m.user.toString() !== userId);
    if (group.members.length === 0) {
      await StudyGroup.findByIdAndDelete(id);
      return res.json({ message: 'Group deleted (no members left)' });
    }
    if (group.createdBy.toString() === userId) {
      group.createdBy = group.members[0].user;
    }
    await group.save();
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
