import AIPrepPlan from '../models/AIPrepPlan.js';
import AIPrepService from '../services/aiPrepService.js';

// Get all companies
export const getCompanies = async (req, res) => {
  try {
    const { search, industry, difficulty, region } = req.query;
    const companies = AIPrepService.getCompanies({ search, industry, difficulty, region });
    
    res.json({
      success: true,
      data: {
        companies,
        total: companies.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new prep plan
export const createPlan = async (req, res) => {
  try {
    console.log('Create plan request received');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const userId = req.user._id;
    const {
      companyName,
      companyIndustry,
      companyLogo,
      targetRole,
      experienceLevel,
      duration,
      focusAreas,
      studyIntensity,
      availableHours,
      preferredTime,
      interviewDate
    } = req.body;



    // Validate required fields
    if (!companyName || !targetRole || !duration || !focusAreas || focusAreas.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    console.log('Generating daily schedule...');
    const dailySchedule = AIPrepService.generateDailySchedule({
      duration,
      focusAreas,
      studyIntensity,
      availableHours,
      targetRole,
      companyName
    });
    console.log('Daily schedule generated:', dailySchedule.length, 'days');
    console.log('First day sample:', JSON.stringify(dailySchedule[0], null, 2));

    console.log('Generating weekly assessments...');
    const weeklyAssessments = AIPrepService.generateWeeklyAssessments(
      duration,
      focusAreas,
      targetRole,
      companyName
    );
    console.log('Weekly assessments generated:', weeklyAssessments.length, 'weeks');
    console.log('First assessment sample:', JSON.stringify(weeklyAssessments[0], null, 2));

    console.log('Generating AI insights...');
    const aiGeneratedContent = AIPrepService.generateAIInsights(
      companyName,
      targetRole,
      focusAreas
    );

    // Create plan
    const plan = new AIPrepPlan({
      userId,
      companyName,
      companyIndustry,
      companyLogo,
      targetRole,
      experienceLevel,
      duration,
      focusAreas,
      studyIntensity,
      availableHours,
      preferredTime,
      interviewDate,
      dailySchedule,
      weeklyAssessments,
      aiGeneratedContent,
      totalTasks: dailySchedule.reduce((acc, day) => acc + day.tasks.length, 0)
    });

    console.log('Saving plan to database...');
    await plan.save();

    console.log('Plan created successfully:', plan._id);

    res.status(201).json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    console.error('Create plan error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Validation errors:', JSON.stringify(messages.slice(0, 5), null, 2));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: messages.map(e => `${e.field}: ${e.message}`)
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create plan',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user's plans
export const getPlans = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;
    
    const query = { userId };
    if (status) query.status = status;

    const plans = await AIPrepPlan.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { plans }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single plan
export const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const plan = await AIPrepPlan.findOne({ _id: id, userId });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update task completion
export const updateTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, taskId, completed } = req.body;
    const userId = req.user._id;

    console.log('=== UPDATE TASK SERVER ===');
    console.log('Day:', day, 'TaskId:', taskId, 'Completed:', completed);

    const plan = await AIPrepPlan.findOne({ _id: id, userId });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    console.log('Plan found, updating task...');

    // Find and update task
    const daySchedule = plan.dailySchedule.find(d => d.day === day);
    if (daySchedule) {
      console.log('Day schedule found, tasks count:', daySchedule.tasks.length);
      
      const task = daySchedule.tasks.find(t => t.id === taskId);
      if (task) {
        console.log('Task found, current completed status:', task.completed);
        task.completed = completed;
        task.completedAt = completed ? new Date() : null;
        console.log('Task updated, new completed status:', task.completed);
        
        // Update study time
        if (completed) {
          plan.totalStudyTime += task.duration || 0;
        }
        
        // Check if all tasks in day are completed
        daySchedule.completed = daySchedule.tasks.every(t => t.completed);
        
        // Update last activity
        plan.lastActivityDate = new Date();
        
        // Update progress
        plan.updateProgress();
        
        // Mark the path as modified to ensure Mongoose saves it
        plan.markModified('dailySchedule');
        
        await plan.save();
        
        console.log('Plan saved successfully');
        console.log('All tasks in day:', daySchedule.tasks.map(t => ({ id: t.id, completed: t.completed })));
      } else {
        console.log('Task NOT found with id:', taskId);
      }
    } else {
      console.log('Day schedule NOT found for day:', day);
    }

    res.json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit assessment
export const submitAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { week, answers } = req.body;
    const userId = req.user._id;

    const plan = await AIPrepPlan.findOne({ _id: id, userId });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Find assessment
    const assessment = plan.weeklyAssessments.find(a => a.week === week);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Grade assessment
    let score = 0;
    assessment.questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        question.userAnswer = answer;
        
        if (question.type === 'mcq') {
          question.isCorrect = answer === question.correctAnswer;
          if (question.isCorrect) {
            score += question.points;
          }
        } else {
          // For coding and essay, give partial credit (would be manual in real app)
          score += question.points * 0.7; // 70% credit for attempt
        }
      }
    });

    assessment.score = score;
    assessment.status = 'completed';
    assessment.completedAt = new Date();
    assessment.feedback = generateFeedback(score, assessment.totalPoints);

    // Update progress
    plan.updateProgress();
    
    await plan.save();

    res.json({
      success: true,
      data: { assessment, plan }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate feedback based on score
export const generateFeedback = (score, totalPoints) => {
  const percentage = (score / totalPoints) * 100;
  
  if (percentage >= 90) {
    return 'Excellent work! You have a strong grasp of the concepts. Keep up the great work!';
  } else if (percentage >= 75) {
    return 'Good job! You understand most concepts well. Review the areas where you lost points.';
  } else if (percentage >= 60) {
    return 'Fair performance. Consider reviewing the topics covered this week and practicing more.';
  } else {
    return 'You may need more practice. Review the study materials and try additional problems.';
  }
};

// Update plan status
export const updatePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const plan = await AIPrepPlan.findOne({ _id: id, userId });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    plan.status = status;
    await plan.save();

    res.json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get plan analytics
export const getPlanAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const plan = await AIPrepPlan.findOne({ _id: id, userId });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const analytics = {
      overallProgress: plan.overallProgress,
      completedDays: plan.completedDays,
      totalDays: plan.duration,
      completedTasks: plan.completedTasks,
      totalTasks: plan.totalTasks,
      studyStreak: plan.studyStreak,
      totalStudyTime: plan.totalStudyTime,
      averageScore: plan.averageScore,
      assessmentsCompleted: plan.weeklyAssessments.filter(a => a.status === 'completed').length,
      totalAssessments: plan.weeklyAssessments.length,
      daysRemaining: Math.max(0, plan.duration - plan.completedDays),
      onTrack: plan.completedDays >= (plan.currentDay - 1)
    };

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
