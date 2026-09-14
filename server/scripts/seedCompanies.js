import mongoose from 'mongoose';
import { seedCompanies } from '../utils/seedCompanies.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const runSeed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Run the seeding
    await seedCompanies();
    
    console.log('🎉 Company seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding
runSeed();