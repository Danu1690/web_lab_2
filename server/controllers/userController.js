import { pool } from '../config/database.js';

export const userController = {
  // Получение профиля
  async getProfile(req, res) {
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
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения профиля'
      });
    }
  },

  // Обновление темы
  async updateTheme(req, res) {
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
      console.error('Update theme error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка обновления темы'
      });
    }
  },


  async getAllUsers(req, res) {
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
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка пользователей'
      });
    }
  }

};

