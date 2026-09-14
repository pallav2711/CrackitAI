import mongoose from 'mongoose';
import Company from '../models/Company.js';
import CompanyQuestion from '../models/CompanyQuestion.js';
import dotenv from 'dotenv';

dotenv.config();

const companies = [
  {
    name: 'Google',
    logo: 'https://logo.clearbit.com/google.com',
    description: 'A multinational technology company that specializes in Internet-related services and products.',
    industry: 'Technology',
    headquarters: 'Mountain View, California',
    founded: 1998,
    employees: '156,000+',
    website: 'https://google.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Phone Screen',
        description: 'Initial screening with recruiter and basic technical questions',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Interview',
        description: 'Coding interview with Google engineer',
        duration: '45 minutes',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: '4-5 rounds covering coding, system design, and behavioral questions',
        duration: '4-5 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Focus on the user', 'Think 10x', 'Launch and iterate'],
      workEnvironment: 'Collaborative and innovative',
      benefits: ['Free meals', 'Health insurance', 'Stock options', '20% time'],
      diversity: 'Strong commitment to diversity and inclusion'
    },
    techStack: ['Java', 'Python', 'C++', 'Go', 'JavaScript', 'TypeScript'],
    skillsRequired: ['Data Structures', 'Algorithms', 'System Design', 'Problem Solving'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 350,
      averageRating: 4.5,
      popularityScore: 98
    }
  },
  {
    name: 'Meta',
    logo: 'https://logo.clearbit.com/meta.com',
    description: 'Social technology company connecting people through apps and technologies.',
    industry: 'Technology',
    headquarters: 'Menlo Park, California',
    founded: 2004,
    employees: '87,000+',
    website: 'https://meta.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Recruiter Call',
        description: 'Initial screening and role discussion',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Phone Screen',
        description: 'Coding interview over phone/video',
        duration: '45 minutes',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: 'Coding, system design, and behavioral rounds',
        duration: '4-5 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Move Fast', 'Be Bold', 'Focus on Impact', 'Be Open'],
      workEnvironment: 'Fast-paced and innovative',
      benefits: ['Free meals', 'Health insurance', 'Stock options', 'Wellness programs'],
      diversity: 'Commitment to building diverse teams'
    },
    techStack: ['React', 'PHP', 'Python', 'JavaScript', 'GraphQL', 'React Native'],
    skillsRequired: ['Frontend Development', 'Backend Development', 'System Design'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 320,
      averageRating: 4.2,
      popularityScore: 95
    }
  },
  {
    name: 'Amazon',
    logo: 'https://logo.clearbit.com/amazon.com',
    description: 'American multinational technology company focusing on e-commerce and cloud computing.',
    industry: 'E-commerce',
    headquarters: 'Seattle, Washington',
    founded: 1994,
    employees: '1,500,000+',
    website: 'https://amazon.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Online Assessment',
        description: 'Coding questions and work simulation',
        duration: '2 hours',
        type: 'Coding'
      },
      {
        round: 'Phone Interview',
        description: 'Technical and behavioral questions',
        duration: '1 hour',
        type: 'Technical'
      },
      {
        round: 'Onsite Loop',
        description: '5-6 rounds including bar raiser interview',
        duration: '5-6 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Customer Obsession', 'Ownership', 'Invent and Simplify', 'Learn and Be Curious'],
      workEnvironment: 'Fast-paced and customer-focused',
      benefits: ['Health insurance', 'Stock options', 'Career development'],
      diversity: 'Inclusive and diverse workplace'
    },
    techStack: ['Java', 'Python', 'C++', 'AWS', 'React', 'Node.js'],
    skillsRequired: ['Leadership Principles', 'System Design', 'Algorithms', 'AWS'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 400,
      averageRating: 4.3,
      popularityScore: 97
    }
  },
  {
    name: 'Apple',
    logo: 'https://logo.clearbit.com/apple.com',
    description: 'American multinational technology company designing consumer electronics.',
    industry: 'Technology',
    headquarters: 'Cupertino, California',
    founded: 1976,
    employees: '164,000+',
    website: 'https://apple.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Phone Screen',
        description: 'Technical discussion with hiring manager',
        duration: '30-45 minutes',
        type: 'Technical'
      },
      {
        round: 'Technical Interview',
        description: 'In-depth technical questions and coding',
        duration: '1 hour',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: 'Multiple rounds with different team members',
        duration: '4-6 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Innovation', 'Quality', 'Simplicity', 'Privacy'],
      workEnvironment: 'Design-focused and detail-oriented',
      benefits: ['Health insurance', 'Stock purchase plan', 'Product discounts'],
      diversity: 'Inclusive workplace for all'
    },
    techStack: ['Swift', 'Objective-C', 'C++', 'Python', 'JavaScript'],
    skillsRequired: ['iOS Development', 'macOS Development', 'Hardware Knowledge'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 280,
      averageRating: 4.6,
      popularityScore: 92
    }
  },
  {
    name: 'Microsoft',
    logo: 'https://logo.clearbit.com/microsoft.com',
    description: 'American multinational technology corporation producing computer software.',
    industry: 'Technology',
    headquarters: 'Redmond, Washington',
    founded: 1975,
    employees: '200,000+',
    website: 'https://microsoft.com',
    difficulty: 'Medium',
    interviewProcess: [
      {
        round: 'Recruiter Screen',
        description: 'Initial conversation about role and background',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Interview',
        description: 'Coding and technical discussion',
        duration: '1 hour',
        type: 'Technical'
      },
      {
        round: 'Final Loop',
        description: '4-5 interviews with team members',
        duration: '4-5 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Respect', 'Integrity', 'Accountability'],
      workEnvironment: 'Collaborative and inclusive',
      benefits: ['Health insurance', 'Stock purchase plan', 'Learning resources'],
      diversity: 'Strong diversity and inclusion programs'
    },
    techStack: ['C#', '.NET', 'Azure', 'TypeScript', 'React', 'SQL Server'],
    skillsRequired: ['Object-Oriented Programming', 'Cloud Computing', 'Problem Solving'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 300,
      averageRating: 4.4,
      popularityScore: 90
    }
  },
  {
    name: 'Tesla',
    logo: 'https://logo.clearbit.com/tesla.com',
    description: 'Electric vehicle and clean energy company.',
    industry: 'Automotive',
    headquarters: 'Austin, Texas',
    founded: 2003,
    employees: '127,000+',
    website: 'https://tesla.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Phone Screen',
        description: 'Technical screening with focus on problem-solving',
        duration: '45 minutes',
        type: 'Technical'
      },
      {
        round: 'Technical Assessment',
        description: 'Hands-on technical challenge',
        duration: '2-3 hours',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: 'Multiple rounds including technical and culture fit',
        duration: '4-6 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Innovation', 'Sustainability', 'Excellence', 'Integrity'],
      workEnvironment: 'Fast-paced, mission-driven, and innovative',
      benefits: ['Health insurance', 'Stock options', 'Employee discounts'],
      diversity: 'Committed to diversity and equal opportunity'
    },
    techStack: ['Python', 'C++', 'JavaScript', 'React', 'Django', 'TensorFlow'],
    skillsRequired: ['Embedded Systems', 'AI/ML', 'Robotics', 'Software Development'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 180,
      averageRating: 4.3,
      popularityScore: 88
    }
  }
];

