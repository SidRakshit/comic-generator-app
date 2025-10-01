// Backend application startup

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('❌ Server will continue running, but this error should be fixed');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('❌ Server will continue running, but this error should be fixed');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

import express from 'express';
import cors from 'cors';
import { PORT, FRONTEND_URL } from './config';
import { API_CONFIG, SERVER_TIMEOUTS, REQUEST_LIMITS, API_ROUTES, API_BASE_PATH } from '@repo/common-types';
import mainApiRouter from './routes/index';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { getMetricsRegistry } from './utils/metrics';
const isProd = process.env.NODE_ENV === 'production';

// Dependencies loaded successfully

// Environment variables configured

const app = express();

try {
  // Global request logger (development only)
  if (!isProd) {
    app.use((req: any, res: any, next: any) => {
      console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  app.use(metricsMiddleware);

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl.startsWith(`${API_BASE_PATH}${API_ROUTES.WEBHOOKS.BASE}`)) {
      return next();
    }
    return express.json({ limit: REQUEST_LIMITS.JSON_BODY_LIMIT })(req, res, next);
  });
} catch (error) {
  console.error('[FATAL] Error setting up basic middleware:', error);
  process.exit(1);
}

try {
  // CORS Configuration
  if (FRONTEND_URL && FRONTEND_URL.length > 0) {
    const allowedOrigins = FRONTEND_URL.split(',').map(origin => origin.trim());
    
    // Add localhost for development
    if (!isProd) {
      allowedOrigins.push(...API_CONFIG.DEFAULT_FRONTEND_URLS);
    }

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, postman, etc.)
      if (!origin) {
        callback(null, true);
      } else if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        if (!isProd) {
          console.log(`[CORS] Blocked origin: ${origin}`);
        }
        callback(new Error(`CORS blocked: Origin ${origin} not allowed`), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true, // Enable if you're sending cookies/auth
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  };

    app.use(cors(corsOptions));
    
    // Explicit OPTIONS handler for Railway
    app.use((req: any, res: any, next: any) => {
      if (req.method === 'OPTIONS') {
        const origin = req.headers.origin;
        if (!origin || allowedOrigins.includes(origin)) {
          res.header('Access-Control-Allow-Origin', origin || '*');
          res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
          res.header('Access-Control-Allow-Credentials', 'true');
          res.sendStatus(200);
        } else {
          res.sendStatus(403);
        }
      } else {
        next();
      }
    });

  } else {
    if (!isProd) {
      console.error('[WARNING] FRONTEND_URL is NOT defined. Using permissive CORS for development.');
    }
    
    // Fallback CORS for development
    const fallbackCors = {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      optionsSuccessStatus: 200
    };
    
    app.use(cors(fallbackCors));
    
    app.use((req: any, res: any, next: any) => {
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }
} catch (error) {
  console.error('[FATAL] Error setting up CORS:', error);
  process.exit(1);
}

// Immediate response endpoint - no dependencies
app.get(API_ROUTES.PING, (req: any, res: any) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Server is responding immediately'
  });
});

// Health check endpoint (should come before main routes) - optimized for speed
app.get(API_ROUTES.ROOT, (req: any, res: any) => {
  res.status(200).json({
    message: 'Server is running and reachable',
    timestamp: new Date().toISOString(),
    cors_configured: !!FRONTEND_URL,
    frontend_url: FRONTEND_URL,
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get(API_ROUTES.METRICS, async (req: express.Request, res: express.Response) => {
  try {
    const registry = getMetricsRegistry();
    res.set('Content-Type', registry.contentType);
    res.status(200).send(await registry.metrics());
  } catch (error) {
    console.error('Failed to collect metrics', error);
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

// Detailed health check endpoint for debugging
app.get(API_ROUTES.HEALTH, async (req: any, res: any) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      s3: 'unknown',
      cognito: 'unknown'
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: PORT,
      FRONTEND_URL: FRONTEND_URL ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      AWS_REGION: process.env.AWS_REGION ? 'SET' : 'NOT SET',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ? 'SET' : 'NOT SET',
      COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID ? 'SET' : 'NOT SET',
      COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID ? 'SET' : 'NOT SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET'
    }
  };

  // Test database connection with timeout
  try {
    const pool = require('./database').default;
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), SERVER_TIMEOUTS.DATABASE_CONNECTION_TIMEOUT))
    ]);
    client.release();
    health.services.database = 'connected';
  } catch {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  // Test S3 client
  try {
    const { s3Client } = require('./config');
    if (s3Client) {
      health.services.s3 = 'available';
    } else {
      health.services.s3 = 'not_configured';
    }
  } catch {
    health.services.s3 = 'error';
  }

  // Test Cognito configuration
  if (process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID) {
    health.services.cognito = 'configured';
  } else {
    health.services.cognito = 'not_configured';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Test CORS endpoint for development
if (!isProd) {
  app.get(API_ROUTES.TEST_CORS, (req: any, res: any) => {
    res.json({ 
      message: 'CORS test successful', 
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
  });
}

try {
  // Routes
  app.use(API_BASE_PATH, mainApiRouter);
  
  // 404 handler for unknown routes
  app.use(notFoundHandler);
  
  // Global error handler (must be last)
  app.use(errorHandler);
} catch (error) {
  console.error('[FATAL] Error setting up routes:', error);
  process.exit(1);
}

try {
  // Start Server
  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`✅ Server started successfully on port ${PORT}`);
    if (!isProd) {
      console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
      console.log(`❤️ Health check: http://0.0.0.0:${PORT}/ping`);
      console.log(`🚀 API endpoint: http://0.0.0.0:${PORT}${API_BASE_PATH}`);
    }
  });

  // Set server timeout to prevent hanging connections
  server.timeout = SERVER_TIMEOUTS.REQUEST_TIMEOUT; // Increased for long image generation
  server.keepAliveTimeout = SERVER_TIMEOUTS.KEEP_ALIVE_TIMEOUT;
  server.headersTimeout = SERVER_TIMEOUTS.HEADERS_TIMEOUT; // Must be > keepAliveTimeout
  
  // Handle server errors
  server.on('error', (error: any) => {
    console.error('[FATAL] Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  // Server listening confirmation
  server.on('listening', () => {
    if (!isProd) {
      console.log(`✅ Server is now listening for connections`);
    }
  });
  
} catch (error) {
  console.error('[FATAL] Error starting server:', error);
  process.exit(1);
}
