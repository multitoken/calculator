import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractRebalanceExecutor } from './AbstractRebalanceExecutor';
import { DiffPercentRebalanceExecutor } from './DiffPercentRebalanceExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class DiffPercentRebalanceExecutorImpl extends AbstractRebalanceExecutor
  implements DiffPercentRebalanceExecutor {

  private percent: number;

  constructor(multitoken: Multitoken, priority: number) {
    super(multitoken, priority);

    this.percent = 0;
  }

  public setupDiffPercent(percent: number): void {
    console.log('set diff percent', percent);
    this.percent = percent;
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | any {
    super.execute(timeLineIndex, historyPriceInTime, timestamp, btcAmount, txPrice);

    const weights: Map<string, number> = this.multitoken.getWeights();
    const amounts: Map<string, number> = this.multitoken.getAmounts();

    let downPercentDiff: number = 0;
    let upPercentDiff: number = 0;
    let diff: number = 0;

    historyPriceInTime.forEach((price, name) => {
      diff = price / (this.oldCoinsPrice.get(name) || 0);

      if (downPercentDiff === 0 || downPercentDiff > diff) {
        downPercentDiff = diff;
      }

      if (upPercentDiff === 0 || upPercentDiff < diff) {
        upPercentDiff = diff;
      }
    });

    if ((upPercentDiff / downPercentDiff - 1) * 100 < this.percent) {
      return undefined;
    }

    let amount: number = 0;
    let maxProportions: number = 0;

    amounts.forEach((value, key) => {
      amount += value * (historyPriceInTime.get(key) || 0);
    });

    const txFee: number = this.calculateTxFee(txPrice, historyPriceInTime);

    historyPriceInTime.forEach((value, key) => this.oldCoinsPrice.set(key, value));

    amount = Math.max(amount - txFee, 0);

    if (amount <= 0) {
      return undefined;
    }

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
