import mongoose from 'mongoose';
import Test from '../models/Test.js';
import TestAttempt from '../models/TestAttempt.js';
import User from '../models/User.js';
import { generateCompleteTest, getFallbackTestQuestions } from '../services/aiTestService.js';

// Get all available tests
export const getAllTests = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const tests = await Test.find(filter)
      .select('-questions.correctAnswer -questions.explanation')
      .sort({ createdAt: -1 });
    
    // Get user's highest score for each test
    const testsWithScores = await Promise.all(
      tests.map(async (test) => {
        const testObj = test.toObject();
        
        // Find highest score for this test by this user
        const bestAttempt = await TestAttempt.findOne({
          userId: req.user.id,
          testId: test._id,
          status: 'completed'
        })
          .sort({ percentage: -1 })
          .select('percentage');
        
        testObj.highestScore = bestAttempt ? bestAttempt.percentage : 0;
        
        return testObj;
      })
    );
    
    res.json(testsWithScores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get test by ID (without answers for starting test)
export const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // For dynamic tests, check if user has an in-progress attempt with questions
    if (test.isDynamic) {
      const attempt = await TestAttempt.findOne({
        userId: req.user.id,
        testId: test._id,
        status: 'in-progress'
      });
      
      if (attempt && attempt.dynamicQuestions && attempt.dynamicQuestions.length > 0) {
        // Return test with dynamic questions (without answers)
        const testObj = test.toObject();
        testObj.questions = attempt.dynamicQuestions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options,
          difficulty: q.difficulty,
          points: q.points,
          tags: q.tags
          // correctAnswer and explanation excluded
        }));
        return res.json(testObj);
      }
    }
    
    // For regular tests or dynamic tests without attempt, return without answers
    const testObj = test.toObject();
    testObj.questions = test.questions.map(q => ({
      _id: q._id,
      question: q.question,
      type: q.type,
      options: q.options,
      difficulty: q.difficulty,
      points: q.points,
      tags: q.tags
      // correctAnswer and explanation excluded
    }));
    
    res.json(testObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start a test attempt
export const startTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // For dynamic tests, always abandon old in-progress attempts and create new one
    // This ensures fresh questions every time
    if (test.isDynamic) {
      // Mark any existing in-progress attempts as abandoned
      await TestAttempt.updateMany(
        {
          userId: req.user.id,
          testId: test._id,
          status: 'in-progress'
        },
        {
          status: 'abandoned'
        }
      );
      console.log('🎲 Dynamic test: Creating fresh attempt with new questions');
    } else {
      // For regular tests, check if user has an in-progress attempt
      const existingAttempt = await TestAttempt.findOne({
        userId: req.user.id,
        testId: test._id,
        status: 'in-progress'
      });
      
      if (existingAttempt) {
        return res.json(existingAttempt);
      }
    }
    
    // For dynamic tests, generate new questions each time
    let questionsForAttempt = test.questions;
    
    if (test.isDynamic) {
      console.log(`🎲 Generating dynamic questions for ${test.category} test...`);
      
      try {
        // Try AI generation first
        const { generateTestQuestions } = await import('../services/aiTestService.js');
        const aiQuestions = await generateTestQuestions({
          category: test.category,
          difficulty: test.difficulty,
          questionCount: test.questionCount || 10,
          topic: test.topic
        });
        questionsForAttempt = aiQuestions;
        console.log(`✅ Generated ${aiQuestions.length} AI questions`);
      } catch (aiError) {
        console.log('AI generation failed, using fallback questions');
        // Fallback to random selection from question bank
        const { getFallbackTestQuestions } = await import('../services/aiTestService.js');
        questionsForAttempt = getFallbackTestQuestions(
          test.category,
          test.difficulty,
          test.questionCount || 10
        );
        
        // Shuffle fallback questions for variety
        questionsForAttempt = questionsForAttempt.sort(() => Math.random() - 0.5);
      }
    }
    
    // Create new attempt
    const attemptData = {
      userId: req.user.id,
      testId: test._id,
      answers: questionsForAttempt.map(q => ({
        questionId: q._id || new mongoose.Types.ObjectId(),
        userAnswer: null,
        timeSpent: 0
      }))
    };
    
    // For dynamic tests, store the generated questions as plain objects
    if (test.isDynamic && questionsForAttempt.length > 0) {
      attemptData.dynamicQuestions = questionsForAttempt.map(q => ({
        question: q.question,
        type: q.type || 'multiple-choice',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        points: q.points || 1,
        tags: q.tags || []
      }));
    }
    
    const attempt = new TestAttempt(attemptData);
    await attempt.save();
    
    res.json(attempt);
  } catch (error) {
    console.error('Error starting test:', error);
    res.status(500).json({ error: error.message });
  }
};

