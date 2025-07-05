import { StrategyConfig } from '../strategies';
import { Martingale } from './Martingale';
import { Dalembert } from './Dalembert';
import { getStrategies } from '../../actions'; // To fetch custom strategies from DB

class StrategyManager {
  private builtInStrategies: Map<string, StrategyConfig> = new Map();
  private customStrategies: Map<string, StrategyConfig> = new Map();

  constructor() {
    this.loadBuiltInStrategies();
  }

  private loadBuiltInStrategies() {
    this.builtInStrategies.set(Martingale.name, Martingale);
    this.builtInStrategies.set(Dalembert.name, Dalembert);
  }

  setCustomStrategies(strategies: StrategyConfig[]) {
    this.customStrategies.clear();
    strategies.forEach(s => {
      this.customStrategies.set(s.name, s);
    });
  }

  getStrategy(name: string): StrategyConfig | undefined {
    if (this.builtInStrategies.has(name)) {
      return this.builtInStrategies.get(name);
    }
    if (this.customStrategies.has(name)) {
      return this.customStrategies.get(name);
    }
    return undefined;
  }

  getAllStrategies(): StrategyConfig[] {
    return Array.from(this.builtInStrategies.values()).concat(Array.from(this.customStrategies.values()));
  }

  getBuiltInStrategies(): StrategyConfig[] {
    return Array.from(this.builtInStrategies.values());
  }

  getCustomStrategies(): StrategyConfig[] {
    return Array.from(this.customStrategies.values());
  }
}

export const strategyManager = new StrategyManager();
