import { NextResponse } from 'next/server';
import { stopBot } from '@/app/lib/botManager';

export async function POST() {
  const result = stopBot();
  return NextResponse.json({ message: result.message });
}