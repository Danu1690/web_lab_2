// Middleware для проверки аутентификации через сессии
export const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Требуется аутентификация'
    });
  }
};

// Middleware для проверки аутентификации
export const authenticateToken = requireAuth;
