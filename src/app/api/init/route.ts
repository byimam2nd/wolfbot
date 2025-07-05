import { getDb } from '../../../lib/db';
import { NextResponse } from 'next/server';
import { logger } from '../../../app/lib/logger';

export async function GET() {
  try {
    getDb(); // This will initialize the database if it hasn't been already
    logger.info('Database initialized successfully.');
    return NextResponse.json({ message: 'Database initialized successfully.' });
  } catch (error: any) {
    logger.error('Failed to initialize database:', error);
    return NextResponse.json({ message: 'Failed to initialize database.', error: error.message }, { status: 500 });
  }
}