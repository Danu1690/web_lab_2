import { pool } from '../config/database.js';
import { generateCaptcha } from '../utils/generateCaptcha.js';

export const authController = {
  // Регистрация
  async register(req, res) {
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
          message: 'Неверный ответ на вопрос'
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
      const bcrypt = await import('bcryptjs');
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

      // Создание сессии
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        login: user.login,
        first_name: user.first_name,
        last_name: user.last_name
      };

      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
        } else {
          console.log('✅ Session saved successfully:', req.session);
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
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при регистрации'
      });
    }
  },

  // Логин
  async login(req, res) {
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
      const bcrypt = await import('bcryptjs');
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

      console.log('✅ User logged in:', user.email);

      res.json({
        success: true,
        message: 'Вход выполнен успешно',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при входе'
      });
    }
  },

  // Обновление токенов - УДАЛЯЕМ
  // async refresh(req, res) { ... }

  // Логаут
  async logout(req, res) {
    try {
      console.log('🚪 Logout attempt');

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
        res.json({
          success: true,
          message: 'Выход выполнен успешно'
        });
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при выходе'
      });
    }
  },

  // Генерация капчи
  getCaptcha(req, res) {
    try {
      const captcha = generateCaptcha();
      
      // Сохраняем ответ в сессии
      req.session.captchaAnswer = captcha.answer;
      
      res.json({
        success: true,
        captcha: {
          question: captcha.question
        }
      });
    } catch (error) {
      console.error('Captcha generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка генерации капчи'
      });
    }
  },

  // Проверка аутентификации
  async verify(req, res) {
    try {
      const result = await pool.query(
        `SELECT id, first_name, last_name, email, login, age_group, gender, theme, created_at 
         FROM users WHERE id = $1`,
        [req.session.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      res.json({
        success: true,
        user: result.rows[0]
      });

    } catch (error) {
      console.error('Auth verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Ошибка проверки аутентификации'
      });
    }
  },
  // Проверка доступности email
async checkEmail(req, res) {
  try {
    const { value } = req.query;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Email обязателен'
      });
    }

    const user = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [value]
    );

    res.json({
      success: true,
      available: user.rows.length === 0
    });

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка проверки email'
    });
  }
},

// Проверка доступности логина
async checkLogin(req, res) {
  try {
    const { value } = req.query;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Логин обязателен'
      });
    }

    const user = await pool.query(
      'SELECT id FROM users WHERE login = $1',
      [value]
    );

    res.json({
      success: true,
      available: user.rows.length === 0
    });

  } catch (error) {
    console.error('Check login error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка проверки логина'
    });
  }
}
};