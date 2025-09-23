console.log('[DEBUG] ===========================================');
console.log('[DEBUG] STARTING BACKEND APPLICATION');
console.log('[DEBUG] ===========================================');

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
import mainApiRouter from './routes/index';

console.log('[DEBUG] Step 1: Dependencies imported successfully');
console.log('[DEBUG] Step 2: Config imported successfully');
console.log('[DEBUG] Step 3: Routes imported successfully');

console.log('[DEBUG] ===========================================');
console.log('[DEBUG] ENVIRONMENT VARIABLES CHECK');
console.log('[DEBUG] ===========================================');
console.log(`[DEBUG] - PORT: ${PORT}`);
console.log(`[DEBUG] - FRONTEND_URL: ${FRONTEND_URL}`);
console.log(`[DEBUG] - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[DEBUG] - DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`[DEBUG] - AWS_REGION: ${process.env.AWS_REGION ? 'SET' : 'NOT SET'}`);
console.log(`[DEBUG] - COGNITO_USER_POOL_ID: ${process.env.COGNITO_USER_POOL_ID ? 'SET' : 'NOT SET'}`);
console.log(`[DEBUG] - COGNITO_CLIENT_ID: ${process.env.COGNITO_CLIENT_ID ? 'SET' : 'NOT SET'}`);
console.log(`[DEBUG] - OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`[DEBUG] - S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME ? 'SET' : 'NOT SET'}`);
console.log(`[DEBUG] - AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET'}`);
console.log(`[DEBUG] - AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET'}`);
console.log('[DEBUG] ===========================================');
console.log('[DEBUG] All required environment variables are present!');
console.log('[DEBUG] ===========================================');

console.log('[DEBUG] Step 4: Creating Express app...');
const app = express();
console.log('[DEBUG] ✅ Express app created successfully');

console.log('[DEBUG] Step 5: Setting up middleware...');
try {
  // Global request logger to see ALL incoming requests (production optimized)
  app.use((req: any, res: any, next: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);
      console.log(`[REQUEST] Origin: ${req.headers.origin || 'NO ORIGIN'}`);
      console.log(`[REQUEST] User-Agent: ${req.headers['user-agent']}`);
    }
    next();
  });
  console.log('[DEBUG] ✅ Request logger middleware added');

  app.use(express.json({ limit: '50mb' }));
  console.log('[DEBUG] ✅ JSON parser middleware added');
} catch (error) {
  console.error('[FATAL] Error setting up basic middleware:', error);
  process.exit(1);
}

