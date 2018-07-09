import { Arbitration } from './Arbitration';
import { RebalanceValues } from './RebalanceValues';

export class RebalanceHistory {

  public rebalanceValues: RebalanceValues[];
  public arbitrage: Arbitration[];

  constructor(rebalanceValues: RebalanceValues[], arbitrage: Arbitration[]) {
    this.rebalanceValues = rebalanceValues;
    this.arbitrage = arbitrage;
  }

}
