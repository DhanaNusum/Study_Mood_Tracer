const express = require('express');
const mongoose = require('mongoose');
const StudyLog = require('../models/StudyLog');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all study logs for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const logs = await StudyLog.find({ user_id: userId })
      .select('_id subject emotions study_time duration notes tags createdAt')
      .sort({ study_time: -1 });

    const formattedLogs = logs.map(log => ({
      id: log._id,
      subject: log.subject,
      emotions: log.emotions || [],
      study_time: log.study_time,
      duration: log.duration,
      notes: log.notes,
      tags: log.tags || [],
      created_at: log.createdAt,
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching study logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new study log
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, emotions, study_time, duration, notes, tags } = req.body;

    if (!subject || !emotions || !Array.isArray(emotions) || emotions.length === 0) {
      return res.status(400).json({ error: 'Subject and at least one emotion are required' });
    }

    // Validate emotions
    const validEmotions = ['Happy', 'Tired', 'Stressed', 'Excited', 'Anxious', 'Focused', 'Bored', 'Confident', 'Frustrated', 'Calm'];
    for (const emotionData of emotions) {
      if (!emotionData.emotion || !validEmotions.includes(emotionData.emotion)) {
        return res.status(400).json({ error: `Invalid emotion: ${emotionData.emotion}. Must be one of: ${validEmotions.join(', ')}` });
      }
      if (typeof emotionData.score !== 'number' || emotionData.score < 0 || emotionData.score > 10) {
        return res.status(400).json({ error: `Invalid score for ${emotionData.emotion}. Must be between 0 and 10` });
      }
    }

    const studyLog = new StudyLog({
      user_id: userId,
      subject,
      emotions,
      study_time: study_time ? new Date(study_time) : new Date(),
      duration: duration || undefined,
      notes: notes || undefined,
      tags: Array.isArray(tags) ? tags.filter(t => t && String(t).trim()) : [],
    });

    await studyLog.save();

    res.status(201).json({
      message: 'Study log added successfully',
      log: {
        id: studyLog._id,
        subject: studyLog.subject,
        emotions: studyLog.emotions,
        study_time: studyLog.study_time,
        duration: studyLog.duration,
        notes: studyLog.notes,
        tags: studyLog.tags || [],
      }
    });
  } catch (error) {
    console.error('Error adding study log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics data
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Total study sessions
    const totalSessions = await StudyLog.countDocuments({ user_id: userId });

    // Subject-wise emotion distribution
    const subjectEmotionsAggregation = await StudyLog.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$emotions' },
      {
        $group: {
          _id: { subject: '$subject', emotion: '$emotions.emotion' },
          avgScore: { $avg: '$emotions.score' },
          count: { $sum: 1 },
          totalScore: { $sum: '$emotions.score' }
        }
      },
      {
        $project: {
          _id: 0,
          subject: '$_id.subject',
          emotion: '$_id.emotion',
          avgScore: { $round: ['$avgScore', 1] },
          count: 1,
          totalScore: 1
        }
      },
      { $sort: { subject: 1, emotion: 1 } }
    ]);

    // Weekly trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTrendAggregation = await StudyLog.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          study_time: { $gte: sevenDaysAgo }
        }
      },
      { $unwind: '$emotions' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$study_time' } },
            emotion: '$emotions.emotion'
          },
          avgScore: { $avg: '$emotions.score' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          emotion: '$_id.emotion',
          avgScore: { $round: ['$avgScore', 1] },
          count: 1
        }
      },
      { $sort: { date: 1, emotion: 1 } }
    ]);

    // Time-based analysis (hour of day)
    const timeAnalysisAggregation = await StudyLog.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$emotions' },
      {
        $group: {
          _id: {
            hour: { $hour: '$study_time' },
            emotion: '$emotions.emotion'
          },
          avgScore: { $avg: '$emotions.score' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          hour: '$_id.hour',
          emotion: '$_id.emotion',
          avgScore: { $round: ['$avgScore', 1] },
          count: 1
        }
      },
      { $sort: { hour: 1, emotion: 1 } }
    ]);

    // Calculate study streak (consecutive days with at least one log)
    const streakResult = await StudyLog.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$study_time' } }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    const uniqueDates = streakResult.map(r => r._id);
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(Date.now() - i * dayMs).toISOString().slice(0, 10);
      if (uniqueDates[i] === expected) {
        streak++;
      } else {
        break;
      }
    }

    res.json({
      totalSessions,
      subjectEmotions: subjectEmotionsAggregation,
      weeklyTrend: weeklyTrendAggregation,
      timeAnalysis: timeAnalysisAggregation,
      streak
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a study log
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const logId = req.params.id;

    const studyLog = await StudyLog.findOneAndDelete({
      _id: logId,
      user_id: userId
    });

    if (!studyLog) {
      return res.status(404).json({ error: 'Study log not found' });
    }

    res.json({ message: 'Study log deleted successfully' });
  } catch (error) {
    console.error('Error deleting study log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
