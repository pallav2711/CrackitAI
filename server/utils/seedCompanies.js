
import Company from '../models/Company.js';
import CompanyQuestion from '../models/CompanyQuestion.js';

const sampleCompanies = [
  // FAANG + Top Tech Companies
  {
    name: 'Google',
    slug: 'google',
    logo: 'https://logo.clearbit.com/google.com',
    description: 'A multinational technology company that specializes in Internet-related services and products, including search, cloud computing, and advertising.',
    industry: 'Technology',
    headquarters: 'Mountain View, California',
    founded: 1998,
    employees: '156,000+',
    website: 'https://google.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Phone Screen',
        description: 'Initial screening with recruiter covering background and basic technical questions',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Phone Interview',
        description: 'Coding interview with Google engineer focusing on algorithms and data structures',
        duration: '45 minutes',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: '4-5 rounds covering coding, system design, and Googleyness & Leadership',
        duration: '4-5 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Focus on the user', 'Think 10x', 'Launch and iterate', 'Take risks'],
      workEnvironment: 'Collaborative, innovative, and data-driven',
      benefits: ['Free meals', 'Health insurance', 'Stock options', '20% time', 'On-site facilities'],
      diversity: 'Strong commitment to diversity, equity, and inclusion with various employee resource groups'
    },
    techStack: ['Java', 'Python', 'C++', 'Go', 'JavaScript', 'TypeScript', 'Kotlin', 'TensorFlow'],
    skillsRequired: ['Data Structures', 'Algorithms', 'System Design', 'Problem Solving', 'Machine Learning'],
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
    slug: 'meta',
    logo: 'https://logo.clearbit.com/meta.com',
    description: 'Social technology company connecting people through apps and technologies including Facebook, Instagram, WhatsApp, and Reality Labs.',
    industry: 'Technology',
    headquarters: 'Menlo Park, California',
    founded: 2004,
    employees: '87,000+',
    website: 'https://meta.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Recruiter Call',
        description: 'Initial screening and role discussion with focus on cultural fit',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Phone Screen',
        description: 'Coding interview over phone/video with live coding',
        duration: '45 minutes',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: 'Coding, system design, and behavioral rounds focusing on Meta values',
        duration: '4-5 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Move Fast', 'Be Bold', 'Focus on Impact', 'Be Open', 'Build Social Value'],
      workEnvironment: 'Fast-paced, innovative, and impact-focused',
      benefits: ['Free meals', 'Health insurance', 'Stock options', 'Wellness programs', 'Learning stipend'],
      diversity: 'Commitment to building diverse teams and inclusive products'
    },
    techStack: ['React', 'PHP', 'Python', 'JavaScript', 'GraphQL', 'React Native', 'PyTorch', 'Hack'],
    skillsRequired: ['Frontend Development', 'Backend Development', 'System Design', 'Mobile Development'],
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
    slug: 'amazon',
    logo: 'https://logo.clearbit.com/amazon.com',
    description: 'American multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
    industry: 'E-commerce',
    headquarters: 'Seattle, Washington',
    founded: 1994,
    employees: '1,500,000+',
    website: 'https://amazon.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Online Assessment',
        description: 'Coding questions and work simulation based on Amazon scenarios',
        duration: '2 hours',
        type: 'Coding'
      },
      {
        round: 'Phone Interview',
        description: 'Technical and behavioral questions focusing on Leadership Principles',
        duration: '1 hour',
        type: 'Technical'
      },
      {
        round: 'Onsite Loop',
        description: '5-6 rounds including bar raiser interview covering all Leadership Principles',
        duration: '5-6 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Customer Obsession', 'Ownership', 'Invent and Simplify', 'Learn and Be Curious', 'Hire and Develop the Best'],
      workEnvironment: 'Customer-focused, ownership-driven, and high-performance',
      benefits: ['Health insurance', 'Stock options', 'Career Choice program', 'Parental leave'],
      diversity: 'Inclusive workplace with focus on diverse hiring and development'
    },
    techStack: ['Java', 'Python', 'C++', 'AWS', 'React', 'Node.js', 'Scala', 'Go'],
    skillsRequired: ['Leadership Principles', 'System Design', 'Algorithms', 'AWS', 'Distributed Systems'],
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
    slug: 'apple',
    logo: 'https://logo.clearbit.com/apple.com',
    description: 'American multinational technology company designing and manufacturing consumer electronics, software, and online services.',
    industry: 'Technology',
    headquarters: 'Cupertino, California',
    founded: 1976,
    employees: '164,000+',
    website: 'https://apple.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Phone Screen',
        description: 'Technical discussion with hiring manager about experience and projects',
        duration: '30-45 minutes',
        type: 'Technical'
      },
      {
        round: 'Technical Interview',
        description: 'In-depth technical questions, coding, and system design',
        duration: '1 hour',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: 'Multiple rounds with different team members focusing on technical depth',
        duration: '4-6 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Innovation', 'Quality', 'Simplicity', 'Privacy', 'Environmental Responsibility'],
      workEnvironment: 'Design-focused, detail-oriented, and collaborative',
      benefits: ['Health insurance', 'Stock purchase plan', 'Product discounts', 'Wellness programs'],
      diversity: 'Inclusive workplace committed to equal opportunity and accessibility'
    },
    techStack: ['Swift', 'Objective-C', 'C++', 'Python', 'JavaScript', 'Metal', 'Core ML'],
    skillsRequired: ['iOS Development', 'macOS Development', 'Hardware Knowledge', 'UI/UX Design'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 280,
      averageRating: 4.6,
      popularityScore: 92
    }
  },
  {
    name: 'Netflix',
    slug: 'netflix',
    logo: 'https://logo.clearbit.com/netflix.com',
    description: 'American streaming entertainment service with TV series, documentaries and feature films across a wide variety of genres and languages.',
    industry: 'Technology',
    headquarters: 'Los Gatos, California',
    founded: 1997,
    employees: '12,800+',
    website: 'https://netflix.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Recruiter Screen',
        description: 'Culture fit assessment and role discussion',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Hiring Manager Interview',
        description: 'Technical and behavioral questions with focus on Netflix culture',
        duration: '1 hour',
        type: 'Technical'
      },
      {
        round: 'Panel Interviews',
        description: 'Multiple interviews with team members covering technical skills',
        duration: '3-4 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Freedom and Responsibility', 'High Performance', 'Inclusion', 'Integrity', 'Innovation'],
      workEnvironment: 'High-performance culture with flexibility and autonomy',
      benefits: ['Unlimited PTO', 'Health insurance', 'Stock options', 'Learning budget'],
      diversity: 'Inclusive storytelling and workplace with focus on representation'
    },
    techStack: ['Java', 'Python', 'JavaScript', 'React', 'AWS', 'Microservices', 'Scala', 'Go'],
    skillsRequired: ['Distributed Systems', 'Streaming Technology', 'Data Engineering', 'Machine Learning'],
    experienceLevel: 'Mid Level',
    isFeatured: true,
    stats: {
      totalQuestions: 220,
      averageRating: 4.1,
      popularityScore: 85
    }
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    logo: '📦',
    description: 'American multinational technology company focusing on e-commerce, cloud computing, and AI.',
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
      totalQuestions: 300,
      averageRating: 4.3,
      popularityScore: 92
    }
  },
  // Microsoft and Other Tech Giants
  {
    name: 'Microsoft',
    slug: 'microsoft',
    logo: 'https://logo.clearbit.com/microsoft.com',
    description: 'American multinational technology corporation producing computer software and services.',
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

  // Tech Unicorns & High-Growth Companies
  {
    name: 'Tesla',
    slug: 'tesla',
    logo: 'https://logo.clearbit.com/tesla.com',
    description: 'Electric vehicle and clean energy company accelerating the world\'s transition to sustainable energy.',
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
        description: 'Hands-on technical challenge or coding test',
        duration: '2-3 hours',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: 'Multiple rounds including technical deep-dive and culture fit',
        duration: '4-6 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Innovation', 'Sustainability', 'Excellence', 'Integrity', 'Teamwork'],
      workEnvironment: 'Fast-paced, mission-driven, and innovative',
      benefits: ['Health insurance', 'Stock options', 'Employee discounts', 'Wellness programs'],
      diversity: 'Committed to diversity and equal opportunity employment'
    },
    techStack: ['Python', 'C++', 'JavaScript', 'React', 'Django', 'TensorFlow', 'MATLAB'],
    skillsRequired: ['Embedded Systems', 'AI/ML', 'Robotics', 'Automotive Engineering', 'Software Development'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 180,
      averageRating: 4.3,
      popularityScore: 88
    }
  },
  {
    name: 'Stripe',
    slug: 'stripe',
    logo: 'https://logo.clearbit.com/stripe.com',
    description: 'Financial infrastructure platform for businesses to accept payments and manage their operations online.',
    industry: 'Fintech',
    headquarters: 'San Francisco, California',
    founded: 2010,
    employees: '8,000+',
    website: 'https://stripe.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'Recruiter Screen',
        description: 'Initial conversation about background and role fit',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Phone Screen',
        description: 'Coding interview with focus on problem-solving',
        duration: '1 hour',
        type: 'Technical'
      },
      {
        round: 'Onsite Interviews',
        description: 'Technical interviews, system design, and culture fit',
        duration: '4-5 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Move with urgency and focus', 'Think rigorously', 'Trust and amplify'],
      workEnvironment: 'Collaborative, analytical, and growth-focused',
      benefits: ['Health insurance', 'Equity', 'Learning stipend', 'Flexible PTO'],
      diversity: 'Building an inclusive team that reflects our global user base'
    },
    techStack: ['Ruby', 'JavaScript', 'Go', 'Python', 'React', 'Scala', 'Java'],
    skillsRequired: ['Payment Systems', 'APIs', 'Distributed Systems', 'Security', 'Financial Technology'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 160,
      averageRating: 4.5,
      popularityScore: 82
    }
  },
  {
    name: 'Airbnb',
    slug: 'airbnb',
    logo: 'https://logo.clearbit.com/airbnb.com',
    description: 'Online marketplace for short-term homestays and experiences in various countries and regions.',
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
        description: 'Technical skills, system design, and core values assessment',
        duration: '4-5 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Champion the Mission', 'Be a Host', 'Embrace the Adventure', 'Be a Cereal Entrepreneur'],
      workEnvironment: 'Creative, inclusive, and community-focused',
      benefits: ['Health insurance', 'Equity', 'Travel credits', 'Learning stipend'],
      diversity: 'Committed to belonging and creating an inclusive environment'
    },
    techStack: ['React', 'Ruby on Rails', 'Java', 'JavaScript', 'Python', 'Kubernetes', 'GraphQL'],
    skillsRequired: ['Full-Stack Development', 'System Design', 'Mobile Development', 'Data Engineering'],
    experienceLevel: 'All Levels',
    isFeatured: false,
    stats: {
      totalQuestions: 140,
      averageRating: 4.2,
      popularityScore: 78
    }
  },
  {
    name: 'Uber',
    slug: 'uber',
    logo: 'https://logo.clearbit.com/uber.com',
    description: 'Technology platform that connects drivers and riders, and facilitates food delivery and freight transportation.',
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
        description: 'Multiple technical rounds covering algorithms and system design',
        duration: '2-3 hours',
        type: 'Technical'
      },
      {
        round: 'Behavioral Interview',
        description: 'Culture fit and leadership principles assessment',
        duration: '45 minutes',
        type: 'HR'
      }
    ],
    culture: {
      values: ['We build globally, we live locally', 'We are customer obsessed', 'We celebrate differences'],
      workEnvironment: 'Fast-paced, data-driven, and globally minded',
      benefits: ['Health insurance', 'Equity', 'Commuter benefits', 'Learning opportunities'],
      diversity: 'Building diverse and inclusive teams worldwide'
    },
    techStack: ['Go', 'Java', 'Python', 'React', 'Node.js', 'Kubernetes', 'Apache Kafka'],
    skillsRequired: ['Microservices', 'Distributed Systems', 'Mobile Development', 'Data Engineering'],
    experienceLevel: 'All Levels',
    isFeatured: false,
    stats: {
      totalQuestions: 200,
      averageRating: 4.0,
      popularityScore: 80
    }
  },
  {
    name: 'Spotify',
    slug: 'spotify',
    logo: 'https://logo.clearbit.com/spotify.com',
    description: 'Audio streaming and media services provider offering music, podcasts, and other audio content.',
    industry: 'Technology',
    headquarters: 'Stockholm, Sweden',
    founded: 2006,
    employees: '9,200+',
    website: 'https://spotify.com',
    difficulty: 'Medium',
    interviewProcess: [
      {
        round: 'Recruiter Call',
        description: 'Initial screening and role discussion',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Interview',
        description: 'Coding and technical problem-solving',
        duration: '1 hour',
        type: 'Technical'
      },
      {
        round: 'Final Interviews',
        description: 'Technical deep-dive and team fit assessment',
        duration: '3-4 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Innovative', 'Collaborative', 'Sincere', 'Passionate', 'Playful'],
      workEnvironment: 'Creative, music-loving, and innovative',
      benefits: ['Health insurance', 'Equity', 'Spotify Premium', 'Flexible work'],
      diversity: 'Committed to equal opportunity and inclusive culture'
    },
    techStack: ['Java', 'Python', 'JavaScript', 'React', 'Scala', 'Google Cloud', 'Kubernetes'],
    skillsRequired: ['Backend Development', 'Data Engineering', 'Machine Learning', 'Audio Processing'],
    experienceLevel: 'All Levels',
    isFeatured: false,
    stats: {
      totalQuestions: 120,
      averageRating: 4.3,
      popularityScore: 75
    }
  },

  // Financial Services
  {
    name: 'Goldman Sachs',
    slug: 'goldman-sachs',
    logo: 'https://logo.clearbit.com/goldmansachs.com',
    description: 'Leading global investment banking, securities and investment management firm.',
    industry: 'Finance',
    headquarters: 'New York, New York',
    founded: 1869,
    employees: '49,000+',
    website: 'https://goldmansachs.com',
    difficulty: 'Hard',
    interviewProcess: [
      {
        round: 'HireVue Interview',
        description: 'Video interview with behavioral and technical questions',
        duration: '30 minutes',
        type: 'HR'
      },
      {
        round: 'Technical Assessment',
        description: 'Coding challenges and financial problem-solving',
        duration: '2 hours',
        type: 'Technical'
      },
      {
        round: 'Super Day',
        description: 'Multiple rounds with different teams and senior staff',
        duration: '6-8 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Client service', 'Excellence', 'Integrity', 'Innovation'],
      workEnvironment: 'Fast-paced, analytical, and results-driven',
      benefits: ['Health insurance', 'Bonus structure', 'Professional development', 'Networking'],
      diversity: 'Committed to advancing diversity and inclusion in finance'
    },
    techStack: ['Java', 'Python', 'C++', 'JavaScript', 'React', 'Spring', 'Oracle', 'MongoDB'],
    skillsRequired: ['Financial Systems', 'Algorithms', 'Risk Management', 'Trading Systems', 'Quantitative Analysis'],
    experienceLevel: 'All Levels',
    isFeatured: true,
    stats: {
      totalQuestions: 250,
      averageRating: 4.1,
      popularityScore: 85
    }
  },
  {
    name: 'JPMorgan Chase',
    slug: 'jpmorgan-chase',
    logo: 'https://logo.clearbit.com/jpmorganchase.com',
    description: 'American multinational investment bank and financial services holding company.',
    industry: 'Finance',
    headquarters: 'New York, New York',
    founded: 1799,
    employees: '293,000+',
    website: 'https://jpmorganchase.com',
    difficulty: 'Medium',
    interviewProcess: [
      {
        round: 'Online Assessment',
        description: 'Coding challenges and behavioral questions',
        duration: '90 minutes',
        type: 'Technical'
      },
      {
        round: 'Phone Interview',
        description: 'Technical discussion and problem-solving',
        duration: '45 minutes',
        type: 'Technical'
      },
      {
        round: 'Final Round',
        description: 'Multiple interviews with team members and managers',
        duration: '3-4 hours',
        type: 'Technical'
      }
    ],
    culture: {
      values: ['Exceptional client service', 'Operational excellence', 'Integrity', 'Respect for each other'],
      workEnvironment: 'Collaborative, diverse, and innovation-focused',
      benefits: ['Health insurance', 'Retirement plans', 'Tuition assistance', 'Employee discounts'],
      diversity: 'Advancing diversity, equity and inclusion across all levels'
    },
    techStack: ['Java', 'Python', 'JavaScript', 'React', 'Spring Boot', 'AWS', 'Kubernetes'],
    skillsRequired: ['Banking Systems', 'Security', 'Cloud Computing', 'Data Analytics', 'Mobile Development'],
    experienceLevel: 'All Levels',
    isFeatured: false,
    stats: {
      totalQuestions: 180,
      averageRating: 4.0,
      popularityScore: 78
    }
  },
  {
    name: 'PayPal',
    slug: 'paypal',
    logo: 'https://logo.clearbit.com/paypal.com',
    description: 'American multinational financial technology company operating an online payments system.',
    industry: 'Fintech',
    headquarters: 'San Jose, California',
    founded: 1998,
    employees: '30,900+',
    website: 'https://paypal.com',
    difficulty: 'Medium',
    interviewProcess: [
      {
        round: 'Phone Screen',
        description: 'Technical screening with coding problems',
        duration: '45 minutes',
        type: 'Technical'
      },
      {
        round: 'Technical Interviews',
        description: 'Multiple rounds covering algorithms and system design',
        duration: '2-3 hours',
        type: 'Technical'
      },
      {
        round: 'Behavioral Interview',
        description: 'Culture fit and values alignment',
        duration: '30 minutes',
        type: 'HR'
      }
    ],
    culture: {
      values: ['Inclusion', 'Innovation', 'Collaboration', 'Wellness'],
      workEnvironment: 'Inclusive, innovative, and customer-focused',
      benefits: ['Health insurance', 'Stock options', 'Wellness programs', 'Learning opportunities'],
      diversity: 'Building an inclusive workplace that reflects our global community'
    },
    techStack: ['Java', 'Node.js', 'React', 'Python', 'Scala', 'Kubernetes', 'Apache Kafka'],
    skillsRequired: ['Payment Systems', 'Security', 'APIs', 'Microservices', 'Financial Technology'],
    experienceLevel: 'All Levels',
    isFeatured: false,
    stats: {
      totalQuestions: 140,
      averageRating: 4.2,
      popularityScore: 72
    }
  }
];

