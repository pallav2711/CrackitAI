// AI Preparation Plan Generation Service
// This service generates personalized study plans, schedules, and assessments

const GLOBAL_COMPANIES = [
  // Technology Giants
  { name: 'Google', logo: 'https://logo.clearbit.com/google.com', industry: 'Technology', difficulty: 'Hard', region: 'Global', techStack: ['JavaScript', 'Python', 'Go', 'C++', 'System Design'] },
  { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', industry: 'Technology', difficulty: 'Hard', region: 'Global', techStack: ['C#', '.NET', 'Azure', 'TypeScript', 'System Design'] },
  { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com', industry: 'E-commerce/Cloud', difficulty: 'Hard', region: 'Global', techStack: ['Java', 'Python', 'AWS', 'System Design', 'Distributed Systems'] },
  { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com', industry: 'Social Media', difficulty: 'Hard', region: 'Global', techStack: ['React', 'Python', 'PHP', 'GraphQL', 'System Design'] },
  { name: 'Apple', logo: 'https://logo.clearbit.com/apple.com', industry: 'Technology', difficulty: 'Hard', region: 'Global', techStack: ['Swift', 'Objective-C', 'C++', 'iOS', 'System Design'] },
  { name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com', industry: 'Entertainment', difficulty: 'Hard', region: 'Global', techStack: ['Java', 'Node.js', 'React', 'AWS', 'Microservices'] },
  { name: 'Tesla', logo: 'https://logo.clearbit.com/tesla.com', industry: 'Automotive', difficulty: 'Hard', region: 'Global', techStack: ['Python', 'C++', 'Embedded Systems', 'AI/ML', 'Robotics'] },
  { name: 'SpaceX', logo: 'https://logo.clearbit.com/spacex.com', industry: 'Aerospace', difficulty: 'Hard', region: 'Global', techStack: ['C++', 'Python', 'Embedded Systems', 'Real-time Systems'] },
  
  // Tech Unicorns
  { name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', industry: 'Fintech', difficulty: 'Hard', region: 'Global', techStack: ['Ruby', 'JavaScript', 'Go', 'APIs', 'Payment Systems'] },
  { name: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com', industry: 'Travel', difficulty: 'Medium', region: 'Global', techStack: ['React', 'Ruby', 'Java', 'System Design'] },
  { name: 'Uber', logo: 'https://logo.clearbit.com/uber.com', industry: 'Transportation', difficulty: 'Hard', region: 'Global', techStack: ['Go', 'Java', 'Python', 'Microservices', 'System Design'] },
  { name: 'Spotify', logo: 'https://logo.clearbit.com/spotify.com', industry: 'Music Streaming', difficulty: 'Medium', region: 'Global', techStack: ['Java', 'Python', 'React', 'GCP', 'Data Engineering'] },
  { name: 'Shopify', logo: 'https://logo.clearbit.com/shopify.com', industry: 'E-commerce', difficulty: 'Medium', region: 'Global', techStack: ['Ruby on Rails', 'React', 'GraphQL', 'MySQL'] },
  
  // Financial Services
  { name: 'Goldman Sachs', logo: 'https://logo.clearbit.com/goldmansachs.com', industry: 'Finance', difficulty: 'Hard', region: 'Global', techStack: ['Java', 'Python', 'C++', 'Financial Systems', 'Algorithms'] },
  { name: 'JPMorgan Chase', logo: 'https://logo.clearbit.com/jpmorganchase.com', industry: 'Banking', difficulty: 'Medium', region: 'Global', techStack: ['Java', 'Python', 'React', 'Cloud', 'Security'] },
  { name: 'PayPal', logo: 'https://logo.clearbit.com/paypal.com', industry: 'Fintech', difficulty: 'Medium', region: 'Global', techStack: ['Java', 'Node.js', 'React', 'Security', 'APIs'] },
  
  // Consulting
  { name: 'McKinsey', logo: 'https://logo.clearbit.com/mckinsey.com', industry: 'Consulting', difficulty: 'Hard', region: 'Global', techStack: ['Business Analysis', 'Strategy', 'Data Analysis', 'Problem Solving'] },
  { name: 'BCG', logo: 'https://logo.clearbit.com/bcg.com', industry: 'Consulting', difficulty: 'Hard', region: 'Global', techStack: ['Strategy', 'Analytics', 'Business Intelligence'] },
  { name: 'Deloitte', logo: 'https://logo.clearbit.com/deloitte.com', industry: 'Consulting', difficulty: 'Medium', region: 'Global', techStack: ['Business Analysis', 'Technology Consulting', 'Cloud'] },
  
  // Asian Tech Giants
  { name: 'Alibaba', logo: 'https://logo.clearbit.com/alibaba.com', industry: 'E-commerce', difficulty: 'Hard', region: 'Asia', techStack: ['Java', 'Python', 'Cloud', 'Distributed Systems'] },
  { name: 'Tencent', logo: 'https://logo.clearbit.com/tencent.com', industry: 'Technology', difficulty: 'Hard', region: 'Asia', techStack: ['C++', 'Go', 'WeChat', 'Gaming', 'Cloud'] },
  { name: 'ByteDance', logo: 'https://logo.clearbit.com/bytedance.com', industry: 'Social Media', difficulty: 'Hard', region: 'Asia', techStack: ['Go', 'Python', 'ML/AI', 'Recommendation Systems'] },
  { name: 'Samsung', logo: 'https://logo.clearbit.com/samsung.com', industry: 'Electronics', difficulty: 'Medium', region: 'Asia', techStack: ['Android', 'Java', 'C++', 'Hardware', 'IoT'] },
  
  // European Companies
  { name: 'SAP', logo: 'https://logo.clearbit.com/sap.com', industry: 'Enterprise Software', difficulty: 'Medium', region: 'Europe', techStack: ['ABAP', 'Java', 'Cloud', 'ERP Systems'] },
  { name: 'Booking.com', logo: 'https://logo.clearbit.com/booking.com', industry: 'Travel', difficulty: 'Medium', region: 'Europe', techStack: ['Java', 'Perl', 'React', 'Microservices'] },
  
  // Indian Companies
  { name: 'Flipkart', logo: 'https://logo.clearbit.com/flipkart.com', industry: 'E-commerce', difficulty: 'Medium', region: 'India', techStack: ['Java', 'React', 'Microservices', 'Cloud'] },
  { name: 'Zomato', logo: 'https://logo.clearbit.com/zomato.com', industry: 'Food Tech', difficulty: 'Medium', region: 'India', techStack: ['Node.js', 'React', 'Python', 'Mobile'] },
  { name: 'Paytm', logo: 'https://logo.clearbit.com/paytm.com', industry: 'Fintech', difficulty: 'Medium', region: 'India', techStack: ['Java', 'Node.js', 'React Native', 'Payment Systems'] },
  { name: 'Infosys', logo: 'https://logo.clearbit.com/infosys.com', industry: 'IT Services', difficulty: 'Easy', region: 'India', techStack: ['Java', '.NET', 'Cloud', 'Enterprise'] },
  { name: 'TCS', logo: 'https://logo.clearbit.com/tcs.com', industry: 'IT Services', difficulty: 'Easy', region: 'India', techStack: ['Java', 'Python', 'Cloud', 'Enterprise'] },
  { name: 'Wipro', logo: 'https://logo.clearbit.com/wipro.com', industry: 'IT Services', difficulty: 'Easy', region: 'India', techStack: ['Java', 'Cloud', 'DevOps', 'Enterprise'] }
];

class AIPrepService {
  
  // Get all companies with filtering
  static getCompanies(filters = {}) {
    let companies = [...GLOBAL_COMPANIES];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      companies = companies.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.industry.toLowerCase().includes(search)
      );
    }
    
    if (filters.industry && filters.industry !== 'all') {
      companies = companies.filter(c => c.industry === filters.industry);
    }
    
    if (filters.difficulty && filters.difficulty !== 'all') {
      companies = companies.filter(c => c.difficulty === filters.difficulty);
    }
    
    if (filters.region && filters.region !== 'all') {
      companies = companies.filter(c => c.region === filters.region);
    }
    
    // Add stats and proper IDs
    return companies.map(c => ({
      ...c,
      _id: c.name.toLowerCase().replace(/\s+/g, '-'),
      slug: c.name.toLowerCase().replace(/\s+/g, '-'),
      description: this.generateCompanyDescription(c),
      stats: {
        totalQuestions: Math.floor(Math.random() * 200) + 100,
        avgPreparationTime: `${c.difficulty === 'Hard' ? '60-90' : c.difficulty === 'Medium' ? '30-60' : '15-30'} days`,
        averageRating: 4.0 + Math.random() * 1.0,
        popularityScore: Math.floor(Math.random() * 30) + 70
      }
    }));
  }
  
  static generateCompanyDescription(company) {
    const descriptions = {
      'Technology': `Leading technology company known for innovation and cutting-edge solutions. Prepare for challenging technical interviews covering ${company.techStack.slice(0, 3).join(', ')}.`,
      'Finance': `Top-tier financial institution with rigorous interview process. Focus on algorithms, system design, and financial domain knowledge.`,
      'Consulting': `Premier consulting firm seeking analytical minds. Prepare for case studies, business scenarios, and strategic thinking.`,
      'E-commerce': `Fast-paced e-commerce leader. Expect questions on scalability, distributed systems, and customer-centric design.`,
      'Fintech': `Innovative fintech company revolutionizing payments. Focus on security, APIs, and financial systems.`
    };
    return descriptions[company.industry] || `Prepare for ${company.name} with comprehensive interview preparation covering technical and behavioral aspects.`;
  }
  
  // Generate personalized daily schedule
  static generateDailySchedule(config) {
    const { duration, focusAreas, studyIntensity, availableHours, targetRole, companyName } = config;
    const schedule = [];
    
    const intensityMultiplier = {
      'Light': 0.7,
      'Moderate': 1.0,
      'Intensive': 1.3
    };
    
    const dailyHours = availableHours * intensityMultiplier[studyIntensity];
    const totalDays = duration;
    
    // Divide duration into phases
    const phases = [
      { name: 'Foundation', days: Math.floor(totalDays * 0.3), focus: 'basics' },
      { name: 'Deep Dive', days: Math.floor(totalDays * 0.4), focus: 'advanced' },
      { name: 'Practice', days: Math.floor(totalDays * 0.2), focus: 'practice' },
      { name: 'Mock & Review', days: Math.floor(totalDays * 0.1), focus: 'mock' }
    ];
    
    let currentDay = 1;
    const startDate = new Date();
    
    phases.forEach(phase => {
      for (let i = 0; i < phase.days; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + currentDay - 1);
        
        const tasks = this.generateDailyTasks(phase, focusAreas, dailyHours, currentDay, targetRole, companyName);
        
        schedule.push({
          day: currentDay,
          date: dayDate,
          title: `Day ${currentDay}: ${phase.name} - ${tasks[0]?.title || 'Study'}`,
          description: this.getDayDescription(phase, currentDay),
          tasks,
          totalDuration: Math.round(dailyHours * 60),
          completed: false
        });
        
        currentDay++;
      }
    });
    
    return schedule;
  }
  
  static generateDailyTasks(phase, focusAreas, dailyHours, day, targetRole, companyName) {
    const tasks = [];
    const totalMinutes = dailyHours * 60;
    let taskId = 1;
    
    // Morning session (40% of time)
    if (focusAreas.includes('Technical Skills') || focusAreas.includes('Coding Practice')) {
      const codingTasks = {
        'basics': {
          title: 'Master Data Structures Fundamentals',
          description: 'Study arrays, linked lists, stacks, queues, hash tables. Practice 3-5 easy problems on LeetCode focusing on these structures.'
        },
        'advanced': {
          title: 'Advanced Algorithms & Problem Solving',
          description: 'Focus on dynamic programming, graphs, trees, and backtracking. Solve 2-3 medium problems. Study time/space complexity optimization.'
        },
        'practice': {
          title: 'Solve Medium-Hard Coding Problems',
          description: `Practice ${companyName}-style questions. Focus on explaining your approach clearly. Time yourself: 45 mins per problem.`
        },
        'mock': {
          title: 'Mock Coding Interview Session',
          description: 'Simulate real interview: solve 2 problems in 60 mins, explain your thought process aloud, optimize solutions, discuss trade-offs.'
        }
      };
      
      const task = codingTasks[phase.focus];
      tasks.push({
        id: `task-${day}-${taskId++}`,
        title: task.title,
        description: task.description,
        type: phase.focus === 'mock' ? 'practice' : 'reading',
        duration: Math.round(totalMinutes * 0.4),
        completed: false
      });
    }
    
    // Midday session (30% of time)
    if (focusAreas.includes('System Design')) {
      const systemTasks = {
        'basics': {
          title: 'System Design Fundamentals',
          description: 'Learn about scalability, load balancing, caching, databases (SQL vs NoSQL), CDNs, and API design principles.'
        },
        'advanced': {
          title: 'Distributed Systems & Scalability',
          description: 'Study microservices, message queues, sharding, replication, CAP theorem, and consistency patterns. Review real-world architectures.'
        },
        'practice': {
          title: 'Design Real-World Systems',
          description: `Design systems like URL shortener, social media feed, or ride-sharing app. Focus on ${companyName}'s scale and requirements.`
        },
        'mock': {
          title: 'Mock System Design Interview',
          description: 'Practice designing a large-scale system in 45 mins. Cover requirements, capacity estimation, API design, database schema, and scaling strategy.'
        }
      };
      
      const task = systemTasks[phase.focus];
      tasks.push({
        id: `task-${day}-${taskId++}`,
        title: task.title,
        description: task.description,
        type: 'video',
        duration: Math.round(totalMinutes * 0.3),
        completed: false
      });
    }
    
    // Afternoon session (20% of time)
    if (focusAreas.includes('Behavioral') || focusAreas.includes('Company Culture')) {
      tasks.push({
        id: `task-${day}-${taskId++}`,
        title: `${companyName} Culture & Behavioral Preparation`,
        description: `Research ${companyName}'s values, recent projects, and culture. Prepare STAR stories for: leadership, conflict resolution, failure, teamwork, and innovation. Practice answering "Why ${companyName}?"`,
        type: 'reading',
        duration: Math.round(totalMinutes * 0.2),
        completed: false
      });
    }
    
    // Evening review (10% of time)
    tasks.push({
      id: `task-${day}-${taskId++}`,
      title: 'Daily Review & Reflection',
      description: 'Review what you learned today. Write down key concepts, patterns, and mistakes. Update your notes. Plan tomorrow\'s focus areas.',
      type: 'review',
      duration: Math.round(totalMinutes * 0.1),
      completed: false
    });
    
    return tasks;
  }
  

  static getDayDescription(phase, day) {
    const descriptions = {
      'Foundation': `Build strong fundamentals. Focus on understanding core concepts and basic problem-solving.`,
      'Deep Dive': `Dive deep into advanced topics. Challenge yourself with complex problems and scenarios.`,
      'Practice': `Apply your knowledge. Solve real interview problems and practice under time constraints.`,
      'Mock & Review': `Simulate real interviews. Review weak areas and polish your performance.`
    };
    return descriptions[phase.name] || 'Continue your preparation journey.';
  }
  
  // Generate weekly assessments
  static generateWeeklyAssessments(duration, focusAreas, targetRole, companyName) {
    const assessments = [];
    const weeks = Math.ceil(duration / 7);
    
    for (let week = 1; week <= weeks; week++) {
      assessments.push({
        week,
        title: `Week ${week} Assessment`,
        description: `Test your knowledge and skills from week ${week}. This assessment covers ${focusAreas.slice(0, 2).join(' and ')}.`,
        questions: this.generateAssessmentQuestions(week, focusAreas, targetRole, companyName),
        status: 'pending',
        score: 0,
        totalPoints: 100
      });
    }
    
    return assessments;
  }
  
  static generateAssessmentQuestions(week, focusAreas, targetRole, companyName) {
    const questions = [];
    let qId = 1;
    
    // MCQ Questions (40%)
    for (let i = 0; i < 4; i++) {
      questions.push({
        id: `q-${week}-${qId++}`,
        question: `Which approach is best for ${this.getRandomTopic(focusAreas)} at ${companyName}?`,
        type: 'mcq',
        options: [
          'Option A: Using dynamic programming',
          'Option B: Using greedy approach',
          'Option C: Using divide and conquer',
          'Option D: Using brute force'
        ],
        correctAnswer: 'Option A: Using dynamic programming',
        points: 10
      });
    }
    
    // Coding Questions (40%)
    for (let i = 0; i < 2; i++) {
      questions.push({
        id: `q-${week}-${qId++}`,
        question: `Implement a solution for: ${this.getRandomCodingProblem(week)}`,
        type: 'coding',
        points: 20
      });
    }
    
    // Essay Questions (20%)
    questions.push({
      id: `q-${week}-${qId++}`,
      question: `Describe how you would design a system for ${companyName} that handles ${this.getRandomSystemDesign()}`,
      type: 'essay',
      points: 20
    });
    
    return questions;
  }
  
  static getRandomTopic(focusAreas) {
    const topics = ['optimizing database queries', 'handling concurrent requests', 'implementing caching', 'scaling microservices'];
    return topics[Math.floor(Math.random() * topics.length)];
  }
  
  static getRandomCodingProblem(week) {
    const problems = [
      'Find the longest substring without repeating characters',
      'Implement LRU Cache',
      'Design a rate limiter',
      'Merge K sorted lists',
      'Find median from data stream'
    ];
    return problems[Math.min(week - 1, problems.length - 1)];
  }
  
  static getRandomSystemDesign() {
    const designs = ['millions of concurrent users', 'real-time data processing', 'global content delivery', 'high-availability services'];
    return designs[Math.floor(Math.random() * designs.length)];
  }
  
  // Generate AI insights
  static generateAIInsights(companyName, targetRole, focusAreas) {
    return {
      companyInsights: `${companyName} is known for its rigorous interview process focusing on problem-solving and system thinking. They value candidates who can demonstrate both technical depth and breadth.`,
      interviewTips: [
        `Research ${companyName}'s recent projects and products`,
        'Practice explaining your thought process clearly',
        'Prepare questions about team culture and growth opportunities',
        'Review common patterns in their interview questions',
        'Be ready to discuss trade-offs in your solutions'
      ],
      commonQuestions: [
        'Tell me about a challenging project you worked on',
        'How would you design a scalable system?',
        'Explain a time you had to make a difficult technical decision',
        `Why do you want to work at ${companyName}?`,
        'How do you handle disagreements in a team?'
      ],
      cultureFit: `${companyName} values innovation, collaboration, and continuous learning. They seek candidates who are passionate about technology and can work effectively in fast-paced environments.`,
      technicalFocus: focusAreas
    };
  }
}

export default AIPrepService;
