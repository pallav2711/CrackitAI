import express from 'express';
import Company from '../models/Company.js';
import CompanyQuestion from '../models/CompanyQuestion.js';

const router = express.Router();

// Simple companies data that we know works
const simpleCompanies = [
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
      }
    ],
    culture: {
      values: ['Move Fast', 'Be Bold', 'Focus on Impact', 'Be Open'],
      workEnvironment: 'Fast-paced and innovative',
      benefits: ['Free meals', 'Health insurance', 'Stock options'],
      diversity: 'Commitment to building diverse teams'
    },
    techStack: ['React', 'PHP', 'Python', 'JavaScript', 'GraphQL'],
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
      }
    ],
    culture: {
      values: ['Customer Obsession', 'Ownership', 'Invent and Simplify'],
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
    name: 'Netflix',
    logo: 'https://logo.clearbit.com/netflix.com',
    description: 'American streaming entertainment service.',
    industry: 'Technology',
    headquarters: 'Los Gatos, California',
    founded: 1997,
    employees: '12,800+',
    website: 'https://netflix.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Recruiter Screen',
        description: 'Culture fit and role discussion',
        duration: '30 minutes',
        type: 'HR'
      }
    ],
    culture: {
      values: ['Freedom and Responsibility', 'High Performance', 'Inclusion'],
      workEnvironment: 'High-performance culture with flexibility',
      benefits: ['Unlimited PTO', 'Health insurance', 'Stock options'],
      diversity: 'Inclusive storytelling and workplace'
    },
    techStack: ['Java', 'Python', 'JavaScript', 'React', 'AWS', 'Microservices'],
    skillsRequired: ['Distributed Systems', 'Streaming Technology', 'Data Engineering'],
    experienceLevel: 'Mid Level',
    isFeatured: true,
    stats: {
      totalQuestions: 220,
      averageRating: 4.1,
      popularityScore: 85
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
    answer: 'Use a hash map to store numbers and their indices.',
    explanation: 'Use a hash map to store numbers and their indices.',
    hints: ['Think about using a hash map'],
    tags: ['Array', 'Hash Table'],
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
    hints: ['Use the STAR method'],
    tags: ['Teamwork', 'Communication'],
    source: 'Interview Experience',
    frequency: 'High',
    interviewRound: 'Behavioral'
  }
];

// Simple seed endpoint
router.post('/seed-simple', async (req, res) => {
  try {
    console.log('🏢 Starting simple company seeding...');
    
    // Clear existing data
    await Company.deleteMany({});
    await CompanyQuestion.deleteMany({});
    console.log('🗑️ Cleared existing data');

    let successCount = 0;
    let errorCount = 0;

    // Insert companies
    for (const companyData of simpleCompanies) {
      try {
        // Generate slug
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
        console.log(`✅ Created: ${company.name}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed: ${companyData.name} - ${error.message}`);
      }
    }

    // Add sample questions
    const companies = await Company.find({});
    let totalQuestions = 0;

    for (const company of companies) {
      const companyQuestions = sampleQuestions.map(q => ({
        ...q,
        companyId: company._id,
        createdBy: null
      }));

      try {
        await CompanyQuestion.insertMany(companyQuestions);
        totalQuestions += companyQuestions.length;
        
        company.stats.totalQuestions = companyQuestions.length;
        await company.save();
      } catch (error) {
        console.error(`❌ Failed to add questions for ${company.name}`);
      }
    }

    res.json({
      success: true,
      message: 'Companies seeded successfully',
      data: {
        companies: successCount,
        questions: totalQuestions,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Check database status
router.get('/status', async (req, res) => {
  try {
    const [companyCount, questionCount] = await Promise.all([
      Company.countDocuments(),
      CompanyQuestion.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        companies: companyCount,
        questions: questionCount,
        initialized: companyCount > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;