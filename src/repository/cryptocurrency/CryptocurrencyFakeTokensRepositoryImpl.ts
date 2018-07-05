import axios from 'axios';
import { TokenPriceHistory } from '../models/TokenPriceHistory';
import { CryptocurrencyRepository } from './CryptocurrencyRepository';

export class CryptocurrencyFakeTokensRepositoryImpl implements CryptocurrencyRepository {

  private readonly AVAILABLE_TOKENS: Map<string, string> = new Map([
    ['Bitcoin', 'BTC'], ['Eth', 'ETH'], ['EOS', 'EOS'], ['Tron', 'TRX'], ['VeChain', 'VEN'],
    ['Binance', 'BNB'], ['OmiseGO', 'OMG'], ['Icon', 'ICX'], ['Zilliqa', 'ZIL'], ['Aeternity', 'AE'], ['0x', 'ZRX']
  ]);

  private readonly BTC_VALUES: Map<string, any> = new Map([
    ['Bitcoin', 'btc'], ['Eth', 'eth'], ['EOS', 'eos'], ['Tron', 'trx'], ['VeChain', 'ven'],
    ['Binance', 'bnb'], ['OmiseGO', 'omg'], ['Icon', 'icx'], ['Zilliqa', 'zil'],
    ['Aeternity', 'ae'], ['0x', 'zrx'],
  ]);

  private readonly HISTORY_FAKE_API_PATH: string = './data/fake/{file}.json';

  private host: string;

  constructor(host: string) {
    this.host = host;
  }

  public async getAvailableCurrencies(): Promise<Map<string, string>> {
    return this.AVAILABLE_TOKENS;
  }

  public async getHistoryPrice(name: string,
                               convertTo: string,
                               hours: number): Promise<TokenPriceHistory[]> {
    return await this.getPrices(name);
  }

  public async getMinDate(names: string[]): Promise<number> {
    let result: number = 0;

    let timestamp: number;
    for (const name of names) {
      timestamp = (await this.getHistoryPrice(name, '', 0))[0].time;
      if (timestamp > result) {
        result = timestamp;
      }
    }
    return result;
  }

  public getStepSec(): number {
    return 5;
  }

  private async getPrices(name: string): Promise<TokenPriceHistory[]> {
    const result: TokenPriceHistory[] = [];

    try {
      const response = await axios.get(this.host + this.HISTORY_FAKE_API_PATH
        .replace('{file}', this.BTC_VALUES.get(name) || '')
      );

      const data: number[] = response.data;

      for (let i = 0; i < data.length; i += 2) {
        result.push(Object.assign(new TokenPriceHistory(data[i], data[i + 1])));
      }

    } catch (e) {
      console.log(e);
    }

    return result;
  }

}
