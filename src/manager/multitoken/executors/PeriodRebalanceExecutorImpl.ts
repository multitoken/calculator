import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractRebalanceExecutor } from './AbstractRebalanceExecutor';
import { PeriodRebalanceExecutor } from './PeriodRebalanceExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class PeriodRebalanceExecutorImpl extends AbstractRebalanceExecutor implements PeriodRebalanceExecutor {

  private period: number;
  private timeLineStep: number;

  constructor(multitoken: Multitoken, priority: number) {
    super(multitoken, priority);

    this.period = 0;
  }

  public setupPeriod(sec: number): void {
    console.log('set period', sec);
    this.period = sec;
  }

  public prepareCalculation(btcHistoryPrice: TokenPriceHistory[],
                            timeLineStep: number,
                            amount: number,
                            startIndex: number,
                            endIndex: number): void {
    super.prepareCalculation(btcHistoryPrice, timeLineStep, amount, startIndex, endIndex);

    this.timeLineStep = timeLineStep;
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | any {
    super.execute(timeLineIndex, historyPriceInTime, timestamp, btcAmount, txPrice);

    const weights: Map<string, number> = this.multitoken.getWeights();
    const amounts: Map<string, number> = this.multitoken.getAmounts();

    if ((this.timeLineStep * timeLineIndex) % this.period !== 0) {
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
    return ExecutorType.PERIOD_REBALANCER;
  }

}
