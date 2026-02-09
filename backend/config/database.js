const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study_mood_tracker';
    
    // Log which connection string is being used (without password)
    if (mongoURI.includes('mongodb+srv://')) {
      const maskedURI = mongoURI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://***:***@');
      console.log('Connecting to MongoDB Atlas:', maskedURI);
    } else {
      console.log('Connecting to MongoDB:', mongoURI);
    }
    
    await mongoose.connect(mongoURI);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Make sure your .env file exists and MONGODB_URI is set correctly');
    process.exit(1);
  }
};

module.exports = connectDB;
