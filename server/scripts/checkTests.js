import mongoose from 'mongoose';
import Test from '../models/Test.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkTests = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Get all tests
    const tests = await Test.find({});
    console.log(`\n📊 Found ${tests.length} tests in database:`);

    // Group by category and type
    const categories = {};
    tests.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { static: 0, dynamic: 0, total: 0 };
      }
      categories[test.category].total++;
      if (test.isDynamic) {
        categories[test.category].dynamic++;
      } else {
        categories[test.category].static++;
      }
    });

    console.log('\n📋 Tests by category:');
    Object.entries(categories).forEach(([category, counts]) => {
      console.log(`  ${category}: ${counts.total} total (${counts.static} static, ${counts.dynamic} dynamic)`);
    });

    // Show dynamic tests specifically
    const dynamicTests = tests.filter(t => t.isDynamic);
    console.log(`\n🎲 Dynamic AI Tests (${dynamicTests.length}):`);
    dynamicTests.forEach(test => {
      console.log(`  ✨ ${test.title} (${test.category}) - ${test.difficulty}`);
      console.log(`     Questions: ${test.questions.length}, Duration: ${test.duration}min`);
      console.log(`     Active: ${test.isActive}, AI Generated: ${test.aiGenerated}`);
    });

    // Show first few regular tests
    const staticTests = tests.filter(t => !t.isDynamic).slice(0, 3);
    console.log(`\n📝 Sample Static Tests:`);
    staticTests.forEach(test => {
      console.log(`  📄 ${test.title} (${test.category}) - ${test.questions.length} questions`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
};

// Run the check
checkTests();