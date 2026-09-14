import OpenAI from 'openai';

// Lazy initialization to avoid errors when API key is not set
let openai = null;

const getOpenAIClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
};

/**
 * Generate test questions using AI
 */
export const generateTestQuestions = async ({
  category,
  difficulty,
  questionCount,
  topic = null
}) => {
  try {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = buildTestSystemPrompt(category, difficulty);
    const userPrompt = buildTestUserPrompt(category, difficulty, questionCount, topic);

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Validate and format questions
    const questions = parsed.questions.map(q => ({
      question: q.question,
      type: q.type || 'multiple-choice',
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      difficulty: q.difficulty || difficulty,
      points: calculatePoints(q.difficulty || difficulty),
      tags: q.tags || [category]
    }));

    return questions;
  } catch (error) {
    console.error('Error generating AI test questions:', error);
    throw new Error('Failed to generate test questions: ' + error.message);
  }
};

/**
 * Generate a complete test with AI
 */
export const generateCompleteTest = async ({
  category,
  difficulty,
  questionCount,
  duration,
  topic = null
}) => {
  try {
    console.log(`Generating AI test: ${category}, ${difficulty}, ${questionCount} questions`);
    
    const questions = await generateTestQuestions({
      category,
      difficulty,
      questionCount,
      topic
    });

    const test = {
      title: generateTestTitle(category, difficulty, topic),
      description: generateTestDescription(category, difficulty, topic),
      category,
      difficulty,
      duration: duration || calculateDuration(questionCount),
      questions,
      passingScore: 60,
      createdBy: 'ai',
      aiGenerated: true
    };

    console.log(`Successfully generated AI test with ${questions.length} questions`);
    return test;
  } catch (error) {
    console.error('Error generating complete test:', error);
    throw new Error('Failed to generate test: ' + error.message);
  }
};

