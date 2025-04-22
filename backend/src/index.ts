import express from 'express';
import { PORT } from './config';
import exampleRoute from './routes/example';
import userRoute from './routes/user';
import comicRoute from './routes/comics';
import './database';

const app = express();

// Middleware
app.use(express.json());

// Add debugging for route registration
console.log('Setting up routes...');

// Base route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({ message: 'Welcome to the backend!' });
});

// Direct test routes - ensure they're before other middleware
app.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ message: 'Test route works!' });
});

app.get('/direct-test', (req, res) => {
  console.log('Direct test route accessed');
  res.json({ message: 'Direct test route works!' });
});

// Register modular routers
console.log('Registering /api routes...');
app.use('/api', exampleRoute);
app.use('/api', userRoute);

console.log('Registering /api/comics routes...');
app.use('/api/comics', comicRoute);

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});