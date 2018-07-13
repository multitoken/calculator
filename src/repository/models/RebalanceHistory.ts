import { Arbitration } from './Arbitration';
import { Exchange } from './Exchange';
import { RebalanceValues } from './RebalanceValues';

export class RebalanceHistory {

  public rebalanceValues: RebalanceValues[];
  public arbitrage: Arbitration[];
  public exchange: Exchange[];

  constructor(rebalanceValues: RebalanceValues[], arbitrage: Arbitration[], exchange: Exchange[]) {
    this.rebalanceValues = rebalanceValues;
    this.arbitrage = arbitrage;
    this.exchange = exchange;
  }

}
