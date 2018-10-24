import { ExecuteResult } from './ExecuteResult';

export class RebalanceValues implements ExecuteResult {

  public multitokenCap: Map<string, number>;
  public multitokenTokensCap: Map<string, Map<string, number>>;
  public multitokenTokensCount: Map<string, Map<string, number>>;
  public bitcoinCap: number;
  public timestamp: number;

  constructor(multitokenCap: Map<string, number>,
              multitokenTokensCap: Map<string, Map<string, number>>,
              multitokenTokensCount: Map<string, Map<string, number>>,
              bitcoinCap: number,
              timestamp: number) {
    this.multitokenCap = multitokenCap;
    this.multitokenTokensCap = multitokenTokensCap;
    this.multitokenTokensCount = multitokenTokensCount;
    this.bitcoinCap = bitcoinCap;
    this.timestamp = timestamp;
  }

}
