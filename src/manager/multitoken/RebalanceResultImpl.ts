import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { PortfolioManager } from './PortfolioManager';
import { RebalanceResult } from './RebalanceResult';

export class RebalanceResultImpl implements RebalanceResult {

  protected dateMinIndex: number;
  protected dateMaxIndex: number;
  protected amount: number;
  protected btcUsdt: number;
  protected stepSec: number;
  protected arbiterCap: number;
  protected cap: number;
  protected arbitrageLen: number;
  protected arbiterProfit: number;
  protected arbiterTotalTxFee: number;
  protected rebalanceHistory: RebalanceHistory;
  protected portfolioManager: PortfolioManager;

  constructor(portfolioManager: PortfolioManager) {
    this.portfolioManager = portfolioManager;
    this.calculatePortfolioData();
  }

  public calculateRebalanceHistory(rebalanceHistory: RebalanceHistory): void {
    this.calculatePortfolioData();
    this.rebalanceHistory = rebalanceHistory;

    this.arbiterCap = rebalanceHistory.getRebalancedCap();
    this.cap = rebalanceHistory.getCap();

    rebalanceHistory.arbitrage.forEach(value => {
      this.arbiterProfit += value.arbiterProfit;
      this.arbiterTotalTxFee += value.txPrice;
    });
    this.arbitrageLen = rebalanceHistory.arbitrage.length;
  }

  public getRebalanceHistory(): RebalanceHistory {
    return this.rebalanceHistory;
  }

  public capWithRebalance(): string {
    return this.formatCurrency(this.arbiterCap.toFixed(0));
  }

  public profitWithRebalance(): string {
    return this.formatCurrency((this.arbiterCap - this.amount).toFixed(0));
  }

  public roiWithRebalance(): string {
    return ((this.arbiterCap - this.amount) / this.amount * 100).toFixed(0);
  }

  public roiYearWithRebalance(): string {
    const percents: number = (this.arbiterCap - this.amount) / this.amount * 100;
    return ((percents / this.calcCountDays() * 365) || 0).toFixed(0);
  }

  public capWithoutRebalance(): string {
    return this.formatCurrency(this.cap.toFixed(0));
  }

  public profitWithoutRebalance(): string {
    return this.formatCurrency((this.cap - this.amount).toFixed(0));
  }

  public roiWithoutRebalance(): string {
    return ((this.cap - this.amount) / this.amount * 100).toFixed(0);
  }

  public roiYearWithoutRebalance(): string {
    const percents: number = (this.cap - this.amount) / this.amount * 100;
    return ((percents / this.calcCountDays() * 365) || 0).toFixed(0);
  }

  public totalEthFee(): string {
    return this.formatCurrency(this.arbiterTotalTxFee.toFixed(0));
  }

  public avgEthFee(): string {
    return this.formatCurrency(((this.arbiterTotalTxFee / (this.getArbitrageListLen() || 1))).toFixed(3));
  }

  public capBtc(): string {
    return this.formatCurrency(this.btcUsdt.toFixed(0));
  }

  public profitBtc(): string {
    return this.formatCurrency((this.btcUsdt - this.amount).toFixed(0));
  }

  public profitPercentBtc(): string {
    return ((this.btcUsdt - this.amount) / this.amount * 100).toFixed(0);
  }

  public profitPercentYearBtc(): string {
    const percents: number = (this.btcUsdt - this.amount) / this.amount * 100;
    return ((percents / this.calcCountDays() * 365) || 0).toFixed(0);
  }

  public totalArbiterProfit(): string {
    return this.formatCurrency(this.arbiterProfit.toFixed(3));
  }

  public avgArbiterProfit(): string {
    return this.formatCurrency((this.arbiterProfit / (this.getArbitrageListLen() || 1)).toFixed(3));
  }

  public getArbitrageListLen(): number {
    return this.arbitrageLen;
  }

  public calcCountDays(): number {
    const min: number = this.dateMinIndex;
    const max: number = this.dateMaxIndex;

    return Math.max(1, Math.floor(((max - min) / (60 / this.stepSec)) / 60 / 24));
  }

  protected calculatePortfolioData(): void {
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

    this.arbitrageLen = 0;
    this.cap = this.portfolioManager.getAmount();
    this.arbiterCap = this.portfolioManager.getAmount();
    this.arbiterProfit = 0;
    this.arbiterTotalTxFee = 0;
    this.rebalanceHistory = new RebalanceHistory([], [], []);
  }

  private formatCurrency(value: string): string {
    return parseFloat(value).toLocaleString();
  }

}
