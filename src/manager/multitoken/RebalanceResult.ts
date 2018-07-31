import { RebalanceHistory } from '../../repository/models/RebalanceHistory';

export interface RebalanceResult {

  calculateRebalanceHistory(rebalanceHistory: RebalanceHistory): void;

  capWithRebalance(): string;

  profitWithRebalance(): string;

  profitPercentWithRebalance(): string;

  profitPercentYearWithRebalance(): string;

  capWithoutRebalance(): string;

  profitWithoutRebalance(): string;

  profitPercentWithoutRebalance(): string;

  profitPercentYearWithoutRebalance(): string;

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
