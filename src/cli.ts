import { Command } from 'commander';
import { startBot, stopBot, getBotStatus } from './app/lib/botManager';
import { BettingConfig } from './app/lib/wolfbet';
import { getStrategies, saveStrategy, deleteStrategy, placeManualBet } from './app/actions';
import { logger } from './app/lib/logger';

const program = new Command();

program
  .name('wolfbot')
  .description('CLI for controlling the Wolfbet Dice Bot')
  .version('0.1.0');

program.command('start')
  .description('Start the automated betting bot')
  .argument('<siteName>', 'Name of the dice site (e.g., Primedice)')
  .argument('<apiKey>', 'API key for the dice site')
  .option('-b, --baseBet <number>', 'Initial bet amount', parseFloat, 0.00000001)
  .option('-p, --payoutMultiplier <number>', 'Payout multiplier', parseFloat, 2)
  .option('-sw, --stopOnWin <number>', 'Target profit to stop', parseFloat, 0)
  .option('-sl, --stopOnLoss <number>', 'Max loss to stop', parseFloat, 0)
  .option('-iwinType, --increaseOnWinType <type>', 'Increase on win type (none, percentage, fixed)', 'none')
  .option('-iwinValue, --increaseOnWinValue <number>', 'Increase on win value', parseFloat, 0)
  .option('-iwinReset, --increaseOnWinReset', 'Reset base bet on win', false)
  .option('-ilosType, --increaseOnLossType <type>', 'Increase on loss type (none, percentage, fixed)', 'none')
  .option('-ilosValue, --increaseOnLossValue <number>', 'Increase on loss value', parseFloat, 0)
  .option('-ilosReset, --increaseOnLossReset', 'Reset base bet on loss', false)
  .option('-br, --betRule <rule>', 'Bet rule (over, under)', 'over')
  .option('-bc, --betChance <number>', 'Bet chance percentage', parseFloat, 49.5)
  .option('-cs, --clientSeed <string>', 'Client seed', '')
  .option('-ss, --serverSeed <string>', 'Server seed', '')
  .action(async (siteName, apiKey, options) => {
    const config: BettingConfig = {
      baseBet: options.baseBet,
      payoutMultiplier: options.payoutMultiplier,
      stopOnWin: options.stopOnWin,
      stopOnLoss: options.stopOnLoss,
      increaseOnWin: {
        type: options.increaseOnWinType,
        value: options.increaseOnWinValue,
        resetBaseBet: options.increaseOnWinReset,
      },
      increaseOnLoss: {
        type: options.increaseOnLossType,
        value: options.increaseOnLossValue,
        resetBaseBet: options.increaseOnLossReset,
      },
      betRule: options.betRule,
      betChance: options.betChance,
      clientSeed: options.clientSeed,
      serverSeed: options.serverSeed,
    };

    logger.info('Starting bot...');
    const result = await startBot(siteName, apiKey, config);
    if (result.success) {
      logger.info('Bot started successfully.');
    } else {
      logger.error('Failed to start bot:', result.error);
    }
  });

program.command('stop')
  .description('Stop the automated betting bot')
  .action(() => {
    logger.info('Stopping bot...');
    const result = stopBot();
    logger.info(result.message);
  });

program.command('status')
  .description('Get the current status of the bot')
  .action(() => {
    logger.info('Fetching bot status...');
    const status = getBotStatus();
    logger.info('Bot Status:', status.status);
    if (status.stats) {
      logger.info('Current Stats:', status.stats);
    }
  });

program.command('manual-bet')
  .description('Place a single manual bet')
  .argument('<siteName>', 'Name of the dice site (e.g., Primedice)')
  .argument('<apiKey>', 'API key for the dice site')
  .argument('<amount>', 'Bet amount', parseFloat)
  .argument('<betRule>', 'Bet rule (over, under)')
  .argument('<betChance>', 'Bet chance percentage', parseFloat)
  .action(async (siteName, apiKey, amount, betRule, betChance) => {
    logger.info('Placing manual bet...');
    const result = await placeManualBet(siteName, apiKey, amount, betRule, betChance);
    if (result.success) {
      logger.info('Manual bet placed successfully.');
      logger.info('Result:', result.win ? 'Win' : 'Loss');
      logger.info('Profit:', result.profit?.toFixed(8));
    } else {
      logger.error('Failed to place manual bet:', result.message);
    }
  });

program.command('strategies')
  .description('Manage betting strategies')
  .command('list')
  .description('List all saved strategies')
  .action(async () => {
    logger.info('Fetching strategies...');
    const result = await getStrategies();
    if (result.success && result.strategies) {
      if (result.strategies.length === 0) {
        logger.info('No strategies found.');
      } else {
        result.strategies.forEach(s => {
          logger.info(`- ${s.name} (${s.description || 'No description'})`);
          logger.info(`  Base Bet: ${s.baseBet}, Payout: ${s.payoutMultiplier}, Chance: ${s.betChance}%`);
        });
      }
    } else {
      logger.error('Failed to fetch strategies:', result.message);
    }
  });

program.command('strategies')
  .command('delete')
  .description('Delete a saved strategy')
  .argument('<name>', 'Name of the strategy to delete')
  .action(async (name) => {
    logger.info(`Deleting strategy '${name}'...`);
    const result = await deleteStrategy(name);
    if (result.success) {
      logger.info(result.message);
    } else {
      logger.error('Failed to delete strategy:', result.message);
    }
  });

program.parse(process.argv);
