import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create write streams for different log levels
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

// Custom token for request body (sanitized)
morgan.token('body', (req) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    return JSON.stringify(sanitizedBody);
  }
  return '-';
});

// Define log formats
const accessFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms';

const errorFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms :body';

// Middleware for logging successful requests
export const accessLogger = morgan(accessFormat, {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400
});

// Middleware for logging errors
export const errorLogger = morgan(errorFormat, {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
});

// Console logger for development
export const consoleLogger = morgan('dev');

// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`🐌 Slow request detected: ${req.method} ${req.url} - ${duration}ms`);
    }
    
    // Log memory usage for heavy requests
    if (duration > 500) {
      const memUsage = process.memoryUsage();
      console.log(`📊 Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
    }
  });
  
  next();
};

// Request size monitoring
export const requestSizeMonitor = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  
  // Log large requests (> 10MB)
  if (contentLength > 10 * 1024 * 1024) {
    console.warn(`📦 Large request detected: ${req.method} ${req.url} - ${Math.round(contentLength / 1024 / 1024)} MB`);
  }
  
  next();
};