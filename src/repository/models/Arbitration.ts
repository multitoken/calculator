export class Arbitration {

    txPrice: number;
    cheapName: string;
    cheapCount: number;
    expensiveName: string;
    expensiveCount: number;
    bestPercent: number;
    arbiterProfit: number;
    arbiterCap: number;
    originCap: number;
    arbiterTokensCap: Map<string, number>;
    originTokensCap: Map<string, number>;
    timestamp: number;
    
    constructor(txPrice: number,
                cheapName: string,
                cheapCount: number,
                expensiveName: string,
                expensiveCount: number,
                bestPercent: number,
                arbiterProfit: number,
                arbiterCap: number,
                originCap: number,
                arbiterTokensCap: Map<string, number>,
                originTokensCap: Map<string, number>,
                timestamp: number) {
        this.txPrice = txPrice;
        this.cheapName = cheapName;
        this.cheapCount = cheapCount;
        this.expensiveName = expensiveName;
        this.expensiveCount = expensiveCount;
        this.bestPercent = bestPercent;
        this.arbiterProfit = arbiterProfit;
        this.arbiterCap = arbiterCap;
        this.originCap = originCap;
        this.arbiterTokensCap = arbiterTokensCap;
        this.originTokensCap = originTokensCap;
        this.timestamp = timestamp;
    }

}
