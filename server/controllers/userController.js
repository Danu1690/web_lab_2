import { User } from '../models/User.js';

export const userController = {
  // Получение профиля
  async getProfile(req, res) {
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

      const updatedUser = await User.updateTheme(req.user.id, theme);
      
      res.json({
        success: true,
        message: 'Тема обновлена',
        theme: updatedUser.theme
      });
    } catch (error) {
      console.error('Update theme error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка обновления темы'
      });
    }
  }
};