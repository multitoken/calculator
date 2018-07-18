import { ArbiterProfit } from '../../../repository/models/ArbiterProfit';
import { Arbitration } from '../../../repository/models/Arbitration';
import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractExecutor } from './AbstractExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class ArbitrageursExecutor extends AbstractExecutor {

  private multitoken: Multitoken;

  constructor(multitoken: Multitoken, priority: number) {
    super([multitoken], priority);

    this.multitoken = multitoken;
  }

  public prepareCalculation(btcHistoryPrice: TokenPriceHistory[],
                            amount: number,
                            startTime: number,
                            endTime: number): void {
    // not used
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | undefined {

    let profit: ArbiterProfit = ArbiterProfit.empty();

    const tokensAmount: Map<string, number> = this.multitoken.getAmounts();
    const tokensWeight: Map<string, number> = this.multitoken.getWeights();

    for (const [cheap, cheapPrice] of historyPriceInTime) {
      for (const [expensive, expensivePrice] of historyPriceInTime) {
        if (cheap === expensive) {
          continue;
        }

        const cheapBalance: number = tokensAmount.get(cheap) || 0;
        const cheapWeight: number = tokensWeight.get(cheap) || 0;

        const expensiveBalance: number = tokensAmount.get(expensive) || 0;
        const expensiveWeight: number = tokensWeight.get(expensive) || 0;

        const arbiterProfit: ArbiterProfit = this.calculateArbiterProfit(
          this.multitoken,
          cheap,
          cheapWeight,
          cheapBalance,
          cheapPrice,

          expensive,
          expensiveWeight,
          expensiveBalance,
          expensivePrice,
          txPrice
        );

        if (profit.profit < arbiterProfit.profit) {
          profit = arbiterProfit;
        }
      }
    }

    if (profit.profit > 0) {
      const arbitration: Arbitration = new Arbitration(
        txPrice,
        profit.commission,
        profit.cheapTokenName,
        profit.cheapTokensCount,
        profit.expensiveTokenName,
        profit.expensiveTokensCount,
        profit.percent,
        profit.profit,
        timestamp,
      );

      this.multitoken.exchange(
        profit.cheapTokenName,
        profit.expensiveTokenName,
        profit.cheapTokensCount,
        profit.expensiveTokensCount
      );

      return arbitration;
    }

    return undefined;
  }

  public getType(): ExecutorType {
    return ExecutorType.ARBITRAGEUR;
  }

  private calculateArbiterProfit(multitoken: Multitoken,
                                 cheapName: string,
                                 cheapWeight: number,
                                 cheapBalance: number,
                                 cheapPrice: number,
                                 expensiveName: string,
                                 expensiveWeight: number,
                                 expensiveBalance: number,
                                 expensivePrice: number,
                                 txPrice: number): ArbiterProfit {
    // x = sqrt(p_2 * s_1 * b_1 * b_2 / p_1 / s_2) - b_1

    const exchangeAmount: number = Math.sqrt(
      expensivePrice *
      cheapWeight *
      cheapBalance *
      expensiveBalance /
      (cheapPrice * expensiveWeight)
    ) - cheapBalance;

    const percent: number = exchangeAmount / cheapBalance;

    if (exchangeAmount > 0) {
      const result: [number, number] = multitoken.preCalculateExchange(cheapName, expensiveName, exchangeAmount);
      const exchanged: number = result[0];

      const profit: number = (exchanged * expensivePrice) - (txPrice + (exchangeAmount * cheapPrice));

      return new ArbiterProfit(percent, expensiveName, exchanged, cheapName, exchangeAmount, profit, result[1]);
    }

    return new ArbiterProfit(percent, '', 0, '', exchangeAmount, 0, 0);
  }

}
