import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { FakeRebalanceData } from '../../utils/FakeRebalanceData';
import { PortfolioManager } from './PortfolioManager';
import { RebalanceResultImpl } from './RebalanceResultImpl';

export class FakeRebalanceResultImpl extends RebalanceResultImpl {

  private data: number[] = [];

  constructor(portfolioManager: PortfolioManager) {
    super(portfolioManager);
    const name: string = Array.from(portfolioManager.getPriceHistory().keys())
      .sort()
      .join('/');

    this.data = FakeRebalanceData.DATA.get(name) || [];

    if (this.data.length === 0) {
      throw new Error('portfolio not found! ' + name);
    }

    this.calculatePortfolioData();
  }

  public calculateRebalanceHistory(rebalanceHistory: RebalanceHistory): void {
    this.arbiterCap = (this.data[0] / 10000) * this.amount;
    this.cap = (this.data[1] / 10000) * this.amount;
  }

  public getRebalanceHistory(): RebalanceHistory {
    return new RebalanceHistory([], [], []);
  }

  protected calculatePortfolioData(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    this.dateMinIndex = this.portfolioManager.getCalculationDate()[0];
    this.dateMaxIndex = this.portfolioManager.getCalculationDate()[1];
    this.amount = this.portfolioManager.getAmount();
    this.stepSec = this.portfolioManager.getStepSec();

    const btcusdtHistory: TokenPriceHistory[] = this.portfolioManager.getBtcPrice();
    const btcusdtStartValue: number = btcusdtHistory.length > this.dateMinIndex
      ? btcusdtHistory[this.dateMinIndex].value
      : 1;

    const btcusdtEndValue: number = btcusdtHistory.length > this.dateMaxIndex
      ? btcusdtHistory[this.dateMaxIndex].value
      : 0;

    const btcCount: number = this.amount / btcusdtStartValue;

    this.btcUsdt = btcCount * btcusdtEndValue;

    this.arbitrageLen = this.data[2];
    this.cap = this.portfolioManager.getAmount();
    this.arbiterCap = this.portfolioManager.getAmount();
    this.arbiterProfit = this.data[3];
    this.arbiterTotalTxFee = this.data[4];
    this.rebalanceHistory = new RebalanceHistory([], [], []);
  }

}
