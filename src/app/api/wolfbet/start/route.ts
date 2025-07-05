import { NextResponse } from 'next/server';
import { startBot } from '@/app/lib/botManager';
import { BettingConfig } from '@/app/lib/wolfbet';

export async function POST(request: Request) {
  const { siteName, apiKey, config }: { siteName: string; apiKey: string; config: BettingConfig } = await request.json();

  if (!siteName || !apiKey || !config) {
    return NextResponse.json({ error: 'Missing siteName, apiKey, or config' }, { status: 400 });
  }

  const result = await startBot(siteName, apiKey, config);

  if (result.success) {
    return NextResponse.json({ message: "Bot started successfully." });
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}