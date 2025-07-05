import { StrategyConfig } from '../strategies';

export const Martingale: StrategyConfig = {
  name: 'Martingale',
  description: 'Doubles bet on loss, resets on win.',
  baseBet: 0.00000001,
  payoutMultiplier: 2,
  stopOnWin: 0,
  stopOnLoss: 0,
  increaseOnWin: {
    type: 'none',
    value: 0,
    resetBaseBet: true,
  },
  increaseOnLoss: {
    type: 'percentage',
    value: 100,
    resetBaseBet: false,
  },
  betRule: 'over',
  betChance: 49.5,
  clientSeed: '',
  serverSeed: '',
};
