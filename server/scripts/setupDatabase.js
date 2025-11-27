import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migrations...');

    // Создаем таблицу миграций для отслеживания
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Получаем выполненные миграции
    const executedMigrations = await client.query(
      'SELECT name FROM migrations'
    );
    const executedNames = executedMigrations.rows.map(row => row.name);

    // Миграции для выполнения
    const migrations = [
      {
        name: '001_create_users_table',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(15) NOT NULL,
            last_name VARCHAR(15) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            login VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            age_group VARCHAR(10) NOT NULL CHECK (age_group IN ('over18', 'under18')),
            gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
            theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
            agreed_to_terms BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
        `
      },
      {
        name: '002_add_user_settings',
        sql: `
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
          ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
          ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
        `
      }
    ];

    // Выполняем новые миграции
    for (const migration of migrations) {
      if (!executedNames.includes(migration.name)) {
        console.log(`📝 Executing migration: ${migration.name}`);
        
        await client.query('BEGIN');
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        await client.query('COMMIT');
        
        console.log(`✅ Migration ${migration.name} completed`);
      } else {
        console.log(`⏭️ Migration ${migration.name} already executed`);
      }
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Запуск миграций
runMigrations()
  .then(() => {
    console.log('🚀 Database setup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  });