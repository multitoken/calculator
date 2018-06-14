import { TokenPriceHistory } from '../models/TokenPriceHistory';

export interface CryptocurrencyRepository {

    getAvailableTokens(): Promise<Map<string, string>>;

    getPriceHistoryByHour(tokenName: string, convertToSymbol: string, hours: number): Promise<TokenPriceHistory[]>;

}
