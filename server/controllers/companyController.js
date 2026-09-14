import Company from '../models/Company.js';
import CompanyQuestion from '../models/CompanyQuestion.js';
import UserCompanyProgress from '../models/UserCompanyProgress.js';
import UserActivity from '../models/UserActivity.js';

// Get all companies with filters and search
export const getCompanies = async (req, res) => {
  try {
    const {
      search,
      industry,
      difficulty,
      sortBy = 'popularity',
      page = 1,
      limit = 12,
      featured
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (industry && industry !== 'all') {
      query.industry = industry;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'popularity':
        sort = { 'stats.popularityScore': -1, 'stats.totalQuestions': -1 };
        break;
      case 'questions':
        sort = { 'stats.totalQuestions': -1 };
        break;
      case 'rating':
        sort = { 'stats.averageRating': -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { 'stats.popularityScore': -1 };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [companies, total] = await Promise.all([
      Company.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-tips -news -seoTitle -seoDescription -keywords'),
      Company.countDocuments(query)
    ]);

    // If no companies in database, use AI prep service as fallback
    if (companies.length === 0) {
      console.log('No companies found in database, using AI fallback service...');
      try {
        const { default: AIPrepService } = await import('../services/aiPrepService.js');
        
        if (!AIPrepService || !AIPrepService.getCompanies) {
          throw new Error('AI Prep Service not available');
        }

        const aiCompanies = AIPrepService.getCompanies({
          search,
          industry: industry === 'all' ? null : industry,
          difficulty: difficulty === 'all' ? null : difficulty
        });

        console.log(`AI fallback returned ${aiCompanies.length} companies`);

        // Apply pagination to AI companies
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedCompanies = aiCompanies.slice(startIndex, endIndex);

        return res.json({
          success: true,
          data: {
            companies: paginatedCompanies,
            pagination: {
              current: parseInt(page),
              total: Math.ceil(aiCompanies.length / limit),
              count: paginatedCompanies.length,
              totalItems: aiCompanies.length
            }
          }
        });
      } catch (aiError) {
        console.error('AI fallback failed:', aiError);
        console.log('Returning empty companies array');
        return res.json({
          success: true,
          data: {
            companies: [],
            pagination: {
              current: 1,
              total: 0,
              count: 0,
              totalItems: 0
            }
          }
        });
      }
    }

    // Get user progress for each company if user is authenticated
    let companiesWithProgress = companies;
    if (req.user) {
      const companyIds = companies.map(c => c._id);
      const userProgress = await UserCompanyProgress.find({
        userId: req.user.id,
        companyId: { $in: companyIds }
      }).select('companyId overallProgress questionsProgress.attempted questionsProgress.correct');

      const progressMap = {};
      userProgress.forEach(p => {
        progressMap[p.companyId.toString()] = {
          progress: p.overallProgress,
          attempted: p.questionsProgress.attempted,
          correct: p.questionsProgress.correct
        };
      });

      companiesWithProgress = companies.map(company => ({
        ...company.toObject(),
        userProgress: progressMap[company._id.toString()] || {
          progress: 0,
          attempted: 0,
          correct: 0
        }
      }));
    }

    res.json({
      success: true,
      data: {
        companies: companiesWithProgress,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: companies.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch companies' });
  }
};

// Get single company details
export const getCompanyDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const company = await Company.findOne({ slug, isActive: true });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Get questions count by category and difficulty
    const [questionStats, userProgress] = await Promise.all([
      CompanyQuestion.aggregate([
        { $match: { companyId: company._id, isActive: true } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byDifficulty: {
              $push: {
                difficulty: '$difficulty',
                category: '$category',
                type: '$type'
              }
            }
          }
        }
      ]),
      req.user ? UserCompanyProgress.findOne({
        userId: req.user.id,
        companyId: company._id
      }) : null
    ]);

    // Process question statistics
    let processedStats = {
      total: 0,
      byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
      byCategory: {},
      byType: {}
    };

    if (questionStats.length > 0) {
      processedStats.total = questionStats[0].total;
      
      questionStats[0].byDifficulty.forEach(item => {
        processedStats.byDifficulty[item.difficulty]++;
        processedStats.byCategory[item.category] = (processedStats.byCategory[item.category] || 0) + 1;
        processedStats.byType[item.type] = (processedStats.byType[item.type] || 0) + 1;
      });
    }

    // Update company stats if needed
    if (company.stats.totalQuestions !== processedStats.total) {
      company.stats.totalQuestions = processedStats.total;
      await company.save();
    }

    res.json({
      success: true,
      data: {
        company: company.toObject(),
        questionStats: processedStats,
        userProgress: userProgress || null
      }
    });
  } catch (error) {
    console.error('Get company details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch company details' });
  }
};

// Get company questions
export const getCompanyQuestions = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      type,
      category,
      difficulty,
      sortBy = 'popularity',
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Find company
    const company = await Company.findOne({ slug, isActive: true }).select('_id name');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Build query
    const query = { companyId: company._id, isActive: true };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'popularity':
        sort = { 'stats.rating': -1, 'stats.totalAttempts': -1 };
        break;
      case 'difficulty':
        sort = { difficulty: 1, 'stats.rating': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'success_rate':
        sort = { 'stats.correctAttempts': -1 };
        break;
      default:
        sort = { 'stats.rating': -1 };
    }

    // Execute query
    const skip = (page - 1) * limit;
    const [questions, total] = await Promise.all([
      CompanyQuestion.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-answer -explanation -testCases -codeTemplate') // Hide answers initially
        .populate('createdBy', 'name'),
      CompanyQuestion.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        questions,
        company: { name: company.name, slug },
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: questions.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get company questions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
};

// Get single question with answer (for authenticated users)
export const getQuestionDetails = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const question = await CompanyQuestion.findById(questionId)
      .populate('companyId', 'name slug logo')
      .populate('createdBy', 'name');
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Track question view
    if (req.user) {
      await UserActivity.create({
        userId: req.user.id,
        date: new Date(),
        activityType: 'question_view',
        activityDetails: {
          questionId: question._id,
          companyId: question.companyId._id,
          type: question.type,
          difficulty: question.difficulty
        },
        points: 1
      });
    }

    res.json({
      success: true,
      data: { question }
    });
  } catch (error) {
    console.error('Get question details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch question details' });
  }
};

