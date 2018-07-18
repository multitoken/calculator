import { ExecuteResult } from '../../../repository/models/ExecuteResult';
import { TokenPriceHistory } from '../../../repository/models/TokenPriceHistory';

export enum ExecutorType {
  ARBITRAGEUR = 'arbitrageur',
  EXCHANGER = 'exchanger',
  MANUAL_REBALANCER = 'manualrebalancer',
  CAP_CLAMP = 'capclamp'
}

export interface TimeLineExecutor {

  prepareCalculation(btcHistoryPrice: TokenPriceHistory[], amount: number, startTime: number, endTime: number): void;

  execute(timeLineIndex: number,
          historyPriceInTime: Map<string, number>,
          timestamp: number,
          btcAmount: number,
          txPrice: number): ExecuteResult | undefined;

  getType(): ExecutorType;

  getPriority(): number;

}
