import { PlayDice, BettingConfig } from '../app/lib/wolfbet';
import { DiceSite } from '../app/lib/sites/DiceSite';

// Mock DiceSite implementation for testing
const mockDiceSite: DiceSite = {
  name: 'MockSite',
  login: jest.fn(async (apiKey: string) => apiKey === 'valid_key'),
  getBalance: jest.fn(async (apiKey: string) => (apiKey === 'valid_key' ? 1000 : 0)),
  placeBet: jest.fn(async (apiKey: string, amount: number, betRule: 'over' | 'under', betChance: number, clientSeed: string, serverSeed: string) => {
    if (apiKey !== 'valid_key') return { success: false, win: false, profit: 0 };
    const win = Math.random() * 100 < betChance;
    const profit = win ? amount * (99 / betChance - 1) : -amount;
    return { success: true, win, profit };
  }),
  withdraw: jest.fn(async (apiKey: string, amount: number, currency: string, address: string) => {
    if (apiKey !== 'valid_key') return { success: false, message: 'Invalid API key.' };
    if (amount <= 0) return { success: false, message: 'Invalid amount.' };
    return { success: true, message: 'Withdrawal successful.', transactionId: 'mock_tx_id' };
  }),
};

describe('PlayDice', () => {
  let config: BettingConfig;
  let playDice: PlayDice;

  beforeEach(() => {
    config = {
      baseBet: 1,
      payoutMultiplier: 2,
      stopOnWin: 100,
      stopOnLoss: 50,
      increaseOnWin: { type: 'none', value: 0, resetBaseBet: false },
      increaseOnLoss: { type: 'none', value: 0, resetBaseBet: false },
      betRule: 'over',
      betChance: 49.5,
      clientSeed: 'test_client_seed',
      serverSeed: 'test_server_seed',
    };
    playDice = new PlayDice(mockDiceSite, config, 1000);
    jest.clearAllMocks();
  });

  it('should initialize with correct values', () => {
    const stats = playDice.getStats();
    expect(stats.currentBetAmount).toBe(config.baseBet);
    expect(stats.currentProfit).toBe(0);
    expect(stats.totalBets).toBe(0);
    expect(stats.initialBalance).toBe(1000);
    expect(stats.currentBalance).toBe(1000);
  });

  it('should place a bet and update stats on win', async () => {
    // Mock placeBet to always win
    mockDiceSite.placeBet.mockResolvedValueOnce({ success: true, win: true, profit: 1 });

    const result = await playDice.placeBet('valid_key');
    expect(result.success).toBe(true);
    expect(playDice.getStats().totalBets).toBe(1);
    expect(playDice.getStats().wins).toBe(1);
    expect(playDice.getStats().currentProfit).toBe(1);
    expect(playDice.getStats().currentBalance).toBe(1001);
    expect(playDice.getStats().winStreak).toBe(1);
    expect(playDice.getStats().lossStreak).toBe(0);
  });

  it('should place a bet and update stats on loss', async () => {
    // Mock placeBet to always lose
    mockDiceSite.placeBet.mockResolvedValueOnce({ success: true, win: false, profit: -1 });

    const result = await playDice.placeBet('valid_key');
    expect(result.success).toBe(true);
    expect(playDice.getStats().totalBets).toBe(1);
    expect(playDice.getStats().losses).toBe(1);
    expect(playDice.getStats().currentProfit).toBe(-1);
    expect(playDice.getStats().currentBalance).toBe(999);
    expect(playDice.getStats().winStreak).toBe(0);
    expect(playDice.getStats().lossStreak).toBe(1);
  });

  it('should stop on win when target profit is reached', async () => {
    config.stopOnWin = 1;
    playDice = new PlayDice(mockDiceSite, config, 1000);
    mockDiceSite.placeBet.mockResolvedValueOnce({ success: true, win: true, profit: 1 });

    const result = await playDice.placeBet('valid_key');
    expect(result.success).toBe(true);
    expect(result.message).toBe('Target profit reached.');
  });

  it('should stop on loss when max loss is reached', async () => {
    config.stopOnLoss = 1;
    playDice = new PlayDice(mockDiceSite, config, 1000);
    mockDiceSite.placeBet.mockResolvedValueOnce({ success: true, win: false, profit: -1 });

    const result = await playDice.placeBet('valid_key');
    expect(result.success).toBe(true);
    expect(result.message).toBe('Stop loss reached.');
  });

  it('should increase bet on win by percentage', async () => {
    config.increaseOnWin = { type: 'percentage', value: 10, resetBaseBet: false };
    playDice = new PlayDice(mockDiceSite, config, 1000);
    mockDiceSite.placeBet.mockResolvedValueOnce({ success: true, win: true, profit: 1 });

    await playDice.placeBet('valid_key');
    expect(playDice.getStats().currentBetAmount).toBeCloseTo(1 * (1 + 10 / 100));
  });

  it('should increase bet on loss by fixed amount', async () => {
    config.increaseOnLoss = { type: 'fixed', value: 0.5, resetBaseBet: false };
    playDice = new PlayDice(mockDiceSite, config, 1000);
    mockDiceSite.placeBet.mockResolvedValueOnce({ success: true, win: false, profit: -1 });

    await playDice.placeBet('valid_key');
    expect(playDice.getStats().currentBetAmount).toBeCloseTo(1 + 0.5);
  });

  it('should reset base bet on win', async () => {
    config.increaseOnWin = { type: 'fixed', value: 0.5, resetBaseBet: true };
    // Set increaseOnLoss for the first bet to make currentBetAmount change
    config.increaseOnLoss = { type: 'fixed', value: 0.5, resetBaseBet: false };
    playDice = new PlayDice(mockDiceSite, config, 1000);
    // First bet to change currentBetAmount
    mockDiceSite.placeBet.mockResolvedValueOnce({ success: true, win: false, profit: -1 });
    await playDice.placeBet('valid_key');
    expect(playDice.getStats().currentBetAmount).toBeCloseTo(1 + 0.5);

    // Second bet to win and reset
    mockDiceSite.placeBet.mockResolvedValueOnce({ success: true, win: true, profit: 1 });
    await playDice.placeBet('valid_key');
    expect(playDice.getStats().currentBetAmount).toBe(config.baseBet);
  });
});
