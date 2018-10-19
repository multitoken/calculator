import { PortfolioManager } from './PortfolioManager';
import { ProgressListener } from './ProgressListener';
import { RebalanceResult } from './RebalanceResult';

export interface MultiPortfolioExecutor {

  addPortfolioManager(portfolioManager: PortfolioManager): void;

  getPortfolios(): Map<PortfolioManager, RebalanceResult>;

  removeAllPortfolios(): void;

  executeCalculation(): Promise<RebalanceResult[]>;

  subscribeToProgress(listener?: ProgressListener): void;

}
