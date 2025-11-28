import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { pool } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running with simple DB',
    timestamp: new Date().toISOString()
  });
});

// Капча
app.get('/api/auth/captcha', (req, res) => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;
  
  res.json({
    success: true,
    captcha: {
      question: `${num1} + ${num2} = ?`,
      correct_answer: answer.toString()
    }
  });
});

// Простая регистрация с БД
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
      captcha_answer,
      captcha_correct_answer
    } = req.body;

    console.log('📝 Registration attempt:', { email, login });

    // Проверка капчи
    if (parseInt(captcha_answer) !== parseInt(captcha_correct_answer)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный ответ на капчу'
      });
    }

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

    res.json({
      success: true,
      message: 'Регистрация успешна!',
      token: 'jwt_token_' + Date.now(), // Временный токен
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

// Простой логин с БД
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    console.log('🔐 Login attempt:', login);

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

    res.json({
      success: true,
      message: 'Вход успешен!',
      token: 'jwt_token_' + Date.now(), // Временный токен
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

// Получение профиля
app.get('/api/users/profile', async (req, res) => {
  try {
    // Временная проверка авторизации
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    // Простая логика - в реальном приложении здесь была бы проверка JWT
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, login, age_group, gender, theme, created_at FROM users ORDER BY id DESC LIMIT 1'
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      user: userResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения профиля'
    });
  }
});

// Запуск сервера
const startServer = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // Простая проверка таблицы
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
    
    client.release();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log('=====================================');
      console.log('🚀 Server running with simple DB');
      console.log(`📍 http://localhost:${PORT}`);
      console.log('=====================================');
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
  }
};

startServer();