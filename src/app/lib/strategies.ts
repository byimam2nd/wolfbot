import { BettingConfig } from './wolfbet';

export interface StrategyConfig extends BettingConfig {
  name: string;
  description: string;
}
