import express from 'express';
import { PORT } from './config';
import exampleRoute from './routes/example';
import userRoute from './routes/user';
import './database';

const app = express();

app.use(express.json());

app.use('/api', exampleRoute);
app.use('/api', userRoute);

app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Welcome to the backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});