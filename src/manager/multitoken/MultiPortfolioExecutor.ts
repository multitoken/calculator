import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { PortfolioManager } from './PortfolioManager';
import { ProgressListener } from './ProgressListener';
import { RebalanceResult } from './RebalanceResult';

export interface MultiPortfolioExecutor {

  addPortfolioManager(portfolioManager: PortfolioManager): void;

  getPortfolios(): Map<PortfolioManager, RebalanceResult>;

  removeAllPortfolios(): void;

  executeCalculation(): Promise<RebalanceHistory[]>;

  subscribeToProgress(listener?: ProgressListener): void;

}
