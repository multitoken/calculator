export class RebalanceValues {

  public rebalanceCap: number;
  public originalCap: number;
  public bitcoinCap: number;
  public timestamp: number;

  constructor(rebalanceCap: number, originalCap: number, bitcoinCap: number, timestamp: number) {
    this.rebalanceCap = rebalanceCap;
    this.originalCap = originalCap;
    this.bitcoinCap = bitcoinCap;
    this.timestamp = timestamp;
  }

}
