import { NextResponse } from 'next/server';
import { getBotStatus } from '@/app/lib/botManager';

export async function GET() {
  const status = getBotStatus();
  return NextResponse.json(status);
}