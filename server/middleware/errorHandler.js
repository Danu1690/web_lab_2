const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // PostgreSQL ошибка уникальности
  if (err.code === '23505') {
    const field = err.detail.match(/\(([^)]+)\)/)[1];
    return res.status(400).json({
      success: false,
      message: `Пользователь с таким ${field} уже существует`
    });
  }

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Неверный токен'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Токен истек'
    });
  }

  // Остальные ошибки
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера'
  });
};

export default errorHandler;