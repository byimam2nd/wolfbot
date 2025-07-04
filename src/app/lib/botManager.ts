import { PlayDice } from './wolfbet';

interface DataFileJson {
  bet: {
      currency?: string;
      amount?: string;
      rule?: string;
      multiplier?: string;
      bet_value?: string;
  };
  'Play Game': {
      Amount: string;
      'Chance to Win': {
          'Chance On': string;
          'Chance Min': string;
          'Chance Max': string;
          'Last Chance Game': string;
          'Chance Random': string;
      };
      Divider: string;
  };
  onGame: {
      if_lose_reset: string;
      if_win_reset: string;
      if_lose: string;
      if_win: string;
  };
  'basebet counter': string;
  'amount counter': string;
}

interface FileManager {
  dataFileJson: DataFileJson;
}

let botInstance: PlayDice | null = null;
let botRunning: boolean = false;
let botInterval: NodeJS.Timeout | null = null;
let currentStats: { profit: number; wins: number; losses: number; risk: string; } = { profit: 0, wins: 0, losses: 0, risk: 'No Risk' };
let config: { [key: string]: any } = {}; // Store config here

const fileManager: FileManager = {
  dataFileJson: {
    'bet': {},
    'Play Game': {
      'Amount': '0.0000001',
      'Chance to Win': {
        'Chance On': '50',
        'Chance Min': '1',
        'Chance Max': '99',
        'Last Chance Game': 'false',
        'Chance Random': 'false',
      },
      'Divider': '100000',
    },
    'onGame': {
      'if_lose_reset': 'false',
      'if_win_reset': 'false',
      'if_lose': '0',
      'if_win': '0',
    },
    'basebet counter': 'false',
    'amount counter': 'false',
  }
};

async function startBot(accessToken: string, newConfig: { [key: string]: any }) {
  if (botRunning) {
    return { success: false, error: 'Bot is already running.' };
  }

  config = newConfig; // Update config

  // Update fileManager with new config
  fileManager.dataFileJson['Play Game']['Amount'] = config.amount;
  fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = config.chanceOn;
  fileManager.dataFileJson['Play Game']['Divider'] = config.divider;
  fileManager.dataFileJson['onGame']['if_lose'] = config.ifLose;
  fileManager.dataFileJson['onGame']['if_win'] = config.ifWin;
  fileManager.dataFileJson['onGame']['if_win_reset'] = config.ifWinReset.toString();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  };

  botInstance = new PlayDice(config.currency, headers);
  botInstance.proccessBetData(fileManager);
  botInstance.statusBaseBalance = parseFloat(config.amount); // Initialize base balance

  botRunning = true;
  console.log('Bot started with config:', config);

  botInterval = setInterval(async () => {
    if (!botRunning) {
      clearInterval(botInterval!);
      botInterval = null;
      return;
    }

    try {
      botInstance!.setChance(fileManager);
      botInstance!.initChance(fileManager);
      botInstance!.basebetCounter(fileManager);
      await botInstance!.proccessPlaceBet();
      botInstance!.proccessChanceCounter(fileManager);
      botInstance!.initWinLose();
      botInstance!.ruleBetChance();
      botInstance!.nextbetCounter();
      botInstance!.bettingBalanceCounter();
      botInstance!.IsStrategy(fileManager);
      botInstance!.logData();

      currentStats = {
        profit: botInstance!.statusTotalProfitCounter,
        wins: botInstance!.statusTotalWin,
        losses: botInstance!.statusTotalLose,
        risk: botInstance!.getRiskAlert(),
      };

    } catch (error) {
      console.error('Bot error:', error);
      stopBot();
    }
  }, 5000); // Run every 5 seconds

  return { success: true };
}

function stopBot() {
  if (botRunning) {
    botRunning = false;
    if (botInterval) {
      clearInterval(botInterval);
      botInterval = null;
    }
    botInstance = null;
    console.log('Bot stopped.');
    return { message: 'Bot stopped.' };
  }
  return { message: 'Bot is not running.' };
}

function getBotStatus() {
  return {
    status: botRunning ? 'Running' : 'Idle',
    ...currentStats,
  };
}

export { startBot, stopBot, getBotStatus };