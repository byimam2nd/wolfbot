import { getDb } from '../../../lib/db';
import { NextResponse } from 'next/server';
import { logger } from '../../../app/lib/logger';

export async function GET() {
  try {
    getDb(); // This will initialize the database if it hasn't been already
    logger.info('Database initialized successfully.');
    return NextResponse.json({ message: 'Database initialized successfully.' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    logger.error('Failed to initialize database:', errorMessage);
    return NextResponse.json({ message: 'Failed to initialize database.', error: errorMessage }, { status: 500 });
  }
}