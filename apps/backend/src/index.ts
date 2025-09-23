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
      if (!origin || allowedOrigins.includes(origin)) {
        console.log(`[DEBUG] CORS check PASSED for origin: ${origin}`);
        callback(null, true);
      } else {
        console.error(`[DEBUG] CORS check FAILED. Origin "${origin}" is not in the allowed list.`);
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  console.log('[DEBUG] Applying CORS middleware...');
  app.use(cors(corsOptions));
  console.log('[DEBUG] CORS middleware applied.');

} else {
  console.error('---');
  console.error('[FATAL DEBUG] FRONTEND_URL is NOT defined. CORS will not be configured.');
  console.error('---');
}

// --- Routes ---
console.log('[DEBUG] Applying API routes...');
app.use('/api', mainApiRouter);
app.get('/', (req, res) => {
  res.send('Server is running and reachable.');
});
console.log('[DEBUG] API routes applied.');

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`[SUCCESS] Server started successfully on port ${PORT}`);
});