// Helper function to build system prompt
function buildTestSystemPrompt(category, difficulty) {
  const categoryDescriptions = {
    aptitude: 'quantitative aptitude, numerical reasoning, and mathematical problem-solving',
    technical: 'technical knowledge, programming concepts, and software development',
    logical: 'logical reasoning, pattern recognition, and analytical thinking',
    verbal: 'verbal reasoning, reading comprehension, and language skills',
    coding: 'programming, algorithms, data structures, and coding concepts'
  };

  return `You are an expert test question generator specializing in ${categoryDescriptions[category] || category}.
Generate high-quality multiple-choice questions at ${difficulty} difficulty level.

Each question should:
1. Be clear, unambiguous, and professionally written
2. Have exactly 4 options (for multiple-choice)
3. Have only ONE correct answer
4. Include a detailed explanation
5. Be appropriate for the difficulty level
6. Test practical knowledge and understanding

Difficulty guidelines:
- Easy: Basic concepts, straightforward questions
- Medium: Intermediate concepts, requires understanding
- Hard: Advanced concepts, requires deep knowledge

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation of why this is correct and others are wrong",
      "difficulty": "${difficulty}",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;
}

// Helper function to build user prompt
function buildTestUserPrompt(category, difficulty, questionCount, topic) {
  let prompt = `Generate ${questionCount} unique ${difficulty} difficulty ${category} questions.`;
  
  if (topic) {
    prompt += `\n\nFocus on this specific topic: ${topic}`;
  }

  const categoryGuidelines = {
    aptitude: `
Include questions on:
- Numerical reasoning and calculations
- Percentages, ratios, and proportions
- Time, speed, and distance
- Profit, loss, and discounts
- Data interpretation`,
    
    technical: `
Include questions on:
- Programming fundamentals
- Data structures and algorithms
- System design concepts
- Software development practices
- Technology-specific knowledge`,
    
    logical: `
Include questions on:
- Pattern recognition
- Logical sequences
- Analytical reasoning
- Problem-solving
- Critical thinking`,
    
    verbal: `
Include questions on:
- Reading comprehension
- Vocabulary and synonyms
- Grammar and sentence correction
- Verbal analogies
- Critical reasoning`,
    
    coding: `
Include questions on:
- Programming language syntax
- Algorithm complexity
- Data structure operations
- Code output prediction
- Best practices and patterns`
  };

  prompt += categoryGuidelines[category] || '';
  
  prompt += `\n\nEnsure questions are:
- Diverse and cover different sub-topics
- Realistic and practical
- Not repetitive
- Appropriate for job interviews and assessments

Return the response as valid JSON only.`;

  return prompt;
}

// Helper functions
function calculatePoints(difficulty) {
  const pointsMap = {
    easy: 1,
    medium: 2,
    hard: 3
  };
  return pointsMap[difficulty] || 1;
}

function calculateDuration(questionCount) {
  // Estimate 1.5 minutes per question
  return Math.ceil(questionCount * 1.5);
}

function generateTestTitle(category, difficulty, topic) {
  const categoryTitles = {
    aptitude: 'Quantitative Aptitude',
    technical: 'Technical Assessment',
    logical: 'Logical Reasoning',
    verbal: 'Verbal Ability',
    coding: 'Coding Challenge'
  };

  const base = categoryTitles[category] || category;
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  
  if (topic) {
    return `${base}: ${topic} (${difficultyLabel})`;
  }
  
  return `${base} - ${difficultyLabel} Level`;
}

function generateTestDescription(category, difficulty, topic) {
  const descriptions = {
    aptitude: 'Test your quantitative and numerical reasoning skills',
    technical: 'Assess your technical knowledge and problem-solving abilities',
    logical: 'Challenge your logical thinking and analytical reasoning',
    verbal: 'Evaluate your verbal reasoning and language comprehension',
    coding: 'Test your programming knowledge and coding skills'
  };

  let desc = descriptions[category] || `Test your ${category} skills`;
  
  if (topic) {
    desc += ` with focus on ${topic}`;
  }
  
  return desc + ` at ${difficulty} difficulty level.`;
}

// Fallback test questions (same as existing testData)
export const getFallbackTestQuestions = (category, difficulty, count) => {
  const fallbackQuestions = {
    aptitude: [
      {
        question: "If a product costs $80 after a 20% discount, what was the original price?",
        type: "multiple-choice",
        options: ["$96", "$100", "$104", "$110"],
        correctAnswer: "$100",
        explanation: "If 80% = $80, then 100% = $80 / 0.8 = $100",
        difficulty: "medium",
        points: 2,
        tags: ["aptitude", "percentage", "discount"]
      },
      {
        question: "A train travels 120 km in 2 hours. What is its average speed?",
        type: "multiple-choice",
        options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
        correctAnswer: "60 km/h",
        explanation: "Speed = Distance / Time = 120 / 2 = 60 km/h",
        difficulty: "easy",
        points: 1,
        tags: ["aptitude", "speed", "distance"]
      },
      {
        question: "What is 15% of 200?",
        type: "multiple-choice",
        options: ["25", "30", "35", "40"],
        correctAnswer: "30",
        explanation: "15% of 200 = (15/100) × 200 = 30",
        difficulty: "easy",
        points: 1,
        tags: ["aptitude", "percentage"]
      },
      {
        question: "If the ratio of boys to girls in a class is 3:2 and there are 15 boys, how many girls are there?",
        type: "multiple-choice",
        options: ["8", "10", "12", "15"],
        correctAnswer: "10",
        explanation: "If 3 parts = 15 boys, then 1 part = 5. So 2 parts (girls) = 10",
        difficulty: "medium",
        points: 2,
        tags: ["aptitude", "ratio", "proportion"]
      },
      {
        question: "A shopkeeper sells an item at 25% profit. If the cost price is $40, what is the selling price?",
        type: "multiple-choice",
        options: ["$45", "$50", "$55", "$60"],
        correctAnswer: "$50",
        explanation: "Selling Price = Cost Price + 25% of Cost Price = 40 + (25/100 × 40) = 40 + 10 = $50",
        difficulty: "easy",
        points: 1,
        tags: ["aptitude", "profit", "percentage"]
      },
      {
        question: "What is the average of 10, 20, 30, 40, and 50?",
        type: "multiple-choice",
        options: ["25", "30", "35", "40"],
        correctAnswer: "30",
        explanation: "Average = Sum / Count = (10+20+30+40+50) / 5 = 150 / 5 = 30",
        difficulty: "easy",
        points: 1,
        tags: ["aptitude", "average", "mean"]
      }
    ],
    technical: [
      {
        question: "What does API stand for?",
        type: "multiple-choice",
        options: [
          "Application Programming Interface",
          "Advanced Programming Integration",
          "Automated Process Interface",
          "Application Process Integration"
        ],
        correctAnswer: "Application Programming Interface",
        explanation: "API stands for Application Programming Interface, which allows different software applications to communicate.",
        difficulty: "easy",
        points: 1,
        tags: ["technical", "api", "basics"]
      },
      {
        question: "Which HTTP method is used to update a resource?",
        type: "multiple-choice",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: "PUT",
        explanation: "PUT is used to update an existing resource, while POST creates new resources.",
        difficulty: "medium",
        points: 2,
        tags: ["technical", "http", "rest"]
      },
      {
        question: "What is the difference between SQL and NoSQL databases?",
        type: "multiple-choice",
        options: [
          "SQL is faster than NoSQL",
          "SQL uses structured schema, NoSQL is schema-less",
          "NoSQL cannot handle large data",
          "SQL is only for web applications"
        ],
        correctAnswer: "SQL uses structured schema, NoSQL is schema-less",
        explanation: "SQL databases use a fixed schema with tables and relationships, while NoSQL databases are more flexible and schema-less.",
        difficulty: "medium",
        points: 2,
        tags: ["technical", "database", "sql"]
      },
      {
        question: "What does MVC stand for in software architecture?",
        type: "multiple-choice",
        options: [
          "Model View Controller",
          "Multiple View Components",
          "Main Visual Content",
          "Managed Version Control"
        ],
        correctAnswer: "Model View Controller",
        explanation: "MVC stands for Model-View-Controller, a design pattern that separates application logic into three interconnected components.",
        difficulty: "easy",
        points: 1,
        tags: ["technical", "architecture", "mvc"]
      },
      {
        question: "Which of the following is NOT a programming paradigm?",
        type: "multiple-choice",
        options: [
          "Object-Oriented",
          "Functional",
          "Procedural",
          "Sequential"
        ],
        correctAnswer: "Sequential",
        explanation: "Sequential is not a programming paradigm. The main paradigms are Object-Oriented, Functional, and Procedural.",
        difficulty: "medium",
        points: 2,
        tags: ["technical", "programming", "paradigms"]
      },
      {
        question: "What is the purpose of version control systems like Git?",
        type: "multiple-choice",
        options: [
          "To compile code faster",
          "To track changes and collaborate on code",
          "To debug applications",
          "To deploy applications"
        ],
        correctAnswer: "To track changes and collaborate on code",
        explanation: "Version control systems track changes to code over time and enable multiple developers to collaborate effectively.",
        difficulty: "easy",
        points: 1,
        tags: ["technical", "git", "version-control"]
      }
    ],
    logical: [
      {
        question: "Complete the sequence: 2, 4, 8, 16, __",
        type: "multiple-choice",
        options: ["24", "28", "32", "36"],
        correctAnswer: "32",
        explanation: "Each number is double the previous: 2×2=4, 4×2=8, 8×2=16, 16×2=32",
        difficulty: "easy",
        points: 1,
        tags: ["logical", "sequence", "pattern"]
      },
      {
        question: "If all roses are flowers and some flowers are red, which is definitely true?",
        type: "multiple-choice",
        options: [
          "All roses are red",
          "Some roses are red",
          "All flowers are roses",
          "Some roses might be red"
        ],
        correctAnswer: "Some roses might be red",
        explanation: "We can't conclude all roses are red, but some roses might be among the red flowers.",
        difficulty: "medium",
        points: 2,
        tags: ["logical", "reasoning", "deduction"]
      },
      {
        question: "What comes next in the series: A, C, E, G, __",
        type: "multiple-choice",
        options: ["H", "I", "J", "K"],
        correctAnswer: "I",
        explanation: "The pattern skips one letter each time: A(skip B)C(skip D)E(skip F)G(skip H)I",
        difficulty: "easy",
        points: 1,
        tags: ["logical", "sequence", "letters"]
      },
      {
        question: "If 5 workers can complete a task in 10 days, how many days will 10 workers take?",
        type: "multiple-choice",
        options: ["5 days", "10 days", "15 days", "20 days"],
        correctAnswer: "5 days",
        explanation: "More workers means less time. 10 workers (double) will take half the time: 10/2 = 5 days",
        difficulty: "medium",
        points: 2,
        tags: ["logical", "work", "time"]
      },
      {
        question: "Which number doesn't belong: 2, 3, 5, 7, 9, 11",
        type: "multiple-choice",
        options: ["2", "3", "9", "11"],
        correctAnswer: "9",
        explanation: "All are prime numbers except 9 (which is 3×3)",
        difficulty: "medium",
        points: 2,
        tags: ["logical", "numbers", "prime"]
      },
      {
        question: "If A is taller than B, and B is taller than C, who is the shortest?",
        type: "multiple-choice",
        options: ["A", "B", "C", "Cannot determine"],
        correctAnswer: "C",
        explanation: "If A > B and B > C, then C is the shortest",
        difficulty: "easy",
        points: 1,
        tags: ["logical", "comparison", "reasoning"]
      }
    ],
    verbal: [
      {
        question: "Choose the synonym of 'Abundant':",
        type: "multiple-choice",
        options: ["Scarce", "Plentiful", "Limited", "Rare"],
        correctAnswer: "Plentiful",
        explanation: "Abundant means existing in large quantities, which is synonymous with plentiful.",
        difficulty: "easy",
        points: 1,
        tags: ["verbal", "vocabulary", "synonyms"]
      },
      {
        question: "Identify the grammatically correct sentence:",
        type: "multiple-choice",
        options: [
          "She don't like coffee",
          "She doesn't likes coffee",
          "She doesn't like coffee",
          "She don't likes coffee"
        ],
        correctAnswer: "She doesn't like coffee",
        explanation: "Correct subject-verb agreement: 'She' (singular) requires 'doesn't' and base form 'like'.",
        difficulty: "easy",
        points: 1,
        tags: ["verbal", "grammar"]
      },
      {
        question: "Choose the antonym of 'Transparent':",
        type: "multiple-choice",
        options: ["Clear", "Opaque", "Visible", "Bright"],
        correctAnswer: "Opaque",
        explanation: "Transparent means see-through, while opaque means not allowing light to pass through.",
        difficulty: "easy",
        points: 1,
        tags: ["verbal", "vocabulary", "antonyms"]
      },
      {
        question: "Complete the analogy: Book is to Reading as Fork is to __",
        type: "multiple-choice",
        options: ["Eating", "Cooking", "Kitchen", "Spoon"],
        correctAnswer: "Eating",
        explanation: "A book is used for reading, just as a fork is used for eating.",
        difficulty: "medium",
        points: 2,
        tags: ["verbal", "analogy", "reasoning"]
      },
      {
        question: "Which word is spelled correctly?",
        type: "multiple-choice",
        options: ["Occassion", "Occasion", "Ocassion", "Ocasion"],
        correctAnswer: "Occasion",
        explanation: "The correct spelling is 'Occasion' with two 'c's and one 's'.",
        difficulty: "easy",
        points: 1,
        tags: ["verbal", "spelling"]
      },
      {
        question: "Choose the word that best completes: The evidence was __ enough to convict.",
        type: "multiple-choice",
        options: ["Sufficient", "Deficient", "Ancient", "Patient"],
        correctAnswer: "Sufficient",
        explanation: "Sufficient means adequate or enough, which fits the context of having enough evidence.",
        difficulty: "medium",
        points: 2,
        tags: ["verbal", "vocabulary", "context"]
      }
    ],
    coding: [
      {
        question: "What is the time complexity of accessing an element in an array by index?",
        type: "multiple-choice",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctAnswer: "O(1)",
        explanation: "Array access by index is constant time O(1) as it's a direct memory access.",
        difficulty: "easy",
        points: 1,
        tags: ["coding", "complexity", "arrays"]
      },
      {
        question: "Which data structure uses FIFO (First In First Out)?",
        type: "multiple-choice",
        options: ["Stack", "Queue", "Tree", "Graph"],
        correctAnswer: "Queue",
        explanation: "A queue follows FIFO principle where the first element added is the first one removed.",
        difficulty: "easy",
        points: 1,
        tags: ["coding", "data-structures", "queue"]
      },
      {
        question: "What is the time complexity of binary search?",
        type: "multiple-choice",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctAnswer: "O(log n)",
        explanation: "Binary search divides the search space in half each iteration, resulting in O(log n) complexity.",
        difficulty: "medium",
        points: 2,
        tags: ["coding", "algorithms", "search"]
      },
      {
        question: "Which sorting algorithm has the best average-case time complexity?",
        type: "multiple-choice",
        options: ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
        correctAnswer: "Merge Sort",
        explanation: "Merge Sort has O(n log n) average-case complexity, which is better than O(n²) algorithms like Bubble Sort.",
        difficulty: "medium",
        points: 2,
        tags: ["coding", "algorithms", "sorting"]
      },
      {
        question: "What does the 'static' keyword mean in programming?",
        type: "multiple-choice",
        options: [
          "Variable that cannot change",
          "Belongs to the class rather than instance",
          "Private variable",
          "Constant value"
        ],
        correctAnswer: "Belongs to the class rather than instance",
        explanation: "Static members belong to the class itself rather than to any specific instance of the class.",
        difficulty: "medium",
        points: 2,
        tags: ["coding", "oop", "static"]
      },
      {
        question: "Which data structure would you use to implement undo functionality?",
        type: "multiple-choice",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: "Stack",
        explanation: "Stack's LIFO (Last In First Out) property makes it perfect for undo functionality.",
        difficulty: "easy",
        points: 1,
        tags: ["coding", "data-structures", "stack"]
      }
    ]
  };

  const questions = fallbackQuestions[category] || fallbackQuestions.technical;
  return questions.slice(0, Math.min(count, questions.length));
};
