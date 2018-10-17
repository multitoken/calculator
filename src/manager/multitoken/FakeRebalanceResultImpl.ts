import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { FakeRebalanceData } from '../../utils/FakeRebalanceData';
import { PortfolioManager } from './PortfolioManager';
import { RebalanceResultImpl } from './RebalanceResultImpl';

export class FakeRebalanceResultImpl extends RebalanceResultImpl {

  private data: any = {};

  constructor(portfolioManager: PortfolioManager) {
    super(portfolioManager);
    const name: string = Array.from(portfolioManager.getPriceHistory().keys())
      .sort()
      .join(',');

    this.data = FakeRebalanceData.DATA.get(name) || {};

    if (!this.data.hasOwnProperty('originCap')) {
      throw new Error('portfolio not found! ' + name);
    }

    this.calculatePortfolioData();
  }

  public calculateRebalanceHistory(rebalanceHistory: RebalanceHistory): void {
    this.arbiterCap = (this.data.rebalanceCap / 10000) * this.amount;
    this.cap = (this.data.originCap / 10000) * this.amount;
  }

  public getRebalanceHistory(): RebalanceHistory {
    return new RebalanceHistory([], [], []);
  }

  protected calculatePortfolioData(): void {
    if (!this.data || !this.data.hasOwnProperty('originCap')) {
      return;
    }

    this.dateMinIndex = 0;
    this.dateMaxIndex = this.data.lenDates;
    this.amount = this.portfolioManager.getAmount();
    this.stepSec = this.portfolioManager.getStepSec();

    const btcusdtStartValue: number = this.data.btcStart.value;

    const btcusdtEndValue: number = 6224.2;

    const btcCount: number = this.amount / btcusdtStartValue;

    this.btcUsdt = btcCount * btcusdtEndValue;

    this.arbitrageLen = this.data.arbitrageCount;
    this.cap = this.portfolioManager.getAmount();
    this.arbiterCap = this.portfolioManager.getAmount();
    this.arbiterProfit = this.data.arbitrageProfit;
    this.arbiterTotalTxFee = this.data.txFee;
    this.rebalanceHistory = new RebalanceHistory([], [], []);
  }

}
