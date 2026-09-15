import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import resumeScannerRoutes from './routes/resumeScannerRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

dotenv.config();
const app = express();

// Trust proxy when deployed (Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Connect to database
connectDB();

// Security
app.use(helmet());

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://crackiitai.vercel.app',
    ].filter(Boolean);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ── Body parsing ──────────────────────────────────────────────────────────────
// Razorpay webhook needs raw body to verify HMAC signature.
app.use((req, res, next) => {
  if (req.path === '/api/billing/webhook') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        req.body = JSON.parse(data);
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.path === '/health' ||
    req.path === '/api/health' ||
    req.path === '/' ||
    req.path.startsWith('/api/interview/voice/'),
});
app.use('/api', limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/resume-scanner', resumeScannerRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CrackIt AI API',
    version: '2.0.0',
    status: 'running',
    frontend: process.env.CLIENT_URL,
  });
});

// Health checks
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});
