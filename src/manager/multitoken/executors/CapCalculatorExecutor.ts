import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { RebalanceValues } from '../../../repository/models/RebalanceValues';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { AbstractExecutor } from './AbstractExecutor';
import { ExecutorType } from './TimeLineExecutor';

export class CapCalculatorExecutor extends AbstractExecutor {

  private cache: Map<number, RebalanceValues>;
  private btcHistoryPrice: TokenPriceHistory[];

  constructor(multitokens: Multitoken[], priority: number) {
    super(multitokens, priority);

    this.cache = new Map();
    this.btcHistoryPrice = [];
  }

  public prepareCalculation(btcHistoryPrice: TokenPriceHistory[],
                            timeLineStep: number,
                            amount: number,
                            startIndex: number,
                            endIndex: number): void {
    this.btcHistoryPrice = btcHistoryPrice;
    this.cache.clear();
  }

  public execute(timeLineIndex: number,
                 historyPriceInTime: Map<string, number>,
                 timestamp: number,
                 btcAmount: number,
                 txPrice: number): ExecuteResult | any {
    if (this.cache.has(timeLineIndex)) {
      return this.cache.get(timeLineIndex);
    }

    const bitcoinCap: number = btcAmount * this.btcHistoryPrice[timeLineIndex].value;
    const totalCap: Map<string, number> = new Map();
    const tokensCap: Map<string, Map<string, number>> = new Map();

    let historyPrice: number = 0;

    this.multitokens.forEach(multitoken => {
      let cap: number = 0;
      const caps: Map<string, number> = new Map();

      multitoken.getAmounts()
        .forEach((value, key) => {
          historyPrice = value * (historyPriceInTime.get(key) || 0);
          cap += historyPrice;
          caps.set(key, historyPrice);
        });

      totalCap.set(multitoken.getName(), cap);
      tokensCap.set(multitoken.getName(), caps);
    });

    const result: RebalanceValues = new RebalanceValues(
      totalCap,
      tokensCap,
      bitcoinCap,
      timestamp
    );

    this.cache.set(timeLineIndex, result);

    return result;
  }

  public getType(): ExecutorType {
    return ExecutorType.CAP_CLAMP;
  }

}
