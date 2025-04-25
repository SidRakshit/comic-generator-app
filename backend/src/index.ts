// src/index.ts
import express from 'express';
import cors from 'cors'; // Import cors
import { PORT } from './config';
// Import the main router instead of individual ones
import mainApiRouter from './routes/index';
// Import database connection to ensure it initializes (if it doesn't export anything needed here)
import './database';

const app = express();

// --- Middleware ---

// Enable CORS - Adjust options as needed for security
// Allows requests from your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow your frontend URL, or '*' for development (less secure)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow common methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));

// Parse JSON request bodies
app.use(express.json());

// --- Routes ---

// Mount the main API router under the /api prefix
// All routes defined in src/routes/index.ts (and the files it imports)
// will be accessible under /api (e.g., /api/auth/login, /api/comics)
app.use('/api', mainApiRouter);

// Simple root route (optional - outside /api)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Comic Generator API!' });
});


// --- Error Handling ---

// Catch-all 404 handler for routes not found
app.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Basic error handler (consider adding more specific error handling)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handler:", err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

