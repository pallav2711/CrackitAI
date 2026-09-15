import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import resumeScannerRoutes from './routes/resumeScannerRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import mockTestRoutes from './routes/testRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiMentorRoutes from './routes/aiMentorRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import aiPrepRoutes from './routes/aiPrep.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
const app = express();

// Trust proxy when deployed (for services like Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Connect to database
connectDB();

// Middleware
app.use(helmet());
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://crackiitai.vercel.app'
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ── Body parsing ──────────────────────────────────────────────────────────────
// The Razorpay webhook endpoint needs the RAW body string to verify the HMAC
// signature. express.json() parses it and loses the original bytes.
// We capture the raw body here for use inside handleWebhook.
app.use((req, res, next) => {
  if (req.path === '/api/billing/webhook') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        req.body = JSON.parse(data);
        // Attach raw string so the webhook handler can verify the signature
        // against the exact bytes Razorpay signed.
        req.rawBody = data;
      } catch {
        req.body = {};
        req.rawBody = data;
      }
      next();
    });
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
// Rate limiting (more lenient in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip health checks AND all voice interview routes (they have their own credit gate)
  skip: (req) => {
    return (
      req.path === '/health' ||
      req.path === '/api/health' ||
      req.path === '/' ||
      req.path.startsWith('/api/interview/voice/')
    );
  },
});
app.use('/api', limiter);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resumes', resumeRoutes); // Alias for plural
app.use('/api/resume-scanner', resumeScannerRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/interviews', interviewRoutes); // Alias for plural
app.use('/api/tests', mockTestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai-mentor', aiMentorRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/ai-prep', aiPrepRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'CrackIt AI API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to CrackIt AI Backend API',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/health'
    },
    frontend: process.env.CLIENT_URL
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    trustProxy: app.get('trust proxy')
  });
});

// Quick database status check
app.get('/api/status', async (req, res) => {
  try {
    const Company = (await import('./models/Company.js')).default;
    const Test = (await import('./models/Test.js')).default;
    
    const [companyCount, testCount] = await Promise.all([
      Company.countDocuments(),
      Test.countDocuments()
    ]);
    
    res.json({
      status: 'OK',
      database: {
        companies: companyCount,
        tests: testCount,
        initialized: companyCount > 0 && testCount > 0
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date()
    });
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🔒 Trust Proxy: ${app.get('trust proxy')}`);
  console.log(`📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});