// Submit question answer
export const submitQuestionAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer, timeSpent } = req.body;
    const userId = req.user.id;

    const question = await CompanyQuestion.findById(questionId).populate('companyId');
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Check if answer is correct
    let isCorrect = false;
    let score = 0;

    if (question.type === 'Coding') {
      // For coding questions, run test cases (simplified)
      isCorrect = answer.trim() === question.answer.trim();
      score = isCorrect ? 100 : 0;
    } else if (question.options && question.options.length > 0) {
      // Multiple choice
      const correctOption = question.options.find(opt => opt.isCorrect);
      isCorrect = correctOption && correctOption.text === answer;
      score = isCorrect ? 100 : 0;
    } else {
      // Open-ended questions - basic keyword matching (in real app, use AI)
      const answerKeywords = question.answer.toLowerCase().split(' ');
      const userKeywords = answer.toLowerCase().split(' ');
      const matchCount = answerKeywords.filter(keyword => 
        userKeywords.some(userWord => userWord.includes(keyword))
      ).length;
      
      score = Math.round((matchCount / answerKeywords.length) * 100);
      isCorrect = score >= 70;
    }

    // Update question stats
    await question.updateStats(isCorrect, timeSpent);

    // Update user progress
    let userProgress = await UserCompanyProgress.findOne({
      userId,
      companyId: question.companyId._id
    });

    if (!userProgress) {
      // Create new progress record
      const totalQuestions = await CompanyQuestion.countDocuments({
        companyId: question.companyId._id,
        isActive: true
      });

      userProgress = new UserCompanyProgress({
        userId,
        companyId: question.companyId._id,
        questionsProgress: {
          total: totalQuestions,
          attempted: 1,
          correct: isCorrect ? 1 : 0
        }
      });
    } else {
      // Update existing progress
      userProgress.questionsProgress.attempted += 1;
      if (isCorrect) {
        userProgress.questionsProgress.correct += 1;
      }
    }

    // Update time spent
    userProgress.timeSpent.total += timeSpent;
    userProgress.timeSpent.bySession.push({
      date: new Date(),
      duration: timeSpent,
      questionsAttempted: 1,
      questionsCorrect: isCorrect ? 1 : 0
    });

    // Update streak
    await userProgress.updateStreak();
    await userProgress.updateProgress();

    // Check for milestones
    if (userProgress.questionsProgress.attempted === 1) {
      await userProgress.addMilestone('First Question', 'Attempted your first question');
    } else if (userProgress.questionsProgress.attempted === 10) {
      await userProgress.addMilestone('10 Questions', 'Attempted 10 questions');
    } else if (userProgress.questionsProgress.attempted === 50) {
      await userProgress.addMilestone('50 Questions', 'Attempted 50 questions');
    }

    if (isCorrect && score === 100) {
      await userProgress.addMilestone('Perfect Score', 'Got a perfect score');
    }

    // Track activity
    await UserActivity.create({
      userId,
      date: new Date(),
      activityType: 'question_attempt',
      activityDetails: {
        questionId: question._id,
        companyId: question.companyId._id,
        isCorrect,
        score,
        timeSpent,
        type: question.type,
        difficulty: question.difficulty
      },
      points: isCorrect ? (question.difficulty === 'Hard' ? 15 : question.difficulty === 'Medium' ? 10 : 5) : 2
    });

    res.json({
      success: true,
      data: {
        isCorrect,
        score,
        correctAnswer: question.answer,
        explanation: question.explanation,
        userProgress: {
          attempted: userProgress.questionsProgress.attempted,
          correct: userProgress.questionsProgress.correct,
          progress: userProgress.overallProgress,
          streak: userProgress.streak.current
        }
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit answer' });
  }
};

// Get user's company progress
export const getUserCompanyProgress = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const company = await Company.findOne({ slug, isActive: true }).select('_id name');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const progress = await UserCompanyProgress.findOne({
      userId,
      companyId: company._id
    }).populate('bookmarkedQuestions.questionId', 'question type difficulty');

    if (!progress) {
      // Create initial progress record
      const totalQuestions = await CompanyQuestion.countDocuments({
        companyId: company._id,
        isActive: true
      });

      const newProgress = new UserCompanyProgress({
        userId,
        companyId: company._id,
        questionsProgress: { total: totalQuestions }
      });
      
      await newProgress.save();
      
      return res.json({
        success: true,
        data: { progress: newProgress }
      });
    }

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress' });
  }
};

