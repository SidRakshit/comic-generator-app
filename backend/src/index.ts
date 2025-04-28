// src/index.ts
import express from 'express';
// Only import PORT if needed, otherwise define directly for test
import { PORT } from './config';
import mainApiRouter from './routes/index';
// import './database';

const app = express();
// const PORT = process.env.PORT || 8080; // Define PORT directly

// --- Middleware ---
// Comment out ALL app.use() middleware for now
// app.use(cors({ /* ... */ })); 
app.use(express.json());

// --- Routes ---
app.use('/api', mainApiRouter); // Still commented out

// Keep only the simplest possible route
app.get('/', (req, res) => {
  res.send('Minimal OK');
});

// --- Error Handling ---
// Comment out error handlers for now
// app.use('*', (req, res) => { /* ... */ }); 
// app.use((err: any, req, res, next) => { /* ... */ }); 

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Minimal Server running on http://localhost:${PORT}`);
});