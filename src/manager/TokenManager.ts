import { TokenPriceHistory } from '../repository/models/TokenPriceHistory';
import { Arbitration } from '../repository/models/Arbitration';

export interface TokenManager {

    setupTokens(tokenSymbols: Array<string>): Promise<Map<string, Array<TokenPriceHistory>>>;

    changeProportions(proportions: Map<string, number>): void;

    changeCalculationDate(indexStart: number, indexEnd: number): void;

    getMaxCalculationIndex(): number;

    getPriceHistory(): Map<string, Array<TokenPriceHistory>>;

    getAvailableTokens(): Promise<Map<string, string>>;

    calculateInitialAmounts(amount: number): Promise<Map<string, number>>;

    calculateArbitration(): Promise<Array<Arbitration>>;

    calculateCap(): Promise<number>;

}
