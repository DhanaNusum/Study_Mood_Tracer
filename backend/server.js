const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const studyLogRoutes = require('./routes/studyLogs');
const userRoutes = require('./routes/users');
const studyGroupRoutes = require('./routes/studyGroups');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/study-logs', studyLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/study-groups', studyGroupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Study Mood Tracker API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
