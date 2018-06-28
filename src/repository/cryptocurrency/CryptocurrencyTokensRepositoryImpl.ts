import axios from 'axios';
import { TokenPriceHistory } from '../models/TokenPriceHistory';
import { CryptocurrencyRepository } from './CryptocurrencyRepository';

export class CryptocurrencyTokensRepositoryImpl implements CryptocurrencyRepository {

  private readonly AVAILABLE_TOKENS: Map<string, string> = new Map([
    ['USD', 'USDT'], ['Bitcoin', 'BTC'], ['Eth', 'ETH'], ['EOS', 'EOS'], ['Tron', 'TRX'], ['VeChain', 'VEN'],
    ['Binance', 'BNB'], ['OmiseGO', 'OMG'], ['Icon', 'ICX'], ['Zilliqa', 'ZIL'], ['Aeternity', 'AE'], ['0x', 'ZRX']
  ]);

  private readonly BTC_VALUES: Map<string, any> = new Map([
    ['Bitcoin', 'btcusd'], ['USD', 'usdbtc'], ['Eth', 'ethbtc'], ['EOS', 'eosbtc'], ['Tron', 'trxbtc'],
    ['VeChain', 'venbtc'], ['Binance', 'bnbbtc'], ['OmiseGO', 'omgbtc'], ['Icon', 'icxbtc'], ['Zilliqa', 'zilbtc'],
    ['Aeternity', 'aebtc'], ['0x', 'zrxbtc'],
  ]);

  private readonly HISTORY_BY_HOUR_API_PATH: string = './data/{file}.json';

  private host: string;
  private btcUsdPrice: TokenPriceHistory[];

  constructor(host: string) {
    this.host = host;
    this.btcUsdPrice = [];
  }

  public async getAvailableCurrencies(): Promise<Map<string, string>> {
    return this.AVAILABLE_TOKENS;
  }

  public async getHistoryPrice(name: string,
                               convertTo: string,
                               hours: number): Promise<TokenPriceHistory[]> {
    if (this.btcUsdPrice.length === 0) {
      this.btcUsdPrice = await this.getPrices('Bitcoin');
    }

    return await this.getPrices(name, name === 'Bitcoin' ? [] : this.btcUsdPrice);
  }

  public async getMinDate(names: string[]): Promise<number> {
    let result: number = 0;

    let timestamp: number;
    for (const name of names) {
      timestamp = (await this.getHistoryPrice(name, 'usd', 0))[0].time;
      if (timestamp > result) {
        result = timestamp;
      }
    }
    return result;
  }

  private async getPrices(name: string, increaseHistory?: TokenPriceHistory[]): Promise<TokenPriceHistory[]> {
    const result: TokenPriceHistory[] = [];

    try {
      const response = await axios.get(this.host + this.HISTORY_BY_HOUR_API_PATH
        .replace('{file}', this.BTC_VALUES.get(name) || '')
      );

      const data: number[] = response.data;
      let increase: number = 0;

      console.log('increaseHistory', increaseHistory ? increaseHistory.length : -1, data.length / 2);

      for (let i = 0; i < data.length; i += 2) {
        increase = (increaseHistory !== undefined && i / 2 < increaseHistory.length)
          ? increaseHistory[i / 2].value
          : 1;

        result.push(Object.assign(new TokenPriceHistory(data[i], data[i + 1] * increase)));
      }

    } catch (e) {
      console.log(e);
    }

    return result;
  }

}
