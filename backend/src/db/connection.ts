import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fueleu_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Drop existing tables to ensure schema changes are applied
    await client.query(`
            DROP TABLE IF EXISTS pool_members;
            DROP TABLE IF EXISTS pools;
            DROP TABLE IF EXISTS bank_entries;
            DROP TABLE IF EXISTS ship_compliance;
            DROP TABLE IF EXISTS routes;
        `);

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id SERIAL PRIMARY KEY,
        route_id VARCHAR(50) UNIQUE NOT NULL,
        vessel_type VARCHAR(50) NOT NULL,
        fuel_type VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        ghg_intensity DECIMAL(10, 4) NOT NULL,
        fuel_consumption DECIMAL(15, 2) NOT NULL,
        distance DECIMAL(15, 2) NOT NULL,
        total_emissions DECIMAL(15, 2) NOT NULL,
        is_baseline BOOLEAN DEFAULT FALSE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ship_compliance (
        id SERIAL PRIMARY KEY,
        ship_id VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        cb_gco2eq DECIMAL(20, 2) NOT NULL,
        UNIQUE(ship_id, year)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bank_entries (
        id VARCHAR(100) PRIMARY KEY,
        ship_id VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        amount_gco2eq DECIMAL(20, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pools (
        id VARCHAR(100) PRIMARY KEY,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pool_members (
        pool_id VARCHAR(100) NOT NULL,
        ship_id VARCHAR(50) NOT NULL,
        cb_before DECIMAL(20, 2) NOT NULL,
        cb_after DECIMAL(20, 2) NOT NULL,
        PRIMARY KEY (pool_id, ship_id),
        FOREIGN KEY (pool_id) REFERENCES pools(id)
      );
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}
