import { Router } from 'express';

const router = Router();

router.get('/greet', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

export default router;
