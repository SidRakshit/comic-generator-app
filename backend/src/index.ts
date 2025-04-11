import express from 'express';
import { PORT } from './config';
import exampleRoute from './routes/example';

const app = express();

// No CORS middleware here, let Nginx handle it
app.use(express.json());

app.use('/', exampleRoute);

// Add proper type annotations for req and res
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Welcome to the backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});