import mongoose from 'mongoose';
import Company from '../models/Company.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkCompanies = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Get all companies
    const companies = await Company.find({});
    console.log(`\n📊 Found ${companies.length} companies in database:`);

    if (companies.length === 0) {
      console.log('❌ No companies found in database!');
      console.log('💡 You need to seed companies first.');
      console.log('   Run: cd server && node utils/seedCompanies.js');
    } else {
      // Show first few companies
      console.log('\n📋 Sample companies:');
      companies.slice(0, 5).forEach(company => {
        console.log(`  🏢 ${company.name} (${company.industry}) - ${company.difficulty}`);
        console.log(`     Active: ${company.isActive}, Questions: ${company.stats?.totalQuestions || 0}`);
      });

      // Group by industry
      const industries = {};
      companies.forEach(company => {
        if (!industries[company.industry]) {
          industries[company.industry] = 0;
        }
        industries[company.industry]++;
      });

      console.log('\n🏭 Companies by industry:');
      Object.entries(industries).forEach(([industry, count]) => {
        console.log(`  ${industry}: ${count} companies`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
};

// Run the check
checkCompanies();