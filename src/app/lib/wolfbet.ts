import { DiceSite } from '../../lib/sites/DiceSite';
import { logger } from './logger';
import { getDb } from '../../lib/db';

// New interface for betting configuration
export interface BettingConfig {
  baseBet: number;
  payoutMultiplier: number;
  stopOnWin: number; // Target profit to stop (absolute value)
  stopOnLoss: number; // Max loss to stop (absolute value)
  stopOnWinPercentage?: number; // Target profit to stop (percentage of initial balance)
  stopOnLossPercentage?: number; // Max loss to stop (percentage of initial balance)
  increaseOnWin: {
    type: 'none' | 'percentage' | 'fixed';
    value: number;
    resetBaseBet: boolean;
  };
  increaseOnLoss: {
    type: 'none' | 'percentage' | 'fixed';
    value: number;
    resetBaseBet: boolean;
  };
  betRule: 'over' | 'under';
  betChance: number;
  clientSeed: string;
  serverSeed: string; // This might be managed by the site API
}

class PlayDice {
  private site: DiceSite; // The specific dice site instance
  private config: BettingConfig;
  private currentBetAmount: number;
  private currentProfit: number;
  private totalBets: number;
  private wins: number;
  private losses: number;
  private winStreak: number;
  private lossStreak: number;
  private maxWinStreak: number;
  private maxLossStreak: number;
  private initialBalance: number; // To calculate profit/loss percentage
  private currentBalance: number; // Current balance after bets

  constructor(site: DiceSite, config: BettingConfig, initialBalance: number) {
    this.site = site;
    this.config = config;
    this.initialBalance = initialBalance;
    this.currentBalance = initialBalance;

    // Initialize betting state
    this.currentBetAmount = config.baseBet;
    this.currentProfit = 0;
    this.totalBets = 0;
    this.wins = 0;
    this.losses = 0;
    this.winStreak = 0;
    this.lossStreak = 0;
    this.maxWinStreak = 0;
    this.maxLossStreak = 0;

    logger.info('PlayDice instance created.');
  }

  // Place a single bet
  async placeBet(apiKey: string, strategyName: string = 'Manual'): Promise<{ success: boolean; message?: string; betResult?: { win: boolean; profit: number; } }> {
    this.totalBets++;
    logger.debug(`Placing bet #${this.totalBets} with amount: ${this.currentBetAmount.toFixed(8)}`);

    const balanceBeforeBet = this.currentBalance;

    // Use the actual site's placeBet method
    let success, win, profit;
    try {
      const result = await this.site.placeBet(
        apiKey,
        this.currentBetAmount,
        this.config.betRule,
        this.config.betChance,
        this.config.clientSeed,
        this.config.serverSeed
      );
      success = result.success;
      win = result.win;
      profit = result.profit;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      logger.error(`Error placing bet on site: ${errorMessage}`);
      return { success: false, message: 'Failed to place bet on site.' };
    }

    if (!success) {
      return { success: false, message: 'Failed to place bet on site.' };
    }

    this.currentProfit += profit;
    this.currentBalance += profit;

    if (win) {
      this.wins++;
      this.winStreak++;
      this.lossStreak = 0;
      if (this.winStreak > this.maxWinStreak) {
        this.maxWinStreak = this.winStreak;
      }
      logger.info(`Bet #${this.totalBets}: WIN! Profit: ${profit.toFixed(8)}. Current Profit: ${this.currentProfit.toFixed(8)}`);
      // Apply increase on win logic
      if (this.config.increaseOnWin.type === 'percentage') {
        this.currentBetAmount *= (1 + this.config.increaseOnWin.value / 100);
        logger.debug(`Increased bet by ${this.config.increaseOnWin.value}% to ${this.currentBetAmount.toFixed(8)}`);
      } else if (this.config.increaseOnWin.type === 'fixed') {
        this.currentBetAmount += this.config.increaseOnWin.value;
        logger.debug(`Increased bet by fixed ${this.config.increaseOnWin.value} to ${this.currentBetAmount.toFixed(8)}`);
      }
      if (this.config.increaseOnWin.resetBaseBet) {
        this.currentBetAmount = this.config.baseBet;
        logger.debug(`Reset bet to baseBet: ${this.currentBetAmount.toFixed(8)}`);
      }
    } else {
      this.losses++;
      this.lossStreak++;
      this.winStreak = 0;
      if (this.lossStreak > this.maxLossStreak) {
        this.maxLossStreak = this.lossStreak;
      }
      logger.info(`Bet #${this.totalBets}: LOSS! Loss: ${profit.toFixed(8)}. Current Profit: ${this.currentProfit.toFixed(8)}`);
      // Apply increase on loss logic
      if (this.config.increaseOnLoss.type === 'percentage') {
        this.currentBetAmount *= (1 + this.config.increaseOnLoss.value / 100);
        logger.debug(`Increased bet by ${this.config.increaseOnLoss.value}% to ${this.currentBetAmount.toFixed(8)}`);
      } else if (this.config.increaseOnLoss.type === 'fixed') {
        this.currentBetAmount += this.config.increaseOnLoss.value;
        logger.debug(`Increased bet by fixed ${this.config.increaseOnLoss.value} to ${this.currentBetAmount.toFixed(8)}`);
      }
      if (this.config.increaseOnLoss.resetBaseBet) {
        this.currentBetAmount = this.config.baseBet;
        logger.debug(`Reset bet to baseBet: ${this.currentBetAmount.toFixed(8)}`);
      }
    }

    // Record bet to database
    this.recordBet({
      site: this.site.name,
      amount: this.currentBetAmount,
      payout: this.config.payoutMultiplier,
      win: win,
      profit: profit,
      strategy_name: strategyName,
      bet_parameters: JSON.stringify(this.config),
      balance_before_bet: balanceBeforeBet,
      balance_after_bet: this.currentBalance,
      client_seed_used: this.config.clientSeed,
      server_seed_used: this.config.serverSeed,
    });

    // Check stop conditions
    if (this.config.stopOnWin > 0 && this.currentProfit >= this.config.stopOnWin) {
      logger.info(`Target profit reached: ${this.currentProfit.toFixed(8)} >= ${this.config.stopOnWin.toFixed(8)}`);
      return { success: true, message: 'Target profit reached.', betResult: { win, profit } };
    }
    if (this.config.stopOnLoss > 0 && this.currentProfit <= -this.config.stopOnLoss) {
      logger.warn(`Stop loss reached: ${this.currentProfit.toFixed(8)} <= -${this.config.stopOnLoss.toFixed(8)}`);
      return { success: true, message: 'Stop loss reached.', betResult: { win, profit } };
    }

    const profitPercentage = (this.initialBalance > 0) ? (this.currentProfit / this.initialBalance) * 100 : 0;

    if (this.config.stopOnWinPercentage && this.config.stopOnWinPercentage > 0 && profitPercentage >= this.config.stopOnWinPercentage) {
      logger.info(`Target profit percentage reached: ${profitPercentage.toFixed(2)}% >= ${this.config.stopOnWinPercentage.toFixed(2)}%`);
      return { success: true, message: 'Target profit percentage reached.', betResult: { win, profit } };
    }

    if (this.config.stopOnLossPercentage && this.config.stopOnLossPercentage > 0 && profitPercentage <= -this.config.stopOnLossPercentage) {
      logger.warn(`Stop loss percentage reached: ${profitPercentage.toFixed(2)}% <= -${this.config.stopOnLossPercentage.toFixed(2)}%`);
      return { success: true, message: 'Stop loss percentage reached.', betResult: { win, profit } };
    }

    return { success: true, betResult: { win, profit } };
  }

