import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { PortfolioManager } from './PortfolioManager';
import { ProgressListener } from './ProgressListener';

export interface MultiPortfolioExecutor {

  addPortfolioManager(portfolioManager: PortfolioManager): void;

  executeCalculation(): Promise<RebalanceHistory[]>;

  subscribeToProgress(listener?: ProgressListener): void;

}
