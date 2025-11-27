import { pool } from '../config/database.js';

const resetDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Resetting database...');
    
    await client.query('DROP TABLE IF EXISTS migrations CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('✅ Database reset completed');
    
    // Запускаем миграции заново
    console.log('🚀 Running migrations...');
    // Здесь можно импортировать и запустить setupDatabase
    // или просто выполнить SQL создания таблиц
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

resetDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));