import { TimeLineExecutor } from './TimeLineExecutor';

export interface ExchangerExecutor extends TimeLineExecutor {

  setExchangeAmount(value: number): void;

}
