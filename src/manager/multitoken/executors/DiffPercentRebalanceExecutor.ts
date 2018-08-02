import { TimeLineExecutor } from './TimeLineExecutor';

export interface DiffPercentRebalanceExecutor extends TimeLineExecutor {

  setupDiffPercent(percent: number): void;

}
