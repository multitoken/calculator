export class Arbitration {

  public txPrice: number;
  public commission: number;
  public cheapName: string;
  public cheapCount: number;
  public expensiveName: string;
  public expensiveCount: number;
  public bestPercent: number;
  public arbiterProfit: number;
  public arbiterTokensCap: Map<string, number>;
  public originTokensCap: Map<string, number>;
  public timestamp: number;

  constructor(txPrice: number,
              commission: number,
              cheapName: string,
              cheapCount: number,
              expensiveName: string,
              expensiveCount: number,
              bestPercent: number,
              arbiterProfit: number,
              arbiterTokensCap: Map<string, number>,
              originTokensCap: Map<string, number>,
              timestamp: number) {
    this.txPrice = txPrice;
    this.commission = commission;
    this.cheapName = cheapName;
    this.cheapCount = cheapCount;
    this.expensiveName = expensiveName;
    this.expensiveCount = expensiveCount;
    this.bestPercent = bestPercent;
    this.arbiterProfit = arbiterProfit;
    this.arbiterTokensCap = arbiterTokensCap;
    this.originTokensCap = originTokensCap;
    this.timestamp = timestamp;
  }

}