// Submit answer for a question
export const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, answer, timeSpent } = req.body;
    
    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user.id,
      status: 'in-progress'
    });
    
    if (!attempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }
    
    // Update answer
    const answerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );
    
    if (answerIndex !== -1) {
      attempt.answers[answerIndex].userAnswer = answer;
      attempt.answers[answerIndex].timeSpent = timeSpent;
      await attempt.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit complete test
export const submitTest = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    
    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user.id
    });
    
    if (!attempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }
    
    const test = await Test.findById(attempt.testId);
    
    // Update all answers
    answers.forEach(({ questionId, answer, timeSpent }) => {
      const answerIndex = attempt.answers.findIndex(
        a => a.questionId.toString() === questionId
      );
      if (answerIndex !== -1) {
        attempt.answers[answerIndex].userAnswer = answer;
        attempt.answers[answerIndex].timeSpent = timeSpent;
      }
    });
    
    // Calculate results
    attempt.endTime = new Date();
    attempt.duration = Math.floor((attempt.endTime - attempt.startTime) / 1000);
    attempt.status = 'completed';
    attempt.calculateResults(test);
    
    await attempt.save();
    
    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      user.stats.testsCompleted = (user.stats.testsCompleted || 0) + 1;
      
      // Update average test score
      const allAttempts = await TestAttempt.find({ 
        userId: req.user.id, 
        status: 'completed' 
      });
      const avgScore = allAttempts.reduce((sum, a) => sum + a.percentage, 0) / allAttempts.length;
      
      // Recalculate readiness score
      const resumeScore = user.stats.resumeScore || 0;
      const interviewCount = user.stats.interviewsTaken || 0;
      user.stats.readinessScore = Math.round((resumeScore * 0.3 + avgScore * 0.4 + (interviewCount > 0 ? 70 : 0) * 0.3));
      
      await user.save();
    }
    
    // Return results with correct answers
    const results = await TestAttempt.findById(attempt._id)
      .populate({
        path: 'testId',
        select: 'title questions'
      });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get test results
export const getTestResults = async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.attemptId,
      userId: req.user.id
    }).populate({
      path: 'testId',
      select: 'title questions category difficulty'
    });
    
    if (!attempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }
    
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's test history
export const getTestHistory = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({
      userId: req.user.id,
      status: 'completed'
    })
      .populate('testId', 'title category difficulty')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({
      userId: req.user.id,
      status: 'completed'
    });
    
    const stats = {
      totalTests: attempts.length,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 100,
      testsByCategory: {},
      recentTests: []
    };
    
    if (attempts.length > 0) {
      const scores = attempts.map(a => a.percentage);
      stats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      stats.highestScore = Math.max(...scores);
      stats.lowestScore = Math.min(...scores);
      
      // Group by category
      attempts.forEach(attempt => {
        const category = attempt.testId?.category || 'unknown';
        if (!stats.testsByCategory[category]) {
          stats.testsByCategory[category] = {
            count: 0,
            averageScore: 0,
            scores: []
          };
        }
        stats.testsByCategory[category].count++;
        stats.testsByCategory[category].scores.push(attempt.percentage);
      });
      
      // Calculate category averages
      Object.keys(stats.testsByCategory).forEach(category => {
        const cat = stats.testsByCategory[category];
        cat.averageScore = Math.round(
          cat.scores.reduce((a, b) => a + b, 0) / cat.scores.length
        );
        delete cat.scores;
      });
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create test with AI generation
export const createTest = async (req, res) => {
  try {
    const { category, difficulty, questionCount, duration, topic, useAI = true } = req.body;

    let testData;

    // Try AI generation first if enabled
    if (useAI && process.env.OPENAI_API_KEY) {
      try {
        console.log('Generating test with AI...');
        testData = await generateCompleteTest({
          category,
          difficulty: difficulty || 'medium',
          questionCount: questionCount || 10,
          duration,
          topic
        });
        console.log('AI test generation successful');
      } catch (aiError) {
        console.error('AI test generation failed:', aiError.message);
        // Fall through to fallback
      }
    }

    // Fallback to manual test data if AI fails or is disabled
    if (!testData) {
      console.log('Using fallback test questions');
      const questions = getFallbackTestQuestions(
        category,
        difficulty || 'medium',
        questionCount || 10
      );

      testData = {
        title: req.body.title || `${category} Test - ${difficulty || 'medium'}`,
        description: req.body.description || `Test your ${category} skills`,
        category,
        difficulty: difficulty || 'medium',
        duration: duration || Math.ceil(questions.length * 1.5),
        questions,
        passingScore: 60,
        createdBy: 'system',
        aiGenerated: false
      };
    }

    const test = new Test(testData);
    await test.save();
    
    res.status(201).json(test);
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate AI test on-demand
export const generateAITest = async (req, res) => {
  try {
    const { category, difficulty, questionCount, duration, topic } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    console.log(`Generating AI test: ${category}, ${difficulty || 'medium'}, ${questionCount || 10} questions`);

    let testData;

    // Try AI generation
    try {
      testData = await generateCompleteTest({
        category,
        difficulty: difficulty || 'medium',
        questionCount: questionCount || 10,
        duration,
        topic
      });
      console.log('AI test generated successfully');
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError.message);
      
      // Fallback to curated questions
      const questions = getFallbackTestQuestions(
        category,
        difficulty || 'medium',
        questionCount || 10
      );

      testData = {
        title: topic 
          ? `${category}: ${topic} (${difficulty || 'medium'})` 
          : `${category} Test - ${difficulty || 'medium'}`,
        description: `Test your ${category} skills${topic ? ` with focus on ${topic}` : ''}`,
        category,
        difficulty: difficulty || 'medium',
        duration: duration || Math.ceil(questions.length * 1.5),
        questions,
        passingScore: 60,
        createdBy: 'system',
        aiGenerated: false
      };
    }

    // Save the test
    const test = new Test(testData);
    await test.save();

    res.status(201).json(test);
  } catch (error) {
    console.error('Error generating AI test:', error);
    res.status(500).json({ error: error.message });
  }
};
