import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedCompanies } from '../utils/seedCompanies.js';
import { generateCompleteTest } from '../services/aiTestService.js';
import Test from '../models/Test.js';

dotenv.config();

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing CrackIt AI Database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if data already exists
    const existingCompanies = await mongoose.model('Company').countDocuments();
    const existingTests = await Test.countDocuments();
    
    if (existingCompanies > 0 && existingTests > 0) {
      console.log('📊 Database already has data:');
      console.log(`   - Companies: ${existingCompanies}`);
      console.log(`   - Tests: ${existingTests}`);
      console.log('✅ Database initialization complete!');
      return;
    }
    
    // Seed companies if none exist
    if (existingCompanies === 0) {
      console.log('🏢 Seeding companies...');
      try {
        await seedCompanies();
        console.log('✅ Companies seeded successfully');
      } catch (error) {
        console.error('❌ Company seeding failed:', error);
        console.log('⚠️  Continuing with test generation...');
      }
    }
    
    // Generate AI tests if none exist
    if (existingTests === 0) {
      console.log('🧠 Generating AI-powered tests...');
      
      const testCategories = [
        { category: 'aptitude', difficulty: 'medium', questionCount: 10 },
        { category: 'technical', difficulty: 'medium', questionCount: 15 },
        { category: 'logical', difficulty: 'medium', questionCount: 12 },
        { category: 'verbal', difficulty: 'medium', questionCount: 10 },
        { category: 'coding', difficulty: 'medium', questionCount: 8 }
      ];
      
      for (const testConfig of testCategories) {
        try {
          console.log(`   Generating ${testConfig.category} test...`);
          
          const testData = await generateCompleteTest(testConfig);
          const test = new Test(testData);
          await test.save();
          
          console.log(`   ✅ ${testConfig.category} test created with ${testData.questions.length} questions`);
        } catch (error) {
          console.log(`   ⚠️  AI generation failed for ${testConfig.category}, using fallback`);
          
          // Fallback to manual test creation
          const { getFallbackTestQuestions } = await import('../services/aiTestService.js');
          const questions = getFallbackTestQuestions(
            testConfig.category,
            testConfig.difficulty,
            testConfig.questionCount
          );
          
          const testData = {
            title: `${testConfig.category.charAt(0).toUpperCase() + testConfig.category.slice(1)} Test`,
            description: `Test your ${testConfig.category} skills`,
            category: testConfig.category,
            difficulty: testConfig.difficulty,
            duration: Math.ceil(questions.length * 1.5),
            questions,
            passingScore: 60,
            createdBy: 'system',
            aiGenerated: false
          };
          
          const test = new Test(testData);
          await test.save();
          
          console.log(`   ✅ ${testConfig.category} fallback test created with ${questions.length} questions`);
        }
      }
      
      console.log('✅ Tests generated successfully');
    }
    
    // Final summary
    const finalCompanies = await mongoose.model('Company').countDocuments();
    const finalTests = await Test.countDocuments();
    
    console.log('🎉 Database initialization complete!');
    console.log(`📊 Final counts:`);
    console.log(`   - Companies: ${finalCompanies}`);
    console.log(`   - Tests: ${finalTests}`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase;