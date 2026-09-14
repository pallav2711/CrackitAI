# 🚀 CrackIt AI - AI Career Success Platform

**End-to-End Job Preparation SaaS Platform**

A comprehensive MERN stack application that helps students crack their dream jobs with AI-powered resume building, mock interviews, and personalized learning paths.

---

## ✨ Features

### Core Features
- ✅ **AI Resume Builder** - Create ATS-optimized resumes with professional templates
- ✅ **Resume Scanner** - Get instant ATS score and improvement suggestions
- ✅ **Mock AI Interviews** - Practice HR, technical, and company-specific interviews
- ✅ **Mock Tests** - Aptitude, coding, logical reasoning, and domain tests
- ✅ **Company-wise Prep** - Prepare for specific companies (Google, Amazon, TCS, etc.)
- ✅ **AI Career Mentor** - 24/7 AI assistant for guidance and daily tasks
- ✅ **Progress Dashboard** - Track your placement readiness score
- ✅ **Leaderboard** - Compete with peers and track rankings
- ✅ **Analytics** - Detailed performance insights and reports

### Technical Features
- 🔐 Secure authentication with JWT
- 💳 Payment integration (Razorpay)
- 📊 Real-time analytics and progress tracking
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast and optimized performance
- 🛡️ Security headers with Helmet
- 🚦 Rate limiting for API protection

---

## 🛠️ Tech Stack

### Frontend
- React.js 18 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- React Router for navigation
- Axios for API calls
- Chart.js & Recharts for data visualization

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- OpenAI API for AI features
- Razorpay for payments

---

## 📦 Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB (Atlas or local)
- OpenAI API key
- Razorpay account (for payments)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd crackit-ai

# Install all dependencies
npm run install-all

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit .env files with your credentials

# Run in development mode
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 🔧 Environment Configuration

### Backend (server/.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-min-32-characters
OPENAI_API_KEY=your-openai-api-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
CLIENT_URL=http://localhost:3000
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your-razorpay-key
```

See `.env.example` files for complete configuration options.

---

## 📁 Project Structure

```
crackit-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── store/         # Zustand state management
│   │   └── hooks/         # Custom React hooks
│   └── package.json
│
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── package.json
│
├── e2e-tests/            # End-to-end tests (optional)
├── DEPLOYMENT.md         # Deployment guide
├── PRODUCTION_CHECKLIST.md  # Pre-deployment checklist
└── README.md             # This file
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
```bash
cd client
npm run build
vercel --prod
```

**Backend (Railway):**
```bash
cd server
railway up
```

### Recommended Platforms
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Railway, Render, AWS Elastic Beanstalk, or DigitalOcean
- **Database**: MongoDB Atlas

---

## 📋 Production Checklist

Before deploying to production, review [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md):

- [ ] Environment variables configured
- [ ] Security settings enabled
- [ ] Database backups configured
- [ ] SSL certificate installed
- [ ] Error tracking set up
- [ ] Performance monitoring enabled

---

## 💰 Pricing Plans

### For Students (B2C)
- **Free** - ₹0/month - Basic features
- **Basic** - ₹199/month - Mock tests + interviews
- **Pro** - ₹499/month - Full access with AI features
- **Annual** - ₹1,499/year - Save 75%

### For Colleges (B2B)
- Custom pricing based on student count
- Bulk licenses: ₹50,000 - ₹5,00,000/year
- Dedicated support and analytics

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific tests
npm run test:server    # Backend tests
npm run test:client    # Frontend tests
npm run test:e2e       # End-to-end tests (optional)
```

---

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resume
- `POST /api/resume` - Create resume
- `GET /api/resume` - Get user resumes
- `POST /api/resume-scanner/scan` - Scan resume

### Interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews` - Get user interviews
- `POST /api/interviews/:id/submit` - Submit interview

### Tests
- `GET /api/tests` - Get available tests
- `POST /api/tests/start` - Start test
- `POST /api/tests/:id/submit` - Submit test

See full API documentation in the `/docs` folder (coming soon).

---

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js security headers
- Input validation and sanitization
- CORS configuration
- File upload restrictions

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📧 Support

- **Email**: pallavkanani27@mail.com
- **Website**: https://crackit.ai
- **Documentation**: https://docs.crackit.ai

---

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- MongoDB for database solutions
- React and Node.js communities
- All contributors and supporters

---

**Built with ❤️ to help students achieve their career goals**
