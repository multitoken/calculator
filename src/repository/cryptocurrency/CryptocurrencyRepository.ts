import { TokenPriceHistory } from '../models/TokenPriceHistory';

export interface CryptocurrencyRepository {

  getAvailableCurrencies(): Promise<Map<string, string>>;

  getHistoryPrice(name: string, convertTo: string, hours: number): Promise<TokenPriceHistory[]>;

  getMinDate(names: string[]): Promise<number>;

}
