import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import crypto from 'crypto';

export class TokenService {
  // Генерация access токена (15 минут)
  static generateAccessToken(userId, userData = {}) {
    return jwt.sign(
      {
        userId,
        type: 'access',
        ...userData
      },
      process.env.JWT_ACCESS_SECRET || 'fallback-access-secret-change-in-production',
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
  }

  // Генерация refresh токена (7 дней)
  static generateRefreshToken(userId) {
    const jti = crypto.randomBytes(16).toString('hex');
    
    const refreshToken = jwt.sign(
      {
        userId,
        type: 'refresh',
        jti: jti
      },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
    
    return { refreshToken, jti };
  }

  // Валидация access токена
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'fallback-access-secret-change-in-production');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('ACCESS_TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_ACCESS_TOKEN');
      }
      throw new Error('ACCESS_TOKEN_VALIDATION_FAILED');
    }
  }

  // Валидация refresh токена
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_REFRESH_TOKEN');
      }
      throw new Error('REFRESH_TOKEN_VALIDATION_FAILED');
    }
  }

  // Сохранение refresh токена в БД
  static async storeRefreshToken(userId, refreshToken, jti) {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, jti, expires_at) 
      VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')
      RETURNING id
    `;
    
    // Сохраняем хеш токена для безопасности
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const result = await pool.query(query, [userId, hashedToken, jti]);
    return result.rows[0];
  }

  // Проверка refresh токена в БД
  static async validateStoredRefreshToken(refreshToken, jti) {
    const query = `
      SELECT rt.id, rt.user_id, rt.token as stored_token_hash,
             u.first_name, u.last_name, u.email, u.login 
      FROM refresh_tokens rt 
      JOIN users u ON rt.user_id = u.id 
      WHERE rt.jti = $1 AND rt.expires_at > NOW() AND rt.revoked = false
    `;
    
    const result = await pool.query(query, [jti]);
    
    if (result.rows.length === 0) {
      return false;
    }

    // Проверяем хеш токена
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedToken = result.rows[0];
    
    if (storedToken.stored_token_hash !== hashedToken) {
      return false;
    }

    return storedToken;
  }

  // Отзыв refresh токена
  static async revokeRefreshToken(jti) {
    const query = 'UPDATE refresh_tokens SET revoked = true, revoked_at = NOW() WHERE jti = $1';
    const result = await pool.query(query, [jti]);
    return result.rowCount > 0;
  }

  // Отзыв всех токенов пользователя
  static async revokeAllUserTokens(userId) {
    const query = 'UPDATE refresh_tokens SET revoked = true, revoked_at = NOW() WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }

  // Очистка старых токенов
  static async cleanupExpiredTokens() {
    const query = 'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = true';
    const result = await pool.query(query);
    return result.rowCount;
  }
}