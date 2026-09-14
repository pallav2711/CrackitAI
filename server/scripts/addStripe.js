import mongoose from 'mongoose';
import Company from '../models/Company.js';
import dotenv from 'dotenv';

dotenv.config();

const addStripe = async () => {
  try {
    console.log('🏢 Adding Stripe to the database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    const stripeData = {
      name: 'Stripe',
      logo: 'https://logo.clearbit.com/stripe.com',
      description: 'Financial infrastructure platform for businesses.',
      industry: 'Finance',
      headquarters: 'San Francisco, California',
      founded: 2010,
      employees: '8,000+',
      website: 'https://stripe.com',
      difficulty: 'Hard',
      interviewProcess: [
        {
          round: 'Recruiter Screen',
          description: 'Initial conversation about background',
          duration: '30 minutes',
          type: 'HR'
        },
        {
          round: 'Technical Phone Screen',
          description: 'Coding interview with problem-solving',
          duration: '1 hour',
          type: 'Technical'
        },
        {
          round: 'Onsite Interviews',
          description: 'Technical interviews and system design',
          duration: '4-5 hours',
          type: 'Technical'
        }
      ],
      culture: {
        values: ['Move with urgency', 'Think rigorously', 'Trust and amplify'],
        workEnvironment: 'Collaborative, analytical, and growth-focused',
        benefits: ['Health insurance', 'Equity', 'Learning stipend', 'Flexible PTO'],
        diversity: 'Building inclusive teams that reflect global users'
      },
      techStack: ['Ruby', 'JavaScript', 'Go', 'Python', 'React', 'Scala'],
      skillsRequired: ['Payment Systems', 'APIs', 'Distributed Systems', 'Security'],
      experienceLevel: 'All Levels',
      isFeatured: true,
      stats: {
        totalQuestions: 160,
        averageRating: 4.5,
        popularityScore: 82
      }
    };

    // Generate slug
    const slug = stripeData.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const companyWithSlug = {
      ...stripeData,
      slug
    };

    const company = new Company(companyWithSlug);
    await company.save();
    
    console.log(`✅ Created: ${company.name} (${company.industry}) - slug: ${company.slug}`);

    // Get total companies now
    const totalCompanies = await Company.countDocuments();
    console.log(`📊 Total companies in database: ${totalCompanies}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add Stripe:', error);
    process.exit(1);
  }
};

addStripe();