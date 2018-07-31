import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { PortfolioManager } from './PortfolioManager';
import { RebalanceResult } from './RebalanceResult';

export class RebalanceResultImpl implements RebalanceResult {

  private dateMinIndex: number;
  private dateMaxIndex: number;
  private amount: number;
  private btcUsdt: number;
  private stepSec: number;
  private arbiterCap: number;
  private cap: number;
  private arbitrageLen: number;
  private arbiterProfit: number;
  private arbiterTotalTxFee: number;

  constructor(portfolioManager: PortfolioManager) {
    this.dateMinIndex = portfolioManager.getCalculationDate()[0];
    this.dateMaxIndex = portfolioManager.getCalculationDate()[1];
    this.amount = portfolioManager.getAmount();
    this.stepSec = portfolioManager.getStepSec();

    this.arbiterProfit = 0;
    this.arbiterTotalTxFee = 0;

    const btcusdtHistory: TokenPriceHistory[] = portfolioManager.getBtcPrice();
    const btcusdtStartValue: number = btcusdtHistory.length > this.dateMinIndex
      ? btcusdtHistory[this.dateMinIndex].value
      : 1;

    const btcusdtEndValue: number = btcusdtHistory.length > this.dateMaxIndex
      ? btcusdtHistory[this.dateMaxIndex].value
      : 0;

    const btcCount: number = this.amount / btcusdtStartValue;
    this.btcUsdt = btcCount * btcusdtEndValue;

    this.arbitrageLen = 0;
    this.cap = portfolioManager.getAmount();
    this.arbiterCap = portfolioManager.getAmount();
    this.arbiterProfit = 0;
    this.arbiterTotalTxFee = 0;
  }

  public calculateRebalanceHistory(rebalanceHistory: RebalanceHistory): void {
    this.arbiterCap = rebalanceHistory.getRebalancedCap();
    this.cap = rebalanceHistory.getCap();

    rebalanceHistory.arbitrage.forEach(value => {
      this.arbiterProfit += value.arbiterProfit;
      this.arbiterTotalTxFee += value.txPrice;
    });
    this.arbitrageLen = rebalanceHistory.arbitrage.length;
  }

  public capWithRebalance(): string {
    return this.formatCurrency(this.arbiterCap.toFixed(0));
  }

  public profitWithRebalance(): string {
    return this.formatCurrency((this.arbiterCap - this.amount).toFixed(0));
  }

  public profitPercentWithRebalance(): string {
    return ((this.arbiterCap - this.amount) / this.amount * 100).toFixed(0);
  }

  public profitPercentYearWithRebalance(): string {
    const percents: number = (this.arbiterCap - this.amount) / this.amount * 100;
    return ((percents / this.calcCountDays() * 365) || 0).toFixed(0);
  }

  public capWithoutRebalance(): string {
    return this.formatCurrency(this.cap.toFixed(0));
  }

  public profitWithoutRebalance(): string {
    return this.formatCurrency((this.cap - this.amount).toFixed(0));
  }

  public profitPercentWithoutRebalance(): string {
    return ((this.cap - this.amount) / this.amount * 100).toFixed(0);
  }

  public profitPercentYearWithoutRebalance(): string {
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

    return Math.floor(((max - min) / (60 / this.stepSec)) / 60 / 24);
  }

  private formatCurrency(value: string): string {
    return parseFloat(value).toLocaleString();
  }

}
