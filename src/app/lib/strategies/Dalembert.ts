import { StrategyConfig } from '../strategies';

export const Dalembert: StrategyConfig = {
  name: 'dAlembert',
  description: 'Increases bet by 1 unit on loss, decreases by 1 unit on win.',
  baseBet: 0.00000001,
  payoutMultiplier: 2,
  stopOnWin: 0,
  stopOnLoss: 0,
  increaseOnWin: {
    type: 'fixed',
    value: -0.00000001, // Decrease by 1 unit
    resetBaseBet: false,
  },
  increaseOnLoss: {
    type: 'fixed',
    value: 0.00000001, // Increase by 1 unit
    resetBaseBet: false,
  },
  betRule: 'over',
  betChance: 49.5,
  clientSeed: '',
  serverSeed: '',
};
