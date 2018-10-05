import axios from 'axios';
import { TokenPriceHistory } from '../models/TokenPriceHistory';
import { CryptocurrencyRepository } from './CryptocurrencyRepository';

export class CryptocurrencyTokensRepositoryImpl implements CryptocurrencyRepository {

  private readonly AVAILABLE_TOKENS: Map<string, string> = new Map([
    ['USDT', 'USDT'], ['Bitcoin', 'BTC'], ['Eth', 'ETH'], ['EOS', 'EOS'], ['Tron', 'TRX'], ['VeChain', 'VEN'],
    ['Binance', 'BNB'], ['OmiseGO', 'OMG'], ['Icon', 'ICX'], ['Zilliqa', 'ZIL'], ['Aeternity', 'AE'], ['0x', 'ZRX'],
    ['Populous', 'PPT'], ['Hshare', 'HSR'], ['IOST', 'IOST'], ['Monero', 'XMR'], ['Dash', 'DASH'],
    ['Eth Classic', 'ETC'], ['NEM', 'XEM'], ['Zcash', 'ZEC'], ['Qtum', 'QTUM'], ['Bytecoin', 'BCN'], ['Lisk', 'LSK'],
    ['BitShares', 'BTS'], ['Ontology', 'ONT'], ['BTC Gold', 'BTG'], ['Steem', 'STEEM'],
    ['Verge', 'XVG'], ['Nano', 'NANO'], ['BAT', 'BAT'], ['BTC Diamond', 'BCD'],
    ['Stratis', 'STRAT'], ['Waves', 'WAVES'], ['Waltonchain', 'WTC'], ['Status', 'SNT'],
    ['Wanchain', 'WAN'], ['Stellar', 'XLM'], ['NEO', 'NEO'], ['Litecoin', 'lTC'], ['Cardano', 'ADA']
  ]);

  private readonly EXCLUDE_TOKENS: string[] = [
    'Hshare', 'VeChain', 'BTC Diamond', 'Populous', 'Stellar', 'Waves', 'Icon', 'IOST', 'Steem',
    'Nano', 'Aeternity', 'Zilliqa', 'Ontology', 'NEM', 'Wanchain', 'Bytecoin'
  ];

  private readonly USD_COIN_VALUES: Map<string, string> = new Map([
    ['USDT', 'usdusd'], ['Bitcoin', 'btcusd'], ['Eth', 'ethusd'], ['EOS', 'eosusd'], ['Tron', 'trxusd'],
    ['VeChain', 'venusd'], ['Binance', 'bnbusd'], ['OmiseGO', 'omgusd'], ['Icon', 'icxusd'], ['Zilliqa', 'zilusd'],
    ['Aeternity', 'aeusd'], ['0x', 'zrxusd'], ['Populous', 'pptusd'], ['Hshare', 'hsrusd'],
    ['IOST', 'iostusd'], ['Monero', 'xmrusd'], ['Dash', 'dashusd'], ['Eth Classic', 'etcusd'], ['NEM', 'xemusd'],
    ['Zcash', 'zecusd'], ['Qtum', 'qtumusd'], ['Bytecoin', 'bcnusd'], ['Lisk', 'lskusd'], ['BitShares', 'btsusd'],
    ['Ontology', 'ontusd'], ['BTC Gold', 'btgusd'], ['Steem', 'steemusd'], ['Verge', 'xvgusd'],
    ['Nano', 'nanousd'], ['BAT', 'batusd'], ['BTC Diamond', 'bcdusd'],
    ['Stratis', 'stratusd'], ['Waves', 'wavesusd'], ['Waltonchain', 'wtcusd'],
    ['Status', 'sntusd'], ['Wanchain', 'wanusd'], ['Stellar', 'xlmusd'], ['NEO', 'neousd'], ['Litecoin', 'ltcusd'],
    ['Cardano', 'adausd']
  ]);

  private readonly HISTORY_BY_HOUR_API_PATH: string = './data/{file}.json';

  private host: string;
  private cache: Map<string, TokenPriceHistory[]>;
  private interpolation: boolean;

  constructor(host: string, interpolation: boolean) {
    this.host = host;
    this.interpolation = interpolation;
    this.cache = new Map();

    this.EXCLUDE_TOKENS.forEach(name => this.AVAILABLE_TOKENS.delete(name));
  }

  public async getAvailableCurrencies(): Promise<Map<string, string>> {
    return this.AVAILABLE_TOKENS;
  }

  public async getHistoryPrice(name: string): Promise<TokenPriceHistory[]> {
    return await this.getPrices(name);
  }

  public async getHistoryPrices(names: string[]): Promise<Map<string, TokenPriceHistory[]>> {
    const selectedTokensHistory: Map<string, TokenPriceHistory[]> = new Map();
    let minDate: number = 0;
    let maxDate: number = 0;
    let maxLen: number = 0;

    for (const item of names) {
      try {
        const result: TokenPriceHistory[] = await this.getHistoryPrice(item);

        selectedTokensHistory.set(item, result);

        if (maxLen === 0 || maxLen > result.length) {
          minDate = result[0].time;
          maxDate = result[result.length - 1].time;
          maxLen = result.length;
        }
      } catch (e) {
        console.error(`error sync ${item}: ${e}`);
      }
    }

    selectedTokensHistory.forEach((value, key) => {
      let result = value.filter((history, index) => history.time >= minDate && history.time <= maxDate);

      if (this.interpolation) {
        result = this.interpolateValues(result);
      }

      selectedTokensHistory.set(key, result);
    });

    return selectedTokensHistory;
  }

  public getStepSec(): number {
    return this.interpolation ? 5 : 60;
  }

  private interpolateValues(history: TokenPriceHistory[]): TokenPriceHistory[] {
    const result: TokenPriceHistory[] = [];

    for (let i = 0; i < history.length - 1; i++) {
      const diffCount: number = Math.round((history[i + 1].time - history[i].time) / 5000);

      for (let j = 0; j < diffCount; j++) {
        const time: number = history[i].time + j * 5000;
        const value: number = this.linInterpolation(
          history[i].time,
          history[i].value,
          history[i + 1].time,
          history[i + 1].value,
          time
        );
        result.push(new TokenPriceHistory(time, value));
      }
    }

    return result;
  }

  private linInterpolation(x1: number, y1: number, x2: number, y2: number, targetX: number) {
    return y1 + (targetX - x1) * (y2 - y1) / (x2 - x1);
  }

  private async getPrices(name: string): Promise<TokenPriceHistory[]> {
    if (this.cache.has(name)) {
      return (this.cache.get(name) || []).slice();
    }

    const result: TokenPriceHistory[] = [];

    try {
      const response = await axios.get(this.host + this.HISTORY_BY_HOUR_API_PATH
        .replace('{file}', this.USD_COIN_VALUES.get(name) || '')
      );

      const data: number[] = response.data;
      for (let i = 0; i < data.length; i += 2) {
        result.push(Object.assign(new TokenPriceHistory(data[i], data[i + 1])));
      }

      this.cache.set(name, result);

    } catch (e) {
      console.log('name: ', name, e);
    }

    return result;
  }

}
