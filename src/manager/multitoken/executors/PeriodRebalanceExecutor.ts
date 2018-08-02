import { TimeLineExecutor } from './TimeLineExecutor';

export interface PeriodRebalanceExecutor extends TimeLineExecutor {

  setupPeriod(sec: number): void;

}
