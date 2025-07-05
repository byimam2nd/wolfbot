import { DiceSite } from './DiceSite';
import { PrimediceSite } from './Primedice';
import { StakeSite } from './StakeSite';
import { logger } from '../../app/lib/logger';

class SiteManager {
  private sites: Map<string, DiceSite> = new Map();

  constructor() {
    this.loadSites();
    logger.info('SiteManager initialized. Available sites:', this.getAvailableSites());
  }

  private loadSites() {
    // Dynamically load sites here. For now, hardcode.
    const primedice = new PrimediceSite();
    this.sites.set(primedice.name, primedice);
    logger.debug(`Loaded site: ${primedice.name}`);

    const stake = new StakeSite();
    this.sites.set(stake.name, stake);
    logger.debug(`Loaded site: ${stake.name}`);
  }

  getSite(name: string): DiceSite | undefined {
    logger.debug(`Attempting to get site: ${name}`);
    return this.sites.get(name);
  }

  getAvailableSites(): string[] {
    return Array.from(this.sites.keys());
  }
}

export const siteManager = new SiteManager();
