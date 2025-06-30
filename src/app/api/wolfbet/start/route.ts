import { NextResponse } from 'next/server';
import { startBot } from '@/app/lib/botManager';

export async function POST(request: Request) {
  const { accessToken, config } = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
  }

  const result = startBot(accessToken, config);

  if (result.success) {
    return NextResponse.json({ message: result.message });
  } else {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }
}