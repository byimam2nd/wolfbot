import { PlayDice } from './wolfbet';
import axios from 'axios';

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
let botRunning = false;
let botInterval: NodeJS.Timeout | null = null;
let currentStats = { profit: 0, wins: 0, losses: 0, risk: 'No Risk' };
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

const getBotStatus = () => {
    if (!botInstance) {
        return {
            status: botStatus,
            profit: 0,
            wins: 0,
            losses: 0,
            risk: 'No Risk',
        };
    }
    return {
        status: botStatus,
        profit: botInstance.statusTotalProfitCounter,
        wins: botInstance.statusTotalWin,
        losses: botInstance.statusTotalLose,
        risk: botInstance.getRiskAlert(),
    };
};

async function startBot(accessToken: string, newConfig: { [key: string]: any }) {
    if (botStatus === 'Running') {
        return { success: false, message: 'Bot is already running.' };
    }

    const headers = { Authorization: `Bearer ${accessToken}` };
    botInstance = new PlayDice(config.currency, headers);
    botConfig = config;
    botStatus = 'Running';

    // Initialize bot with data
    // This part needs to be adapted from the original Python script's initialization

    botInterval = setInterval(async () => {
        if (botInstance) {
            try {
                // This is the main betting loop, translated from executor()
                botInstance.utilities();
                botInstance.setChance(botConfig);
                botInstance.initChance(botConfig);
                botInstance.basebetCounter(botConfig);
                await botInstance.proccessPlaceBet();
                botInstance.proccessChanceCounter(botConfig);
                botInstance.initWinLose();
                botInstance.ruleBetChance();
                botInstance.initChance(botConfig);
                botInstance.nextbetCounter();
                botInstance.bettingBalanceCounter();
                botInstance.placeChance(botConfig);
                botInstance.IsStrategy(botConfig);
                botInstance.logData();
            } catch (error) {
                console.error('Error in bot loop:', error);
                stopBot();
            }
        }
    }, 2000); // Interval between bets, can be configured

    return { success: true, message: 'Bot started.' };
};

const stopBot = () => {
    if (botInterval) {
        clearInterval(botInterval);
        botInterval = null;
    }
    botInstance = null;
    botStatus = 'Idle';
    return { success: true, message: 'Bot stopped.' };
};

export { getBotStatus, startBot, stopBot };
