import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';

export enum ExecutorType {
  ARBITRAGEUR = 'ARBITRAGEUR',
  EXCHANGER = 'EXCHANGER',
  MANUAL_REBALANCER = 'MANUAL_REBALANCER',
  CAP_CLAMP = 'CAP_CLAMP',
  PERIOD_REBALANCER = 'PERIOD_REBALANCER',
}

export interface TimeLineExecutor {

  prepareCalculation(btcHistoryPrice: TokenPriceHistory[], timeLineStep: number, amount: number, startIndex: number,
                     endIndex: number): void;

  execute(timeLineIndex: number,
          historyPriceInTime: Map<string, number>,
          timestamp: number,
          btcAmount: number,
          txPrice: number): ExecuteResult | undefined;

  getType(): ExecutorType;

  getPriority(): number;

}
