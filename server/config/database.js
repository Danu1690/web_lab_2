import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Конфигурация для разных окружений
const dbConfig = {
  development: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'auth_system',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  test: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME_TEST || 'auth_system_test',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  production: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 25,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
  }
};

const environment = process.env.NODE_ENV || 'development';
export const pool = new Pool(dbConfig[environment]);

// Логирование запросов в development
if (environment === 'development') {
  pool.on('connect', () => {
    console.log('🔌 New database connection');
  });

  pool.on('query', (query) => {
    console.log('📊 SQL Query:', query.text, query.values);
  });
}

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    
    // Проверяем версию PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('✅ PostgreSQL connected:', versionResult.rows[0].version.split(',')[0]);
    
    client.release();
    
    // Запускаем миграции при старте
    if (environment === 'development') {
      await runMigrations();
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === '28P01') {
      console.error('💡 Check your DB_PASSWORD in .env file');
    } else if (error.code === '3D000') {
      console.error('💡 Database does not exist. Create it first:');
      console.error('   createdb auth_system');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 PostgreSQL is not running. Start it with:');
      console.error('   sudo service postgresql start');
      console.error('   OR: pg_ctl -D /usr/local/var/postgres start');
    }
    
    throw error;
  }
};

// Функция миграций
const runMigrations = async () => {
  try {
    const { runMigrations } = await import('../scripts/setupDatabase.js');
    await runMigrations();
  } catch (error) {
    console.log('⚠️  Migrations not run (setupDatabase not found)');
  }
};