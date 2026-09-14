import mongoose from 'mongoose';
import Company from '../models/Company.js';
import CompanyQuestion from '../models/CompanyQuestion.js';
import dotenv from 'dotenv';

dotenv.config();

const additionalCompanies = [
  {
    name: 'Netflix',
    logo: 'https://logo.clearbit.com/netflix.com',
    description: 'American streaming entertainment service with TV series and documentaries.',
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
      },
      {
        round: 'Technical Interview',
        description: 'Technical and behavioral questions',
        duration: '1 hour',
        type: 'Technical'
      },
      {
        round: 'Panel Interviews',
        description: 'Multiple interviews with team members',
        duration: '3-4 hours',
        type: 'Technical'
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
  },
  {
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
  },
  {
    name: 'Uber',
    logo: 'https://logo.clearbit.com/uber.com',
    description: 'Technology platform connecting drivers and riders.',
    industry: 'Technology',
    headquarters: 'San Francisco, California',
    founded: 2009,
    employees: '32,000+',
    website: 'https://uber.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Phone Screen',
        description: 'Technical screening with coding problems',
        duration: '45 minutes',
        type: 'Technical'
      },
      {
        round: 'Technical Interviews',
        description: 'Multiple technical rounds',
        duration: '2-3 hours',
        type: 'Technical'
      },
      {
        round: 'Behavioral Interview',
        description: 'Culture fit assessment',
        duration: '45 minutes',
        type: 'HR'
      }
    ],
    culture: {
      values: ['We build globally', 'We are customer obsessed', 'We celebrate differences'],
      workEnvironment: 'Fast-paced, data-driven, and globally minded',
      benefits: ['Health insurance', 'Equity', 'Commuter benefits'],
      diversity: 'Building diverse and inclusive teams worldwide'
    },
    techStack: ['Go', 'Java', 'Python', 'React', 'Node.js', 'Kubernetes'],
    skillsRequired: ['Microservices', 'Distributed Systems', 'Mobile Development'],
    experienceLevel: 'All Levels',
    isFeatured: false,
    stats: {
      totalQuestions: 200,
      averageRating: 4.0,
      popularityScore: 80
    }
  },
  {
    name: 'Airbnb',
    logo: 'https://logo.clearbit.com/airbnb.com',
    description: 'Online marketplace for short-term homestays and experiences.',
    industry: 'Technology',
    headquarters: 'San Francisco, California',
    founded: 2008,
    employees: '6,800+',
    website: 'https://airbnb.com',
    difficulty: 'Medium',
    interviewProcess: [
      {
        round: 'Recruiter Screen',
        description: 'Background discussion and culture alignment',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Phone Screen',
        description: 'Coding interview with algorithmic problems',
        duration: '45 minutes',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: 'Technical skills and core values assessment',
        duration: '4-5 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Champion the Mission', 'Be a Host', 'Embrace the Adventure'],
      workEnvironment: 'Creative, inclusive, and community-focused',
      benefits: ['Health insurance', 'Equity', 'Travel credits', 'Learning stipend'],
      diversity: 'Committed to belonging and inclusive environment'
    },
    techStack: ['React', 'Ruby on Rails', 'Java', 'JavaScript', 'Python'],
    skillsRequired: ['Full-Stack Development', 'System Design', 'Mobile Development'],
    experienceLevel: 'All Levels',
    isFeatured: false,
    stats: {
      totalQuestions: 140,
      averageRating: 4.2,
      popularityScore: 78
    }
  },
  {
    name: 'Goldman Sachs',
    logo: 'https://logo.clearbit.com/goldmansachs.com',
    description: 'Leading global investment banking and securities firm.',
    industry: 'Finance',
    headquarters: 'New York, New York',
    founded: 1869,
    employees: '49,000+',
    website: 'https://goldmansachs.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'HireVue Interview',
        description: 'Video interview with behavioral questions',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Assessment',
        description: 'Coding challenges and financial problems',
        duration: '2 hours',
        type: 'Technical'
      },
      {
        round: 'Super Day',
        description: 'Multiple rounds with different teams',
        duration: '6-8 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Client service', 'Excellence', 'Integrity', 'Innovation'],
      workEnvironment: 'Fast-paced, analytical, and results-driven',
      benefits: ['Health insurance', 'Bonus structure', 'Professional development'],
      diversity: 'Committed to advancing diversity in finance'
    },
    techStack: ['Java', 'Python', 'C++', 'JavaScript', 'React', 'Spring'],
    skillsRequired: ['Financial Systems', 'Algorithms', 'Risk Management'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 250,
      averageRating: 4.1,
      popularityScore: 85
    }
  },
  {
    name: 'McKinsey & Company',
    logo: 'https://logo.clearbit.com/mckinsey.com',
    description: 'Global management consulting firm.',
    industry: 'Consulting',
    headquarters: 'New York, New York',
    founded: 1926,
    employees: '38,000+',
    website: 'https://mckinsey.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Resume Screen',
        description: 'Initial screening based on background',
        duration: 'N/A',
        type: 'HR'
      },
      {
        round: 'First Round',
        description: 'Case interviews and personal experience',
        duration: '2-3 hours',
        type: 'Case Study'
      },
      {
        round: 'Final Round',
        description: 'Multiple case interviews with partners',
        duration: '4-5 hours',
        type: 'Case Study'
      }
    ],
    culture: {
      values: ['Client impact', 'Professional development', 'Inclusive environment'],
      workEnvironment: 'Analytical, collaborative, and client-focused',
      benefits: ['Health insurance', 'Learning opportunities', 'Global mobility'],
      diversity: 'Committed to building diverse teams'
    },
    techStack: ['Excel', 'PowerPoint', 'Tableau', 'Python', 'R', 'SQL'],
    skillsRequired: ['Problem Solving', 'Business Analysis', 'Strategy', 'Communication'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 100,
      averageRating: 4.4,
      popularityScore: 88
    }
  }
];

const seedMoreCompanies = async () => {
  try {
    console.log('🏢 Adding more companies to the database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    console.log(`📝 Inserting ${additionalCompanies.length} additional companies...`);

    let successCount = 0;
    let errorCount = 0;

    for (const companyData of additionalCompanies) {
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

    // Get total companies now
    const totalCompanies = await Company.countDocuments();

    console.log(`\n🎉 Additional companies added successfully!`);
    console.log(`📊 New companies added: ${successCount}`);
    console.log(`📊 Total companies in database: ${totalCompanies}`);
    console.log(`❌ Failed: ${errorCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Additional company seeding failed:', error);
    process.exit(1);
  }
};

seedMoreCompanies();