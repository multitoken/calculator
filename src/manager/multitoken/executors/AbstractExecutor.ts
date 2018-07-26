import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';
import { Multitoken } from '../multitoken/Multitoken';
import { ExecutorType, TimeLineExecutor } from './TimeLineExecutor';

export abstract class AbstractExecutor implements TimeLineExecutor {

  protected multitokens: Multitoken[];
  protected priority: number;

  constructor(multitokens: Multitoken[], priority: number) {
    this.multitokens = multitokens;
    this.priority = priority;
  }

  public abstract prepareCalculation(btcHistoryPrice: TokenPriceHistory[],
                                     timeLineStep: number,
                                     amount: number,
                                     startIndex: number,
                                     endIndex: number): void;

  public abstract execute(timeLineIndex: number,
                          historyPriceInTime: Map<string, number>,
                          timestamp: number,
                          btcAmount: number,
                          txPrice: number): ExecuteResult | undefined;

  public abstract getType(): ExecutorType;

  public getPriority(): number {
    return this.priority;
  }

}
