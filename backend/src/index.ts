// src/index.ts
import express from 'express';
// Only import PORT if needed, otherwise define directly for test
import { PORT } from './config';
import mainApiRouter from './routes/index';
// import './database';

const app = express();

app.use(express.json());

// --- Routes ---
app.use('/api', mainApiRouter); // Still commented out

// Keep only the simplest possible route
app.get('/', (req, res) => {
  res.send('Minimal OK');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Minimal Server running on http://localhost:${PORT}`);
});