const sampleQuestions = [
  // Google Questions
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
    explanation: 'Use a hash map to store numbers and their indices. For each number, check if its complement exists in the map.',
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
    answer: 'Use the STAR method: Situation, Task, Action, Result. Focus on how you handled the conflict professionally and what you learned.',
    explanation: 'This question assesses your interpersonal skills and ability to work in teams.',
    hints: ['Use the STAR method', 'Focus on positive outcomes', 'Show learning and growth'],
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
    answer: 'Key components: URL encoding/decoding service, database for mappings, caching layer, load balancer, analytics service.',
    explanation: 'Focus on scalability, database design, caching strategies, and handling high traffic.',
    hints: ['Think about encoding algorithms', 'Consider caching strategies', 'Plan for scale'],
    tags: ['System Design', 'Scalability', 'Database Design'],
    source: 'Official',
    frequency: 'High',
    interviewRound: 'System Design'
  }
];

export const seedCompanies = async () => {
  try {
    console.log('🏢 Starting company seeding process...');
    
    // Check if companies already exist
    const existingCompanies = await Company.countDocuments();
    if (existingCompanies > 0) {
      console.log(`📊 Found ${existingCompanies} existing companies. Skipping seeding.`);
      return;
    }
    
    console.log('🗑️  Clearing existing data...');
    await Company.deleteMany({});
    await CompanyQuestion.deleteMany({});
    
    console.log(`📝 Inserting ${sampleCompanies.length} companies...`);
    
    // Insert companies one by one to handle validation
    let successCount = 0;
    let errorCount = 0;
    
    for (const companyData of sampleCompanies) {
      try {
        // Generate slug from name if not present
        const slug = companyData.slug || companyData.name.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        const companyWithSlug = {
          ...companyData,
          slug
        };
        
        console.log(`🔍 Attempting to create: ${companyData.name} with slug: ${slug}`);
        
        const company = new Company(companyWithSlug);
        await company.save();
        successCount++;
        console.log(`✅ Created: ${company.name} (${company.industry}) - slug: ${company.slug}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to create: ${companyData.name} - ${error.message}`);
        console.error(`   Company data:`, JSON.stringify(companyData, null, 2));
        break; // Stop on first error to debug
      }
    }
    
    console.log(`\n📈 Company seeding summary:`);
    console.log(`✅ Successfully created: ${successCount} companies`);
    console.log(`❌ Failed: ${errorCount} companies`);
    
    // Insert sample questions for each company
    console.log('\n📝 Adding sample questions...');
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
    
    // Show summary by industry
    const industryStats = await Company.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n🏭 Companies by industry:');
    industryStats.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count} companies`);
    });
    
  } catch (error) {
    console.error('❌ Company seeding failed:', error);
    throw error;
  }
};

export { sampleCompanies };
export default { seedCompanies };