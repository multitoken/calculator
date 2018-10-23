import { Arbitration } from './Arbitration';
import { Exchange } from './Exchange';
import { RebalanceValues } from './RebalanceValues';

export class RebalanceHistory {

  public static readonly MULTITOKEN_NAME_REBALANCE: string = 'MultiToken';
  public static readonly MULTITOKEN_NAME_HODL: string = 'Hodl';
  public static readonly BITCOIN_NAME: string = 'Bitcoin';

  public rebalanceValues: RebalanceValues[];
  public arbitrage: Arbitration[];
  public exchange: Exchange[];

  constructor(rebalanceValues: RebalanceValues[],
              arbitrage: Arbitration[],
              exchange: Exchange[]) {
    this.rebalanceValues = rebalanceValues;
    this.arbitrage = arbitrage;
    this.exchange = exchange;
  }

  public getCap(): number {
    return this.rebalanceValues.length === 0
      ? 0
      : this.rebalanceValues[this.rebalanceValues.length - 1]
      .multitokenCap
      .get(RebalanceHistory.MULTITOKEN_NAME_HODL) || 0;
  }

  public getRebalancedCap(): number {
    return this.rebalanceValues.length === 0
      ? 0
      : this.rebalanceValues[this.rebalanceValues.length - 1]
      .multitokenCap
      .get(RebalanceHistory.MULTITOKEN_NAME_REBALANCE) || 0;
  }

}
