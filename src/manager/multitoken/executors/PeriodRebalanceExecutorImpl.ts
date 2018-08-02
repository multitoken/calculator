import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractExecutor } from './AbstractExecutor';
import { PeriodRebalanceExecutor } from './PeriodRebalanceExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class PeriodRebalanceExecutorImpl extends AbstractExecutor implements PeriodRebalanceExecutor {

  private multitoken: Multitoken;
  private period: number;
  private timeLineStep: number;

  constructor(multitoken: Multitoken, priority: number) {
    super([multitoken], priority);

    this.multitoken = multitoken;
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
    this.timeLineStep = timeLineStep;
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | any {
    const weights: Map<string, number> = this.multitoken.getWeights();
    const amounts: Map<string, number> = this.multitoken.getAmounts();

    if ((this.timeLineStep * timeLineIndex) % this.period !== 0) {
      return undefined;
    }

    let amount: number = 0;
    let countCoins: number = 0;
    let maxProportions: number = 0;

    amounts.forEach((value, key) => {
      countCoins++;
      amount += value * (historyPriceInTime.get(key) || 0);
    });

    amount = Math.max(amount - txPrice * countCoins, 0);

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
