import express from 'express';
import mongoose from 'mongoose';
import { performance } from 'perf_hooks';

const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Detailed health check
router.get('/health/detailed', async (req, res) => {
  const startTime = performance.now();
  
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {}
  };

  // Database connectivity check
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    health.checks.database = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      state: dbStates[dbState],
      responseTime: null
    };

    if (dbState === 1) {
      const dbStart = performance.now();
      await mongoose.connection.db.admin().ping();
      health.checks.database.responseTime = `${(performance.now() - dbStart).toFixed(2)}ms`;
    }
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      error: error.message
    };
    health.status = 'DEGRADED';
  }

  // Memory usage check
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning', // 500MB threshold
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
  };

  // CPU usage check (simplified)
  const cpuUsage = process.cpuUsage();
  health.checks.cpu = {
    status: 'healthy',
    user: cpuUsage.user,
    system: cpuUsage.system
  };

  // Response time
  health.responseTime = `${(performance.now() - startTime).toFixed(2)}ms`;

  // Overall status
  const unhealthyChecks = Object.values(health.checks).filter(check => check.status === 'unhealthy');
  if (unhealthyChecks.length > 0) {
    health.status = 'UNHEALTHY';
    res.status(503);
  } else {
    const warningChecks = Object.values(health.checks).filter(check => check.status === 'warning');
    if (warningChecks.length > 0) {
      health.status = 'DEGRADED';
    }
  }

  res.json(health);
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if database is ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'NOT_READY',
        message: 'Database not connected'
      });
    }

    // Perform a simple database operation
    await mongoose.connection.db.admin().ping();

    res.json({
      status: 'READY',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      message: error.message
    });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  res.json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Metrics endpoint
router.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    eventLoop: {
      delay: process.hrtime.bigint ? Number(process.hrtime.bigint()) : null
    },
    activeHandles: process._getActiveHandles().length,
    activeRequests: process._getActiveRequests().length
  };

  res.json(metrics);
});

export default router;