  // Get current betting statistics
  getStats(): {
    currentBetAmount: number;
    currentProfit: number;
    totalBets: number;
    wins: number;
    losses: number;
    winStreak: number;
    lossStreak: number;
    maxWinStreak: number;
    maxLossStreak: number;
    initialBalance: number;
    currentBalance: number;
    profitPercentage: number;
    error?: string; // Add optional error property
  } {
    return {
      currentBetAmount: this.currentBetAmount,
      currentProfit: this.currentProfit,
      totalBets: this.totalBets,
      wins: this.wins,
      losses: this.losses,
      winStreak: this.winStreak,
      lossStreak: this.lossStreak,
      maxWinStreak: this.maxWinStreak,
      maxLossStreak: this.maxLossStreak,
      initialBalance: this.initialBalance,
      currentBalance: this.currentBalance,
      profitPercentage: (this.initialBalance > 0) ? (this.currentProfit / this.initialBalance) * 100 : 0,
    };
  }

  private recordBet(betData: {
    site: string;
    amount: number;
    payout: number;
    win: boolean;
    profit: number;
    strategy_name: string;
    bet_parameters: string;
    balance_before_bet: number;
    balance_after_bet: number;
    client_seed_used: string;
    server_seed_used: string;
  }) {
    try {
      const db = getDb();
      const stmt = db.prepare(`
        INSERT INTO bets (
          site, amount, payout, win, profit, timestamp,
          strategy_name, bet_parameters, balance_before_bet, balance_after_bet,
          client_seed_used, server_seed_used
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        betData.site,
        betData.amount,
        betData.payout,
        betData.win ? 1 : 0, // SQLite stores BOOLEAN as INTEGER (0 or 1)
        betData.profit,
        betData.strategy_name,
        betData.bet_parameters,
        betData.balance_before_bet,
        betData.balance_after_bet,
        betData.client_seed_used,
        betData.server_seed_used
      );
      logger.info('Bet recorded to database.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      logger.error(`Failed to record bet to database: ${errorMessage}`);
    }
  }
}

export { PlayDice };