import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractExecutor } from './AbstractExecutor';
import { DiffPercentRebalanceExecutor } from './DiffPercentRebalanceExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class DiffPercentRebalanceExecutorImpl extends AbstractExecutor implements DiffPercentRebalanceExecutor {

  private multitoken: Multitoken;
  private percent: number;
  private readonly oldCoinsPrice: Map<string, number>;

  constructor(multitoken: Multitoken, priority: number) {
    super([multitoken], priority);

    this.multitoken = multitoken;
    this.percent = 0;
    this.oldCoinsPrice = new Map();
  }

  public setupDiffPercent(percent: number): void {
    console.log('set diff percent', percent);
    this.percent = percent;
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
                 txPrice: number): ExecuteResult | any {
    const weights: Map<string, number> = this.multitoken.getWeights();
    const amounts: Map<string, number> = this.multitoken.getAmounts();

    if (this.oldCoinsPrice.size === 0) {
      historyPriceInTime.forEach((value, key) => this.oldCoinsPrice.set(key, value));

      return undefined;
    }

    let down: number = 0;
    let up: number = 0;
    let downPercentDiff: number = 0;
    let upPercentDiff: number = 0;
    let diff: number = 0;

    historyPriceInTime.forEach((price, name) => {
      diff = price - (this.oldCoinsPrice.get(name) || 0);

      if (down > diff && diff < 0) {
        down = diff;
        downPercentDiff = (this.oldCoinsPrice.get(name) || 0) / price  - 1;
      }

      if (up < diff && diff > 0) {
        up = diff;
        upPercentDiff = price / (this.oldCoinsPrice.get(name) || 0) - 1;
      }
    });

    if (upPercentDiff < 0 || downPercentDiff < 0 || (upPercentDiff + downPercentDiff) * 100 < this.percent) {
      return undefined;
    }

    historyPriceInTime.forEach((value, key) => this.oldCoinsPrice.set(key, value));

    let amount: number = 0;
    let countCoins: number = 0;
    let maxProportions: number = 0;

    amounts.forEach((value, key) => {
      countCoins++;
      amount += value * (historyPriceInTime.get(key) || 0);
    });

    if (amount <= 0) {
      return undefined;
    }

    amount = Math.max(amount - txPrice * countCoins, 0);

    weights.forEach((value, key) => maxProportions += value);

    historyPriceInTime.forEach((value, key) => {
      const weight: number = weights.get(key) || 0;

      const amountPerCurrency = weight / maxProportions * amount;

      const count: number = amountPerCurrency / value;

      amounts.set(key, count);
    });

    this.multitoken.setup(amounts, weights);

    return undefined;
  }

  public getType(): ExecutorType {
    return ExecutorType.DIFF_PERCENT_REBALANCER;
  }

}
