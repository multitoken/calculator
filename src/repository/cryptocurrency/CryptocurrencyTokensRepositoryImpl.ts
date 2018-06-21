import axios from 'axios';
import { TokenPriceHistory } from '../models/TokenPriceHistory';
import { CryptocurrencyRepository } from './CryptocurrencyRepository';

export class CryptocurrencyTokensRepositoryImpl implements CryptocurrencyRepository {

  private readonly AVAILABLE_TOKENS: Map<string, string> = new Map([
    ['Eth', 'ETH'], ['EOS', 'EOS'], ['Tron', 'TRX'], ['VeChain', 'VEN'], ['Binance', 'BNB'],
    ['OmiseGO', 'OMG'], ['Icon', 'ICX'], ['Zilliqa', 'ZIL'], ['Aeternity', 'AE'], ['0x', 'ZRX']
  ]);

  private readonly BTC_VALUES: Map<string, any> = new Map([
    ['Eth', 'ethbtc'], ['EOS', 'eosbtc'], ['Tron', 'trxbtc'], ['VeChain', 'venbtc'], ['Binance', 'bnbbtc'],
    ['OmiseGO', 'omgbtc'], ['Icon', 'icxbtc'], ['Zilliqa', 'zilbtc'], ['Aeternity', 'aebtc'], ['0x', 'zrxbtc'],
  ]);

  private readonly HISTORY_BY_HOUR_API_PATH: string = './data/{file}.json';

  private host: string;
  private btcToUsdPrice: number;

  constructor(host: string, btcToUsdPrice: number) {
    this.host = host;
    this.btcToUsdPrice = btcToUsdPrice;
  }

  public async getAvailableCurrencies(): Promise<Map<string, string>> {
    return this.AVAILABLE_TOKENS;
  }

  public async getHistoryPrice(name: string,
                               convertTo: string,
                               hours: number): Promise<TokenPriceHistory[]> {
    const result: TokenPriceHistory[] = [];

    const response = await axios.get(this.host + this.HISTORY_BY_HOUR_API_PATH
      .replace('{file}', this.BTC_VALUES.get(name) || '')
    );

    const data: number[] = response.data;

    for (let i = 0; i < data.length; i += 2) {
      result.push(Object.assign(new TokenPriceHistory(data[i], data[i + 1] * this.btcToUsdPrice)));
    }

    return result;
  }

  public async getMinDate(names: string[]): Promise<number> {
    let result: number = 0;

    let timestamp: number;
    for (const name of names) {
      timestamp = (await this.getHistoryPrice(name, 'usd', 0))[0].time;
      console.log(timestamp, result);
      if (timestamp > result) {
        result = timestamp;
      }
    }
    return result;
  }

}
