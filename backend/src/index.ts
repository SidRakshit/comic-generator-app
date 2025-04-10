import express from 'express';
import cors from 'cors';
import { PORT } from './config';
import exampleRoute from './routes/example';

const app = express();
app.use(cors({
  origin: ['https://comic-generator-app.vercel.app', 'https://comiccreator.info'],
  credentials: true
}));
app.use(express.json());

app.use('/', exampleRoute);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
