import { Portfolio } from '../../repository/models/Portfolio';
import { RebalanceHistory } from '../../repository/models/RebalanceHistory';

export interface RebalanceResult {

  getPortfolio(): Portfolio;

  calculateRebalanceHistory(rebalanceHistory: RebalanceHistory): void;

  getRebalanceHistory(): RebalanceHistory;

  capWithRebalance(): string;

  profitWithRebalance(): string;

  roiWithRebalance(): string;

  roiYearWithRebalance(): string;

  capWithoutRebalance(): string;

  profitWithoutRebalance(): string;

  roiWithoutRebalance(): string;

  roiYearWithoutRebalance(): string;

  totalEthFee(): string;

  avgEthFee(): string;

  capBtc(): string;

  profitBtc(): string;

  profitPercentBtc(): string;

  profitPercentYearBtc(): string;

  totalArbiterProfit(): string;

  avgArbiterProfit(): string;

  getArbitrageListLen(): number;

  calcCountDays(): number;

}
