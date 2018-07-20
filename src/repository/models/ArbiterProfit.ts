export class ArbiterProfit {

  private static readonly emptyProfit: ArbiterProfit = new ArbiterProfit(0, '', 0, '', 0, 0, 0);

  public percent: number;
  public expensiveTokenName: string;
  public expensiveTokensCount: number;
  public cheapTokenName: string;
  public cheapTokensCount: number;
  public profit: number;
  public commission: number;

  public static empty(): ArbiterProfit {
    return ArbiterProfit.emptyProfit;
  }

  constructor(percent: number,
              expensiveTokenName: string,
              expensiveTokensCount: number,
              cheapTokenName: string,
              cheapTokensCount: number,
              profit: number,
              commission: number) {
    this.percent = percent;
    this.expensiveTokenName = expensiveTokenName;
    this.expensiveTokensCount = expensiveTokensCount;
    this.cheapTokenName = cheapTokenName;
    this.cheapTokensCount = cheapTokensCount;
    this.profit = profit;
    this.commission = commission;
  }

  public isEmpty(): boolean {
    return this.expensiveTokenName === '' || this.cheapTokenName === ''
      || this.expensiveTokensCount <= 0 || this.cheapTokensCount <= 0;
  }

}
