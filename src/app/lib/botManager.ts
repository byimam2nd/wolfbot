import { PlayDice } from './wolfbet';

let botInstance: PlayDice | null = null;
let botStatus = 'Idle';
let botConfig: any = {}; // Will hold the config from the frontend
let botInterval: NodeJS.Timeout | null = null;

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

const startBot = (accessToken: string, config: any) => {
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
