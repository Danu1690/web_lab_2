import { Router } from 'express';

const router = Router();

// Простой тестовый эндпоинт
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Сервер работает!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

export default router;