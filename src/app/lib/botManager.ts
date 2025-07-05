import { PlayDice, BettingConfig } from './wolfbet';
import { siteManager } from './sites/siteManager';
import { logger } from './logger';

let botInstance: PlayDice | null = null;
let botRunning: boolean = false;
let botInterval: NodeJS.Timeout | null = null;
let currentStats: ReturnType<PlayDice['getStats']> | null = null;

export async function startBot(siteName: string, apiKey: string, config: BettingConfig) {
  if (botRunning) {
    logger.warn('Attempted to start bot, but it is already running.');
    return { success: false, error: 'Bot is already running.' };
  }

  const site = siteManager.getSite(siteName);
  if (!site) {
    logger.error(`Dice site not found: ${siteName}`);
    return { success: false, error: 'Dice site not found.' };
  }

  // Perform initial login and get balance
  logger.info(`Attempting to log in to ${siteName} and get balance...`);
  const loginSuccess = await site.login(apiKey);
  if (!loginSuccess) {
    logger.error('Failed to log in to dice site. Invalid API key or site down.');
    return { success: false, error: 'Failed to log in to dice site. Invalid API key or site down.' };
  }

  const initialBalance = await site.getBalance(apiKey);
  if (initialBalance === 0) {
    logger.error('Could not retrieve initial balance. Check API key or site status.');
    return { success: false, error: 'Could not retrieve initial balance. Check API key or site status.' };
  }

  // Assuming currency and headers are still needed for PlayDice, though they should be refactored into DiceSite
  const currency = 'USD'; // Placeholder, should come from site or config
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };

  botInstance = new PlayDice(site, config, initialBalance);
  botRunning = true;
  logger.info('Bot started with config:', config);

  botInterval = setInterval(async () => {
    if (!botRunning) {
      clearInterval(botInterval!);
      botInterval = null;
      logger.info('Bot interval cleared as bot is no longer running.');
      return;
    }

    try {
      const betResult = await botInstance!.placeBet(apiKey);

      if (betResult.message) {
        logger.info(betResult.message);
        stopBot(); // Stop if a stop condition is met
      }

      currentStats = botInstance!.getStats();
      logger.debug('Current Stats:', currentStats);

    } catch (error: any) {
      logger.error('Bot error:', error);
      stopBot();
      currentStats = { ...currentStats, error: error.message }; // Add error to stats
    }
  }, 1000); // Run every 1 second for faster simulation

  return { success: true };
}

export function stopBot() {
  if (botRunning) {
    botRunning = false;
    if (botInterval) {
      clearInterval(botInterval);
      botInterval = null;
    }
    botInstance = null;
    logger.info('Bot stopped.');
    return { message: 'Bot stopped.' };
  }
  logger.info('Attempted to stop bot, but it was not running.');
  return { message: 'Bot is not running.' };
}

export function getBotStatus() {
  return {
    status: botRunning ? 'Running' : 'Idle',
    stats: currentStats,
  };
}