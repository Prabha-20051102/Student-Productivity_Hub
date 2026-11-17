/**
 * Database Configuration
 * ----------------------
 * Connects Express backend to MongoDB using Mongoose.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_productivity_hub';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Fast fail in 5s if MongoDB service is not started
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Notice: ${error.message}`);
    console.log(`💡 Note: Ensure your local MongoDB service is running (e.g. 'net start MongoDB') or configure MongoDB Atlas cloud URI in .env`);
  }
};

module.exports = connectDB;
