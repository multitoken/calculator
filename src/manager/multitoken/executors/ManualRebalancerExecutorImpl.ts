import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import Pair from '../../../repository/models/Pair';
import { Token } from '../../../repository/models/Token';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { TokenWeight } from '../../../repository/models/TokenWeight';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractExecutor } from './AbstractExecutor';
import { ManualRebalancerExecutor } from './ManualRebalancerExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class ManualRebalancerExecutorImpl extends AbstractExecutor implements ManualRebalancerExecutor {

  private tokensWeightTimeLine: Map<number, Pair<Token, Token>>;
  private multitoken: Multitoken;

  constructor(multitoken: Multitoken, priority: number) {
    super([multitoken], priority);

    this.tokensWeightTimeLine = new Map();
    this.multitoken = multitoken;
  }

  public setExchangeWeights(tokenWeights: TokenWeight[]): void {
    this.tokensWeightTimeLine.clear();

    tokenWeights.forEach((weights) => {
      this.tokensWeightTimeLine.set(weights.index, weights.tokens);
    });
  }

  public prepareCalculation(btcHistoryPrice: TokenPriceHistory[],
                            timeLineStep: number,
                            amount: number,
                            startTime: number,
                            endTime: number): void {
    // not use
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | undefined {
    const proportions: Pair<Token, Token> | undefined = this.tokensWeightTimeLine.get(timeLineIndex);

    if (!proportions) {
      return undefined;
    }

    const weights: Map<string, number> = this.multitoken.getWeights();
    const amounts: Map<string, number> = this.multitoken.getAmounts();

    let amount: number = 0;
    let maxProportions: number = 0;

    amounts.forEach((value, key) =>
      amount += value * (historyPriceInTime.get(key) || 0)
    );

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
