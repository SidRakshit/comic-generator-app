import express from 'express';
import cors from 'cors';
import { PORT, FRONTEND_URL } from './config';
import mainApiRouter from './routes/index';

console.log('[DEBUG] Starting server process...');
console.log('[DEBUG] Environment variables:');
console.log(`[DEBUG] - PORT: ${PORT}`);
console.log(`[DEBUG] - FRONTEND_URL: ${FRONTEND_URL}`);
console.log(`[DEBUG] - NODE_ENV: ${process.env.NODE_ENV}`);

const app = express();

// Global request logger to see ALL incoming requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`[REQUEST] Origin: ${req.headers.origin || 'NO ORIGIN'}`);
  console.log(`[REQUEST] User-Agent: ${req.headers['user-agent']}`);
  console.log(`[REQUEST] Headers:`, JSON.stringify(req.headers, null, 2));
  next();
});

app.use(express.json({ limit: '50mb' }));

// --- Robust CORS Configuration with Debugging ---
if (FRONTEND_URL && FRONTEND_URL.length > 0) {
  console.log(`[DEBUG] FRONTEND_URL is defined: ${FRONTEND_URL}`);
  const allowedOrigins = FRONTEND_URL.split(',').map(origin => origin.trim());
  console.log('[DEBUG] Allowed Origins array:', allowedOrigins);

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      console.log(`[CORS] Checking origin: "${origin}"`);
      console.log(`[CORS] Allowed origins: ${JSON.stringify(allowedOrigins)}`);
      
      // Allow requests with no origin (mobile apps, curl, postman, etc.)
      if (!origin) {
        console.log(`[CORS] ✅ ALLOWING - No origin (likely same-origin or tools)`);
        callback(null, true);
      } else if (allowedOrigins.includes(origin)) {
        console.log(`[CORS] ✅ ALLOWING - Origin matches allowed list`);
        callback(null, true);
      } else {
        console.log(`[CORS] ❌ BLOCKING - Origin not in allowed list`);
        console.log(`[CORS] ❌ Rejected origin: "${origin}"`);
        console.log(`[CORS] ❌ Expected one of: ${allowedOrigins.join(', ')}`);
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
  
  // CRITICAL: Explicit OPTIONS handler for Railway
  console.log('[CORS] Setting up explicit OPTIONS handler...');
  app.options('*', (req, res) => {
    console.log(`[OPTIONS] Handling OPTIONS request for: ${req.url}`);
    console.log(`[OPTIONS] Origin: ${req.headers.origin}`);
    console.log(`[OPTIONS] Access-Control-Request-Method: ${req.headers['access-control-request-method']}`);
    console.log(`[OPTIONS] Access-Control-Request-Headers: ${req.headers['access-control-request-headers']}`);
    
    // Manually set CORS headers
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      console.log(`[OPTIONS] ✅ Responding with CORS headers for origin: ${origin}`);
      res.sendStatus(200);
    } else {
      console.log(`[OPTIONS] ❌ Rejecting OPTIONS for origin: ${origin}`);
      res.sendStatus(403);
    }
  });
  console.log('[CORS] CORS middleware and OPTIONS handler applied.');

} else {
  console.error('---');
  console.error('[FATAL] FRONTEND_URL is NOT defined. Using permissive CORS.');
  console.error('---');
  
  // Fallback CORS for development
  const fallbackCors = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  app.use(cors(fallbackCors));
  app.options('*', (req, res) => {
    console.log(`[FALLBACK OPTIONS] Handling OPTIONS for: ${req.url} from origin: ${req.headers.origin}`);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });
}

// Health check endpoint (should come before main routes)
app.get('/', (req, res) => {
  console.log('[HEALTH] Health check requested');
  res.status(200).json({
    message: 'Server is running and reachable',
    timestamp: new Date().toISOString(),
    cors_configured: !!FRONTEND_URL,
    frontend_url: FRONTEND_URL,
    port: PORT
  });
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  console.log('[TEST-CORS] CORS test endpoint hit');
  res.json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// --- Routes ---
console.log('[DEBUG] Applying API routes...');
app.use('/api', mainApiRouter);
console.log('[DEBUG] API routes applied.');

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`[SUCCESS] Server started successfully on port ${PORT}`);
  console.log(`[DEBUG] Environment - FRONTEND_URL: ${FRONTEND_URL}`);
  console.log(`[DEBUG] Environment - PORT: ${PORT}`);
});