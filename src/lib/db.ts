import Database from 'better-sqlite3';
import path from 'path';
import { logger } from '../app/lib/logger';

const dbPath = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'data', 'database.sqlite')
  : path.join(process.cwd(), 'data', 'database.dev.sqlite');

let db: Database.Database | null = null;

function initializeDatabase() {
  if (db) {
    logger.debug('Database already initialized.');
    return db;
  }

  try {
    db = new Database(dbPath, { verbose: (message) => logger.debug(`SQLite: ${message}`) });

    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS strategies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        config TEXT
      );

      CREATE TABLE IF NOT EXISTS bets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site TEXT,
        amount REAL,
        payout REAL,
        win BOOLEAN,
        profit REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        strategy_name TEXT,
        bet_parameters TEXT,
        balance_before_bet REAL,
        balance_after_bet REAL,
        client_seed_used TEXT,
        server_seed_used TEXT
      );
    `);

    // Add new columns if they don't exist (for existing databases)
    db.exec(`
      ALTER TABLE bets ADD COLUMN strategy_name TEXT;
      ALTER TABLE bets ADD COLUMN bet_parameters TEXT;
      ALTER TABLE bets ADD COLUMN balance_before_bet REAL;
      ALTER TABLE bets ADD COLUMN balance_after_bet REAL;
      ALTER TABLE bets ADD COLUMN client_seed_used TEXT;
      ALTER TABLE bets ADD COLUMN server_seed_used TEXT;
    `);

    logger.info('Database initialized successfully.');
    return db;
  } catch (error: any) {
    logger.error(`Failed to initialize database: ${error.message}`);
    throw error; // Re-throw to indicate failure
  }
}

export function getDb() {
  return initializeDatabase();
}