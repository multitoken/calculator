import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractExecutor } from './AbstractExecutor';

export abstract class AbstractRebalanceExecutor extends AbstractExecutor {

  protected multitoken: Multitoken;
  protected readonly oldCoinsPrice: Map<string, number>;

  constructor(multitoken: Multitoken, priority: number) {
    super([multitoken], priority);

    this.multitoken = multitoken;
    this.oldCoinsPrice = new Map();
  }

  public prepareCalculation(btcHistoryPrice: TokenPriceHistory[],
                            timeLineStep: number,
                            amount: number,
                            startIndex: number,
                            endIndex: number): void {
    this.oldCoinsPrice.clear();
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | undefined {
    if (this.oldCoinsPrice.size === 0) {
      historyPriceInTime.forEach((value, key) => this.oldCoinsPrice.set(key, value));
    }

    return undefined;
  }

  protected calculateTxFee(txPrice: number, historyPriceInTime: Map<string, number>): number {
    const coinsOldCap: Map<string, number> = this.calculateCap(this.multitoken.getAmounts(), this.oldCoinsPrice);
    const coinsCurCap: Map<string, number> = this.calculateCap(this.multitoken.getAmounts(), historyPriceInTime);

    return this.calculateFee(
      txPrice,
      coinsOldCap,
      coinsCurCap
    );
  }

  private calculateFee(txPrice: number,
                       prevCoinsCap: Map<string, number>,
                       currentCoinsCap: Map<string, number>): number {
    let changeCap: number = 0;
    prevCoinsCap.forEach((value, key) => {
      changeCap += Math.abs(value - (currentCoinsCap.get(key) || 0));
    });

    changeCap /= 2;

    return changeCap * 0.0025 + txPrice * (prevCoinsCap.size - 1);
  }

  private calculateCap(amounts: Map<string, number>, prices: Map<string, number>): Map<string, number> {
    const result: Map<string, number> = new Map();
    amounts.forEach((value, key) => {
      result.set(key, value * (prices.get(key) || 0));
    });

    return result;
  }

}
