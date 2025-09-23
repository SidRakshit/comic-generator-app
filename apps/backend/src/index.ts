import express from 'express';
import cors from 'cors';
import { PORT, FRONTEND_URL } from './config';
import mainApiRouter from './routes/index';

console.log('[DEBUG] Starting server process...');

const app = express();

app.use(express.json({ limit: '50mb' }));

// --- Robust CORS Configuration with Debugging ---
if (FRONTEND_URL && FRONTEND_URL.length > 0) {
  console.log(`[DEBUG] FRONTEND_URL is defined: ${FRONTEND_URL}`);
  const allowedOrigins = FRONTEND_URL.split(',').map(origin => origin.trim());
  console.log('[DEBUG] Allowed Origins array:', allowedOrigins);

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      console.log(`[DEBUG] CORS middleware received a request from origin: ${origin}`);
      // Allow requests with no origin (mobile apps, curl, postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        console.log(`[DEBUG] CORS check PASSED for origin: ${origin}`);
        callback(null, true);
      } else {
        console.error(`[DEBUG] CORS check FAILED. Origin "${origin}" is not in the allowed list.`);
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true, // Enable if you're sending cookies/auth
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  };

  console.log('[DEBUG] Applying CORS middleware...');
  app.use(cors(corsOptions));
  
  // CRITICAL: Explicit OPTIONS handler for Railway
  app.options('*', cors(corsOptions));
  console.log('[DEBUG] CORS middleware and OPTIONS handler applied.');

} else {
  console.error('---');
  console.error('[FATAL DEBUG] FRONTEND_URL is NOT defined. CORS will not be configured.');
  console.error('---');
  
  // Fallback CORS for development
  app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
  }));
  app.options('*', cors());
}

// Health check endpoint (should come before main routes)
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Server is running and reachable',
    timestamp: new Date().toISOString(),
    cors_configured: !!FRONTEND_URL
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