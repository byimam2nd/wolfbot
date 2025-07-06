'use server';

import { siteManager } from '../lib/sites/siteManager';
import { PlayDice, BettingConfig } from '../app/lib/wolfbet';
import { getDb } from '../lib/db';
import { StrategyConfig } from '../app/lib/strategies';
import { logger } from '../app/lib/logger';

// In-memory storage for bot instances (for simplicity, will be replaced by a more robust solution)
const _activeBots: Map<string, PlayDice> = new Map();

export async function login(siteName: string, apiKey: string) {
  const site = siteManager.getSite(siteName);
  if (!site) {
    logger.warn(`Login attempt: Site not found: ${siteName}`);
    return { success: false, message: 'Site not found.' };
  }

  try {
    const success = await site.login(apiKey);
    if (success) {
      logger.info(`Login successful for site: ${siteName}`);
      return { success: true, message: 'Login successful.' };
    } else {
      logger.warn(`Login failed for site: ${siteName} - Invalid API key.`);
      return { success: false, message: 'Invalid API key.' };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during login.';
    logger.error(`Error during login for site ${siteName}: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
}



export async function placeManualBet(siteName: string, apiKey: string, amount: number, betRule: 'over' | 'under', betChance: number) {
  const site = siteManager.getSite(siteName);
  if (!site) {
    logger.warn(`Manual bet attempt: Site not found: ${siteName}`);
    return { success: false, message: 'Site not found.' };
  }

  try {
    // For manual bets, we create a temporary PlayDice instance to leverage its bet recording logic
    // This is a simplified approach; in a real scenario, you might have a dedicated manual bet recording function
    const tempConfig: BettingConfig = {
      baseBet: amount,
      payoutMultiplier: 0, // Not directly applicable for single manual bet profit calculation here
      stopOnWin: 0,
      stopOnLoss: 0,
      increaseOnWin: { type: 'none', value: 0, resetBaseBet: false },
      increaseOnLoss: { type: 'none', value: 0, resetBaseBet: false },
      betRule: betRule,
      betChance: betChance,
      clientSeed: '',
      serverSeed: '',
    };
    // We need an initial balance for PlayDice to calculate profit percentage, etc.
    // For manual bet, we can fetch current balance or pass a dummy value if only recording bet result
    const initialBalance = await site.getBalance(apiKey); // Fetch current balance for accurate recording

    const tempPlayDice = new PlayDice(site, tempConfig, initialBalance);

    const betResult = await tempPlayDice.placeBet(apiKey, 'Manual'); // Pass 'Manual' as strategy name

    if (betResult.success) {
      const win = betResult.betResult?.win;
      const profit = betResult.betResult?.profit;
      logger.info(`Manual bet placed on ${siteName}: ${win ? 'WIN' : 'LOSS'}, Profit: ${profit}`);
      return { success: true, win, profit, message: win ? 'Bet won!' : 'Bet lost.' };
    } else {
      logger.error(`Failed to place manual bet on ${siteName}.`);
      return { success: false, message: 'Failed to place manual bet.' };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during manual bet.';
    logger.error(`Error during manual bet on ${siteName}: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
}

export async function saveStrategy(strategy: StrategyConfig) {
  const db = getDb();
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO strategies (name, config) VALUES (?, ?)');
    stmt.run(strategy.name, JSON.stringify(strategy));
    logger.info(`Strategy saved: ${strategy.name}`);
    return { success: true, message: 'Strategy saved successfully.' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save strategy.';
    logger.error(`Failed to save strategy ${strategy.name}: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
}

interface StrategyRow { config: string; }

export async function getStrategies(): Promise<{ success: boolean; strategies?: StrategyConfig[]; message?: string }> {
  const db = getDb();
  try {
    const stmt = db.prepare('SELECT * FROM strategies');
    const rows = stmt.all() as StrategyRow[];
    const strategies: StrategyConfig[] = rows.map((row) => JSON.parse(row.config));
    logger.info(`Fetched ${strategies.length} strategies.`);
    return { success: true, strategies };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    logger.error(`Failed to fetch strategies: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
}

export async function deleteStrategy(name: string) {
  const db = getDb();
  try {
    const stmt = db.prepare('DELETE FROM strategies WHERE name = ?');
    stmt.run(name);
    logger.info(`Strategy deleted: ${name}`);
    return { success: true, message: 'Strategy deleted successfully.' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete strategy.';
    logger.error(`Failed to delete strategy ${name}: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
}

export async function withdraw(siteName: string, apiKey: string, amount: number, currency: string, address: string) {
  const site = siteManager.getSite(siteName);
  if (!site) {
    logger.warn(`Withdrawal attempt: Site not found: ${siteName}`);
    return { success: false, message: 'Site not found.' };
  }

  try {
    const result = await site.withdraw(apiKey, amount, currency, address);
    if (result.success) {
      logger.info(`Withdrawal successful from ${siteName}: ${amount} ${currency} to ${address}. TxID: ${result.transactionId}`);
      return { success: true, message: result.message, transactionId: result.transactionId };
    } else {
      logger.error(`Withdrawal failed from ${siteName}: ${result.message}`);
      return { success: false, message: result.message || 'Failed to process withdrawal.' };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during withdrawal.';
    logger.error(`Error during withdrawal from ${siteName}: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
}

import { BetRecord } from '../components/BetHistory';

export async function getBetHistory(): Promise<{ success: boolean; history?: BetRecord[]; message?: string }> {
  const db = getDb();
  try {
    const stmt = db.prepare('SELECT * FROM bets ORDER BY timestamp DESC');
    const rows = stmt.all();
    logger.info(`Fetched ${rows.length} bet history records.`);
    return { success: true, history: rows as BetRecord[] };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bet history.';
    logger.error(`Failed to fetch bet history: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
}

export async function loadStrategies(): Promise<{ success: boolean; strategies?: StrategyConfig[]; message?: string }> {
  const db = getDb();
  try {
    const stmt = db.prepare('SELECT * FROM strategies');
    const rows = stmt.all() as StrategyRow[];
    const strategies: StrategyConfig[] = rows.map((row) => JSON.parse(row.config));
    logger.info(`Fetched ${strategies.length} strategies.`);
    return { success: true, strategies };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    logger.error(`Failed to fetch strategies: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
}
