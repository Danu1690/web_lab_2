import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
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
        captcha_answer,
        captcha_correct_answer
      } = req.body;

      // Проверка капчи
      if (parseInt(captcha_answer) !== parseInt(captcha_correct_answer)) {
        return res.status(400).json({
          success: false,
          message: 'Неверный ответ на вопрос'
        });
      }

      // Проверка существования пользователя
      const existingUser = await User.findByEmail(email) || await User.findByLogin(login);
      if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'login';
        return res.status(400).json({
          success: false,
          message: `Пользователь с таким ${field} уже существует`
        });
      }

      // Создание пользователя
      const user = await User.create({
        first_name,
        last_name,
        email,
        login,
        password,
        age_group,
        gender,
        agreed_to_terms: agreed_to_terms === 'true'
      });

      // Генерация токена
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          login: user.login,
          age_group: user.age_group,
          gender: user.gender,
          theme: user.theme,
          created_at: user.created_at
        }
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

      // Поиск пользователя по логину или email
      const user = await User.findByLogin(login) || await User.findByEmail(login);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Неверный логин или пароль'
        });
      }

      // Проверка пароля
      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Неверный логин или пароль'
        });
      }

      // Генерация токена
      const token = generateToken(user.id);

      res.json({
        success: true,
        message: 'Вход выполнен успешно',
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          login: user.login,
          age_group: user.age_group,
          gender: user.gender,
          theme: user.theme,
          created_at: user.created_at
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при входе'
      });
    }
  },

  // Генерация капчи
  getCaptcha(req, res) {
    try {
      const captcha = generateCaptcha();
      
      res.json({
        success: true,
        captcha: {
          question: captcha.question,
          correct_answer: captcha.answer
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

  // Проверка токена
  async verify(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          login: user.login,
          age_group: user.age_group,
          gender: user.gender,
          theme: user.theme,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Неверный токен'
      });
    }
  }
};