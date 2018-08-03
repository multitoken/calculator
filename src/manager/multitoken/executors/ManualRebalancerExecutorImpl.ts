import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import Pair from '../../../repository/models/Pair';
import { Token } from '../../../repository/models/Token';
import { TokenWeight } from '../../../repository/models/TokenWeight';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractRebalanceExecutor } from './AbstractRebalanceExecutor';
import { ManualRebalancerExecutor } from './ManualRebalancerExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class ManualRebalancerExecutorImpl extends AbstractRebalanceExecutor implements ManualRebalancerExecutor {

  private tokensWeightTimeLine: Map<number, Pair<Token, Token>>;

  constructor(multitoken: Multitoken, priority: number) {
    super(multitoken, priority);

    this.tokensWeightTimeLine = new Map();
  }

  public setExchangeWeights(tokenWeights: TokenWeight[]): void {
    this.tokensWeightTimeLine.clear();

    tokenWeights.forEach((weights) => {
      this.tokensWeightTimeLine.set(weights.index, weights.tokens);
    });
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | undefined {
    super.execute(timeLineIndex, historyPriceInTime, timestamp, btcAmount, txPrice);

    const proportions: Pair<Token, Token> | undefined = this.tokensWeightTimeLine.get(timeLineIndex);

    if (!proportions) {
      return undefined;
    }

    const weights: Map<string, number> = this.multitoken.getWeights();
    const amounts: Map<string, number> = this.multitoken.getAmounts();

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

    proportions.toArray()
      .forEach(token => weights.set(token.name, token.weight));

    weights.forEach((value, key) => maxProportions += value);

    historyPriceInTime.forEach((value, key) => {
      const weight: number = weights.get(key) || 0;

      const amountPerCurrency = weight / maxProportions * amount;

      const count: number = amountPerCurrency / value;

      console.log(
        'recalc weights, name/weight/amount/count/price(per one)/', key, weight, amountPerCurrency,
        count,
        value,
        count * value
      );

      amounts.set(key, count);
    });

    this.multitoken.setup(amounts, weights);

    return undefined;
  }

  public getType(): ExecutorType {
    return ExecutorType.MANUAL_REBALANCER;
  }

}
