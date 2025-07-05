import { StrategyConfig } from './strategies';
import { Martingale } from './Martingale';
import { Dalembert } from './Dalembert';
import { getStrategies } from '../../app/actions'; // To fetch custom strategies from DB
import { logger } from '../../app/lib/logger';

class StrategyManager {
  private builtInStrategies: Map<string, StrategyConfig> = new Map();
  private customStrategies: Map<string, StrategyConfig> = new Map();

  constructor() {
    this.loadBuiltInStrategies();
    this.loadCustomStrategies(); // Load custom strategies on startup
  }

  private loadBuiltInStrategies() {
    this.builtInStrategies.set(Martingale.name, Martingale);
    this.builtInStrategies.set(Dalembert.name, Dalembert);
    logger.info('Built-in strategies loaded:', Array.from(this.builtInStrategies.keys()));
  }

  async loadCustomStrategies() {
    const result = await getStrategies();
    if (result.success && result.strategies) {
      this.customStrategies.clear(); // Clear existing custom strategies
      result.strategies.forEach(s => {
        this.customStrategies.set(s.name, s);
      });
      logger.info('Custom strategies loaded:', Array.from(this.customStrategies.keys()));
    } else {
      logger.error('Failed to load custom strategies:', result.message);
    }
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
