import Resume from '../models/Resume.js';

// Get all resumes for a user
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select('title template atsScore lastModified')
      .sort({ lastModified: -1 });
    
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific resume
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new resume
export const createResume = async (req, res) => {
  try {
    const resumeData = {
      userId: req.user.id,
      title: req.body.title || 'My Resume',
      template: req.body.template || 'modern',
      personalInfo: {
        fullName: req.user.name || '',
        email: req.user.email || '',
        ...req.body.personalInfo
      }
    };
    
    const resume = new Resume(resumeData);
    await resume.save();
    
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a resume
export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
        resume[key] = req.body[key];
      }
    });
    
    // Recalculate ATS score
    resume.calculateATSScore();
    
    await resume.save();
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a resume
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Duplicate a resume
export const duplicateResume = async (req, res) => {
  try {
    const originalResume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!originalResume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const resumeData = originalResume.toObject();
    delete resumeData._id;
    delete resumeData.createdAt;
    delete resumeData.updatedAt;
    resumeData.title = `${resumeData.title} (Copy)`;
    
    const newResume = new Resume(resumeData);
    await newResume.save();
    
    res.status(201).json(newResume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ATS analysis
export const getATSAnalysis = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const score = resume.calculateATSScore();
    
    const analysis = {
      score,
      suggestions: [],
      strengths: [],
      weaknesses: []
    };
    
    // Analyze and provide suggestions
    if (!resume.personalInfo.summary) {
      analysis.suggestions.push('Add a professional summary to introduce yourself');
      analysis.weaknesses.push('Missing professional summary');
    } else {
      analysis.strengths.push('Has professional summary');
    }
    
    if (resume.experience.length === 0) {
      analysis.suggestions.push('Add work experience to showcase your background');
      analysis.weaknesses.push('No work experience listed');
    } else {
      analysis.strengths.push(`${resume.experience.length} work experience entries`);
    }
    
    if (resume.education.length === 0) {
      analysis.suggestions.push('Add your education background');
      analysis.weaknesses.push('No education listed');
    } else {
      analysis.strengths.push('Education section completed');
    }
    
    const totalSkills = (resume.skills.technical?.length || 0) + 
                       (resume.skills.soft?.length || 0) + 
                       (resume.skills.tools?.length || 0);
    
    if (totalSkills < 5) {
      analysis.suggestions.push('Add more skills to improve ATS matching');
      analysis.weaknesses.push('Limited skills listed');
    } else {
      analysis.strengths.push(`${totalSkills} skills listed`);
    }
    
    if (resume.projects.length === 0) {
      analysis.suggestions.push('Add projects to demonstrate practical experience');
    } else {
      analysis.strengths.push(`${resume.projects.length} projects showcased`);
    }
    
    if (!resume.personalInfo.phone) {
      analysis.suggestions.push('Add phone number for better contact options');
    }
    
    if (!resume.personalInfo.linkedin && !resume.personalInfo.github) {
      analysis.suggestions.push('Add LinkedIn or GitHub profile to strengthen your presence');
    }
    
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