// Bookmark/unbookmark question
export const toggleBookmark = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { note } = req.body;
    const userId = req.user.id;

    const question = await CompanyQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    let progress = await UserCompanyProgress.findOne({
      userId,
      companyId: question.companyId
    });

    if (!progress) {
      // Create progress record if it doesn't exist
      const totalQuestions = await CompanyQuestion.countDocuments({
        companyId: question.companyId,
        isActive: true
      });

      progress = new UserCompanyProgress({
        userId,
        companyId: question.companyId,
        questionsProgress: { total: totalQuestions }
      });
    }

    // Check if already bookmarked
    const isBookmarked = progress.bookmarkedQuestions.some(
      b => b.questionId.toString() === questionId
    );

    if (isBookmarked) {
      await progress.removeBookmark(questionId);
    } else {
      await progress.bookmarkQuestion(questionId, note);
    }

    res.json({
      success: true,
      data: {
        isBookmarked: !isBookmarked,
        message: isBookmarked ? 'Bookmark removed' : 'Question bookmarked'
      }
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle bookmark' });
  }
};

// Get dashboard stats for companies
export const getCompanyDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's progress across all companies
    const userProgress = await UserCompanyProgress.find({ userId })
      .populate('companyId', 'name logo difficulty')
      .sort({ lastAccessed: -1 })
      .limit(10);

    // Get overall stats
    const totalStats = await UserCompanyProgress.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalCompanies: { $sum: 1 },
          totalQuestions: { $sum: '$questionsProgress.attempted' },
          totalCorrect: { $sum: '$questionsProgress.correct' },
          totalTimeSpent: { $sum: '$timeSpent.total' },
          avgProgress: { $avg: '$overallProgress' }
        }
      }
    ]);

    const stats = totalStats[0] || {
      totalCompanies: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      totalTimeSpent: 0,
      avgProgress: 0
    };

    // Get recent activity
    const recentActivity = await UserActivity.find({
      userId,
      activityType: { $in: ['question_attempt', 'question_view'] }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('activityDetails.companyId', 'name logo');

    res.json({
      success: true,
      data: {
        stats: {
          ...stats,
          accuracy: stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0
        },
        recentProgress: userProgress,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get company dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

// Get trending companies
export const getTrendingCompanies = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const companies = await Company.find({ isActive: true })
      .sort({ 'stats.popularityScore': -1, 'stats.totalQuestions': -1 })
      .limit(parseInt(limit))
      .select('name slug logo difficulty stats industry');

    res.json({
      success: true,
      data: { companies }
    });
  } catch (error) {
    console.error('Get trending companies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trending companies' });
  }
};

export default {
  getCompanies,
  getCompanyDetails,
  getCompanyQuestions,
  getQuestionDetails,
  submitQuestionAnswer,
  getUserCompanyProgress,
  toggleBookmark,
  getCompanyDashboardStats,
  getTrendingCompanies
};