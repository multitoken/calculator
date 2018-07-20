import { TokenPriceHistory } from '../models/TokenPriceHistory';

export interface CryptocurrencyRepository {

  getAvailableCurrencies(): Promise<Map<string, string>>;

  getHistoryPrice(name: string): Promise<TokenPriceHistory[]>;

  getHistoryPrices(names: string[]): Promise<Map<string, TokenPriceHistory[]>>;

  getStepSec(): number;

}
