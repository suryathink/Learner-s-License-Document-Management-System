import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';
import { connectDB } from './database';

// Load environment variables
dotenv.config();

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne();
    
    if (existingAdmin) {
      console.log('✅ Admin already exists, skipping seed');
      process.exit(0);
    }

    // Create default admin
    const defaultAdmin = new Admin({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@learnerlicense.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'super_admin'
    });

    await defaultAdmin.save();
    console.log('✅ Default admin created successfully');
    console.log(`📧 Email: ${defaultAdmin.email}`);
    console.log(`👤 Username: ${defaultAdmin.username}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

seedDatabase();