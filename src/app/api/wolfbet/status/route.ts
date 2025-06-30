import { NextResponse } from 'next/server';
import { getBotStatus } from '@/app/lib/botManager';

export async function GET(request: Request) {
  const status = getBotStatus();
  return NextResponse.json(status);
}