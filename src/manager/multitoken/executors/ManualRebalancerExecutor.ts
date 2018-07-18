import { TokenWeight } from '../../../repository/models/TokenWeight';
import { TimeLineExecutor } from './TimeLineExecutor';

export interface ManualRebalancerExecutor extends TimeLineExecutor {

  setExchangeWeights(tokenWeights: TokenWeight[]): void;

}