const sampleQuestions = [
  {
    question: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
    type: 'Coding',
    category: 'Data Structures',
    difficulty: 'Easy',
    estimatedTime: 30,
    answer: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    explanation: 'Use a hash map to store numbers and their indices.',
    hints: ['Think about using a hash map', 'What is the complement of each number?'],
    tags: ['Array', 'Hash Table', 'Two Pointers'],
    source: 'LeetCode',
    frequency: 'Very High',
    interviewRound: 'Technical Round 1'
  },
  {
    question: 'Tell me about a time when you had to work with a difficult team member.',
    type: 'Behavioral',
    category: 'Teamwork',
    difficulty: 'Medium',
    estimatedTime: 15,
    answer: 'Use the STAR method: Situation, Task, Action, Result.',
    explanation: 'This question assesses your interpersonal skills.',
    hints: ['Use the STAR method', 'Focus on positive outcomes'],
    tags: ['Teamwork', 'Conflict Resolution', 'Communication'],
    source: 'Interview Experience',
    frequency: 'High',
    interviewRound: 'Behavioral'
  },
  {
    question: 'Design a URL shortener like bit.ly',
    type: 'System Design',
    category: 'System Design',
    difficulty: 'Hard',
    estimatedTime: 45,
    answer: 'Key components: URL encoding/decoding service, database, caching layer, load balancer.',
    explanation: 'Focus on scalability, database design, and caching strategies.',
    hints: ['Think about encoding algorithms', 'Consider caching strategies'],
    tags: ['System Design', 'Scalability', 'Database Design'],
    source: 'Official',
    frequency: 'High',
    interviewRound: 'System Design'
  }
];

const seedCompanies = async () => {
  try {
    console.log('🏢 Starting company seeding process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Check if companies already exist
    const existingCompanies = await Company.countDocuments();
    if (existingCompanies > 0) {
      console.log(`📊 Found ${existingCompanies} existing companies. Clearing and reseeding...`);
      await Company.deleteMany({});
      await CompanyQuestion.deleteMany({});
    }

    console.log(`📝 Inserting ${companies.length} companies...`);

    let successCount = 0;
    let errorCount = 0;

    for (const companyData of companies) {
      try {
        // Generate slug from name
        const slug = companyData.name.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        const companyWithSlug = {
          ...companyData,
          slug
        };

        const company = new Company(companyWithSlug);
        await company.save();
        successCount++;
        console.log(`✅ Created: ${company.name} (${company.industry}) - slug: ${company.slug}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to create: ${companyData.name} - ${error.message}`);
      }
    }

    // Add sample questions for each company
    console.log('\n📝 Adding sample questions...');
    const savedCompanies = await Company.find({});
    let totalQuestions = 0;

    for (const company of savedCompanies) {
      const companyQuestions = sampleQuestions.map(q => ({
        ...q,
        companyId: company._id,
        createdBy: null
      }));

      try {
        await CompanyQuestion.insertMany(companyQuestions);
        totalQuestions += companyQuestions.length;

        // Update company stats
        company.stats.totalQuestions = companyQuestions.length;
        await company.save();
      } catch (error) {
        console.error(`❌ Failed to add questions for ${company.name}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`📊 Total companies: ${successCount}`);
    console.log(`📝 Total questions: ${totalQuestions}`);
    console.log(`❌ Failed: ${errorCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Company seeding failed:', error);
    process.exit(1);
  }
};

seedCompanies();