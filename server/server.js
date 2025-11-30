import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

import { pool } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PgSession = connectPgSimple(session);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'fallback-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // false для localhost, true для production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    sameSite: 'lax'
  },
  name: 'auth.sid'
}));

// Отладочный middleware для сессий
app.use((req, res, next) => {
  console.log('=== SESSION DEBUG ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('User ID in session:', req.session.userId);
  console.log('Path:', req.path);
  console.log('=====================');
  next();
});

// Middleware для проверки аутентификации
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Требуется аутентификация'
    });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running with sessions',
    timestamp: new Date().toISOString(),
    session: {
      id: req.sessionID,
      userId: req.session.userId
    }
  });
});

// Эндпоинт для отладки сессии
app.get('/api/debug/session', (req, res) => {
  res.json({
    success: true,
    session: {
      id: req.sessionID,
      userId: req.session.userId,
      user: req.session.user,
      cookie: req.session.cookie
    }
  });
});

// Капча
app.get('/api/auth/captcha', (req, res) => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;
  
  // Сохраняем ответ в сессии
  req.session.captchaAnswer = answer.toString();
  
  res.json({
    success: true,
    captcha: {
      question: `${num1} + ${num2} = ?`,
      session_id: req.sessionID
    }
  });
});

// Проверка доступности email
app.get('/api/auth/check-email', async (req, res) => {
  try {
    const { value } = req.query;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Email обязателен'
      });
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [value]
    );

    res.json({
      success: true,
      available: result.rows.length === 0
    });

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка проверки email'
    });
  }
});

// Проверка доступности логина
app.get('/api/auth/check-login', async (req, res) => {
  try {
    const { value } = req.query;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Логин обязателен'
      });
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE login = $1',
      [value]
    );

    res.json({
      success: true,
      available: result.rows.length === 0
    });

  } catch (error) {
    console.error('Check login error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка проверки логина'
    });
  }
});

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      login,
      password,
      age_group,
      gender,
      agreed_to_terms,
      captcha_answer
    } = req.body;

    console.log('📝 Registration attempt:', { email, login });
    console.log('🔄 Current session before registration:', req.session);

    // Проверка капчи из сессии
    if (!req.session.captchaAnswer || parseInt(captcha_answer) !== parseInt(req.session.captchaAnswer)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный ответ на капчу'
      });
    }

    // Очищаем использованную капчу
    delete req.session.captchaAnswer;

    // Проверка существования пользователя
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR login = $2',
      [email, login]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email или логином уже существует'
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создание пользователя
    const result = await pool.query(
      `INSERT INTO users 
       (first_name, last_name, email, login, password, age_group, gender, agreed_to_terms) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, first_name, last_name, email, login, age_group, gender, theme, created_at`,
      [first_name, last_name, email, login, hashedPassword, age_group, gender, agreed_to_terms]
    );

    const user = result.rows[0];

    // Создаем сессию
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      login: user.login,
      first_name: user.first_name,
      last_name: user.last_name
    };

    // Сохраняем сессию явно
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
      } else {
        console.log('✅ Session saved successfully');
      }
    });

    console.log('✅ User registered:', user.email);
    console.log('🆕 New session after registration:', req.session);

    res.json({
      success: true,
      message: 'Регистрация успешна!',
      user: user
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при регистрации'
    });
  }
});

// Логин
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    console.log('🔐 Login attempt:', login);
    console.log('🔄 Current session before login:', req.session);

    // Ищем пользователя по логину или email
    const result = await pool.query(
      `SELECT * FROM users WHERE login = $1 OR email = $1`,
      [login]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Неверный логин или пароль'
      });
    }

    const user = result.rows[0];

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный логин или пароль'
      });
    }

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    // Создаем/обновляем сессию
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      login: user.login,
      first_name: user.first_name,
      last_name: user.last_name
    };

    // Сохраняем сессию явно
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
      } else {
        console.log('✅ Session saved successfully');
      }
    });

    console.log('✅ User logged in:', user.email);
    console.log('🆕 New session after login:', req.session);

    res.json({
      success: true,
      message: 'Вход успешен!',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при входе'
    });
  }
});

// Логаут
app.post('/api/auth/logout', (req, res) => {
  try {
    console.log('🚪 Logout attempt');
    console.log('📋 Session before logout:', req.session);

    // Уничтожаем сессию
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destruction error:', err);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при выходе'
        });
      }

      res.clearCookie('auth.sid');
      console.log('✅ Session destroyed successfully');
      
      res.json({
        success: true,
        message: 'Выход выполнен успешно'
      });
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при выходе'
    });
  }
});

// Проверка аутентификации
app.get('/api/auth/verify', async (req, res) => {
  try {
    console.log('🔍 Verify auth attempt - Session:', req.session);

    if (!req.session.userId) {
      console.log('❌ No user ID in session');
      return res.status(401).json({
        success: false,
        message: 'Не аутентифицирован'
      });
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, login, age_group, gender, theme, created_at 
       FROM users WHERE id = $1`,
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      // Пользователь сессии не найден в БД - очищаем сессию
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    console.log('✅ User verified:', result.rows[0].email);

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Auth verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Ошибка проверки аутентификации'
    });
  }
});

app.get('/api/users/all', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, login, age_group, gender, theme, created_at
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      users: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения списка пользователей'
    });
  }
});

// Защищенный эндпоинт профиля
app.get('/api/users/profile', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, login, age_group, gender, theme, created_at 
       FROM users WHERE id = $1`,
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения профиля'
    });
  }
});

// Обновление темы
app.patch('/api/users/theme', requireAuth, async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректная тема'
      });
    }

    const result = await pool.query(
      'UPDATE users SET theme = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING theme',
      [theme, req.session.userId]
    );

    res.json({
      success: true,
      message: 'Тема обновлена',
      theme: result.rows[0].theme
    });
  } catch (error) {
    console.error('❌ Update theme error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления темы'
    });
  }
});

// Тестовый эндпоинт
app.get('/api/test/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Сервер работает!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    session: {
      id: req.sessionID,
      userId: req.session.userId
    }
  });
});

// Запуск сервера
const startServer = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // Проверка таблицы пользователей
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');
    } else {
      console.log('❌ Users table does not exist - running in demo mode');
    }
    
    // Проверяем таблицу сессий
    const sessionTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_sessions'
      );
    `);
    
    if (sessionTableCheck.rows[0].exists) {
      console.log('✅ User sessions table exists');
    } else {
      console.log('⚠️ User sessions table does not exist - it will be created automatically');
    }
    
    client.release();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log('=====================================');
      console.log('🚀 Server running with SESSIONS');
      console.log(`📍 http://localhost:${PORT}`);
      console.log('=====================================');
      console.log('🔑 Session configuration:');
      console.log('   - Cookie name: auth.sid');
      console.log('   - Secure: false (for localhost)');
      console.log('   - HTTP Only: true');
      console.log('   - Max age: 7 days');
      console.log('=====================================');
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
  }
};

startServer();