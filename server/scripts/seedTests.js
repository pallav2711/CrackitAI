import mongoose from 'mongoose';
import Test from '../models/Test.js';
import { aptitudeTests1 } from '../testData/aptitude1.js';
import { logicalTests1 } from '../testData/logical1.js';
import { technicalTests1 } from '../testData/technical1.js';
import { verbalTests1 } from '../testData/verbal1.js';
import { getFallbackTestQuestions } from '../services/aiTestService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const seedTests = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing tests (optional - comment out if you want to keep existing)
    await Test.deleteMany({});
    console.log('🗑️  Cleared existing tests');

    // Create dynamic AI tests (these generate new questions each time)
    const dynamicTests = [
      {
        title: "AI-Generated Aptitude Challenge",
        description: "Dynamic quantitative aptitude test with fresh questions every attempt",
        category: "aptitude",
        difficulty: "medium",
        duration: 15,
        passingScore: 60,
        isActive: true,
        createdBy: "ai",
        aiGenerated: true,
        isDynamic: true,
        questionCount: 10,
        questions: [] // Dynamic tests don't store questions
      },
      {
        title: "AI Technical Assessment",
        description: "Adaptive technical test covering programming and system design",
        category: "technical",
        difficulty: "hard",
        duration: 20,
        passingScore: 70,
        isActive: true,
        createdBy: "ai",
        aiGenerated: true,
        isDynamic: true,
        questionCount: 12,
        questions: []
      },
      {
        title: "AI Logical Reasoning Test",
        description: "Dynamic logical reasoning with pattern recognition and critical thinking",
        category: "logical",
        difficulty: "medium",
        duration: 18,
        passingScore: 65,
        isActive: true,
        createdBy: "ai",
        aiGenerated: true,
        isDynamic: true,
        questionCount: 10,
        questions: []
      },
      {
        title: "AI Verbal Ability Assessment",
        description: "Comprehensive verbal test with reading comprehension and grammar",
        category: "verbal",
        difficulty: "medium",
        duration: 20,
        passingScore: 60,
        isActive: true,
        createdBy: "ai",
        aiGenerated: true,
        isDynamic: true,
        questionCount: 15,
        questions: []
      },
      {
        title: "Quick Coding Challenge",
        description: "Fast-paced coding questions for algorithm and data structure knowledge",
        category: "coding",
        difficulty: "medium",
        duration: 15,
        passingScore: 70,
        isActive: true,
        createdBy: "system",
        aiGenerated: false,
        isDynamic: false,
        questions: getFallbackTestQuestions('coding', 'medium', 10)
      }
    ];

    // Combine all test data
    const allTests = [
      ...aptitudeTests1,
      ...logicalTests1,
      ...technicalTests1,
      ...verbalTests1,
      ...dynamicTests
    ];

    console.log(`📝 Seeding ${allTests.length} tests (${dynamicTests.length} dynamic AI tests)...`);

    // Insert tests one by one to handle any validation errors
    let successCount = 0;
    let errorCount = 0;

    for (const testData of allTests) {
      try {
        // Add some default fields if missing, but don't override existing values
        const testToInsert = {
          isActive: true,
          createdBy: 'system',
          aiGenerated: false,
          isDynamic: false,
          ...testData // This should come after defaults to override them
        };

        const test = new Test(testToInsert);
        await test.save();
        successCount++;
        console.log(`✅ Created: ${test.title} (${test.category}) - ${testData.isDynamic ? 'Dynamic AI' : 'Static'}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to create test: ${testData.title}`, error.message);
      }
    }

    console.log(`\n🎉 Seeding completed!`);
    console.log(`✅ Successfully created: ${successCount} tests`);
    console.log(`❌ Failed: ${errorCount} tests`);

    // Show summary by category
    const testCounts = await Test.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Tests by category:');
    testCounts.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count} tests`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding
seedTests();