import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI!;
    await mongoose.connect(mongoURI);
    
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};