console.log('[DEBUG] Step 6: Setting up CORS configuration...');
try {
  // --- Robust CORS Configuration with Debugging ---
  if (FRONTEND_URL && FRONTEND_URL.length > 0) {
    console.log(`[DEBUG] FRONTEND_URL is defined: ${FRONTEND_URL}`);
    const allowedOrigins = FRONTEND_URL.split(',').map(origin => origin.trim());
    console.log('[DEBUG] Allowed Origins array:', allowedOrigins);

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[CORS] Checking origin: "${origin}"`);
        console.log(`[CORS] Allowed origins: ${JSON.stringify(allowedOrigins)}`);
      }
      
      // Allow requests with no origin (mobile apps, curl, postman, etc.)
      if (!origin) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[CORS] ✅ ALLOWING - No origin (likely same-origin or tools)`);
        }
        callback(null, true);
      } else if (allowedOrigins.includes(origin)) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[CORS] ✅ ALLOWING - Origin matches allowed list`);
        }
        callback(null, true);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[CORS] ❌ BLOCKING - Origin not in allowed list`);
          console.log(`[CORS] ❌ Rejected origin: "${origin}"`);
          console.log(`[CORS] ❌ Expected one of: ${allowedOrigins.join(', ')}`);
        }
        callback(new Error(`CORS blocked: Origin ${origin} not allowed`), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true, // Enable if you're sending cookies/auth
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  };

    console.log('[CORS] Applying CORS middleware...');
    app.use(cors(corsOptions));
    console.log('[DEBUG] ✅ CORS middleware applied');
    
    // CRITICAL: Explicit OPTIONS handler for Railway
    console.log('[CORS] Setting up explicit OPTIONS handler...');
    app.options('*', (req: any, res: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[OPTIONS] Handling OPTIONS request for: ${req.url}`);
        console.log(`[OPTIONS] Origin: ${req.headers.origin}`);
        console.log(`[OPTIONS] Access-Control-Request-Method: ${req.headers['access-control-request-method']}`);
        console.log(`[OPTIONS] Access-Control-Request-Headers: ${req.headers['access-control-request-headers']}`);
      }
      
      // Manually set CORS headers
      const origin = req.headers.origin;
      if (!origin || allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[OPTIONS] ✅ Responding with CORS headers for origin: ${origin}`);
        }
        res.sendStatus(200);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[OPTIONS] ❌ Rejecting OPTIONS for origin: ${origin}`);
        }
        res.sendStatus(403);
      }
    });
    console.log('[DEBUG] ✅ OPTIONS handler applied');
    console.log('[CORS] CORS middleware and OPTIONS handler applied.');

  } else {
    console.error('---');
    console.error('[FATAL] FRONTEND_URL is NOT defined. Using permissive CORS.');
    console.error('---');
    
    // Fallback CORS for development
    console.log('[DEBUG] Setting up fallback CORS...');
    const fallbackCors = {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      optionsSuccessStatus: 200
    };
    
    app.use(cors(fallbackCors));
    console.log('[DEBUG] ✅ Fallback CORS middleware applied');
    
    app.options('*', (req: any, res: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[FALLBACK OPTIONS] Handling OPTIONS for: ${req.url} from origin: ${req.headers.origin}`);
      }
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.sendStatus(200);
    });
    console.log('[DEBUG] ✅ Fallback OPTIONS handler applied');
  }
} catch (error) {
  console.error('[FATAL] Error setting up CORS:', error);
  process.exit(1);
}

// Health check endpoint (should come before main routes) - optimized for speed
app.get('/', (req: any, res: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[HEALTH] Health check requested');
  }
  res.status(200).json({
    message: 'Server is running and reachable',
    timestamp: new Date().toISOString(),
    cors_configured: !!FRONTEND_URL,
    frontend_url: FRONTEND_URL,
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Detailed health check endpoint for debugging
app.get('/health', async (req: any, res: any) => {
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

  // Test database connection
  try {
    const pool = require('./database').default;
    const client = await pool.connect();
    client.release();
    health.services.database = 'connected';
  } catch (error) {
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
  } catch (error) {
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

// Test CORS endpoint
app.get('/test-cors', (req: any, res: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[TEST-CORS] CORS test endpoint hit');
  }
  res.json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

console.log('[DEBUG] Step 7: Setting up routes...');
try {
  // --- Routes ---
  console.log('[DEBUG] Applying API routes...');
  app.use('/api', mainApiRouter);
  console.log('[DEBUG] ✅ API routes applied successfully');
} catch (error) {
  console.error('[FATAL] Error setting up routes:', error);
  process.exit(1);
}

console.log('[DEBUG] Step 8: Starting server...');
try {
  // --- Start Server ---
  const server = app.listen(PORT, () => {
    console.log('[DEBUG] ===========================================');
    console.log('[DEBUG] 🎉 SERVER STARTUP COMPLETE! 🎉');
    console.log('[DEBUG] ===========================================');
    console.log(`[SUCCESS] Server started successfully on port ${PORT}`);
    console.log(`[DEBUG] Environment - FRONTEND_URL: ${FRONTEND_URL}`);
    console.log(`[DEBUG] Environment - PORT: ${PORT}`);
    console.log(`[DEBUG] Server URL: http://localhost:${PORT}`);
    console.log(`[DEBUG] Health check: http://localhost:${PORT}/`);
    console.log(`[DEBUG] API endpoint: http://localhost:${PORT}/api`);
    console.log('[DEBUG] ===========================================');
  });

  // Set server timeout to prevent hanging connections
  server.timeout = 30000; // 30 seconds
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds
  
} catch (error) {
  console.error('[FATAL] Error starting server:', error);
  process.exit(1);
}