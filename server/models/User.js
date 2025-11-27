import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  // Создание пользователя
  static async create(userData) {
    const {
      first_name,
      last_name,
      email,
      login,
      password,
      age_group,
      gender,
      agreed_to_terms
    } = userData;

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (first_name, last_name, email, login, password, age_group, gender, agreed_to_terms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, first_name, last_name, email, login, age_group, gender, theme, created_at
    `;
    
    const values = [
      first_name,
      last_name,
      email,
      login,
      hashedPassword,
      age_group,
      gender,
      agreed_to_terms
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Поиск по email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Поиск по логину
  static async findByLogin(login) {
    const query = 'SELECT * FROM users WHERE login = $1';
    const result = await pool.query(query, [login]);
    return result.rows[0];
  }

  // Поиск по ID
  static async findById(id) {
    const query = 'SELECT id, first_name, last_name, email, login, age_group, gender, theme, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Обновление темы
  static async updateTheme(userId, theme) {
    const query = 'UPDATE users SET theme = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING theme';
    const result = await pool.query(query, [theme, userId]);
    return result.rows[0];
  }

  // Проверка пароля
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}