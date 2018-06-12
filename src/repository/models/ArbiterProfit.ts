export class ArbiterProfit {

    private static readonly emptyProfit: ArbiterProfit = new ArbiterProfit(0, '', 0, '', 0, 0);

    percent: number;
    expensiveTokenName: string;
    expensiveTokensCount: number;
    cheapTokenName: string;
    cheapTokensCount: number;
    profit: number;

    public static empty(): ArbiterProfit {
        return ArbiterProfit.emptyProfit;
    }

    constructor(percent: number,
                expensiveTokenName: string,
                expensiveTokensCount: number,
                cheapTokenName: string,
                cheapTokensCount: number,
                profit: number) {
        this.percent = percent;
        this.expensiveTokenName = expensiveTokenName;
        this.expensiveTokensCount = expensiveTokensCount;
        this.cheapTokenName = cheapTokenName;
        this.cheapTokensCount = cheapTokensCount;
        this.profit = profit;
    }

}
