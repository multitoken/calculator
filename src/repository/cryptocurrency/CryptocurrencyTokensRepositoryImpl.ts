import axios from 'axios';
import { TokenPriceHistory } from '../models/TokenPriceHistory';
import { CryptocurrencyRepository } from './CryptocurrencyRepository';

export class CryptocurrencyTokensRepositoryImpl implements CryptocurrencyRepository {

  private readonly AVAILABLE_TOKENS: Map<string, string> = new Map([
    ['USDT', 'USDT'], ['Bitcoin', 'BTC'], ['Eth', 'ETH'], ['EOS', 'EOS'], ['Tron', 'TRX'], ['VeChain', 'VEN'],
    ['Binance', 'BNB'], ['OmiseGO', 'OMG'], ['Icon', 'ICX'], ['Zilliqa', 'ZIL'], ['Aeternity', 'AE'], ['0x', 'ZRX'],
    ['Populous', 'PPT'], ['Ardor', 'ARDR'], ['Hshare', 'HSR'], ['IOST', 'IOST'], ['Monero', 'XMR'], ['Dash', 'DASH'],
    ['Eth Classic', 'ETC'], ['NEM', 'XEM'], ['Zcash', 'ZEC'], ['Qtum', 'QTUM'], ['Bytecoin', 'BCN'], ['Lisk', 'LSK'],
    ['BitShares', 'BTS'], ['Ontology', 'ONT'], ['BTC Gold', 'BTG'], ['Siacoin', 'SC'], ['Steem', 'STEEM'],
    ['Verge', 'XVG'], ['Nano', 'NANO'], ['BAT', 'BAT'], ['Augur', 'REP'], ['BTC Diamond', 'BCD'], ['Golem', 'GNT'],
    ['Pundi X', 'NPXS'], ['Stratis', 'STRAT'], ['Waves', 'WAVES'], ['Waltonchain', 'WTC'], ['Status', 'SNT'],
    ['Wanchain', 'WAN'], ['Stellar', 'XLM'], ['NEO', 'NEO'], ['Litecoin', 'lTC'], ['Cardano', 'ADA']
  ]);

  private readonly BTC_VALUES: Map<string, any> = new Map([
    ['USDT', 'usdbtc'], ['Bitcoin', 'btcusd'], ['Eth', 'ethbtc'], ['EOS', 'eosbtc'], ['Tron', 'trxbtc'],
    ['VeChain', 'venbtc'], ['Binance', 'bnbbtc'], ['OmiseGO', 'omgbtc'], ['Icon', 'icxbtc'], ['Zilliqa', 'zilbtc'],
    ['Aeternity', 'aebtc'], ['0x', 'zrxbtc'], ['Populous', 'pptbtc'], ['Ardor', 'ardrbtc'], ['Hshare', 'hsrbtc'],
    ['IOST', 'iostbtc'], ['Monero', 'xmrbtc'], ['Dash', 'dashbtc'], ['Eth Classic', 'etcbtc'], ['NEM', 'xembtc'],
    ['Zcash', 'zecbtc'], ['Qtum', 'qtumbtc'], ['Bytecoin', 'bcnbtc'], ['Lisk', 'lskbtc'], ['BitShares', 'btsbtc'],
    ['Ontology', 'ontbtc'], ['BTC Gold', 'btgbtc'], ['Siacoin', 'scbtc'], ['Steem', 'steembtc'], ['Verge', 'xvgbtc'],
    ['Nano', 'nanobtc'], ['BAT', 'batbtc'], ['Augur', 'repbtc'], ['BTC Diamond', 'bcdbtc'], ['Golem', 'gntbtc'],
    ['Pundi X', 'npxsbtc'], ['Stratis', 'stratbtc'], ['Waves', 'wavesbtc'], ['Waltonchain', 'wtcbtc'],
    ['Status', 'sntbtc'], ['Wanchain', 'wanbtc'], ['Stellar', 'xlmbtc'], ['NEO', 'neobtc'], ['Litecoin', 'ltcbtc'],
    ['Cardano', 'adabtc']
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

  public getStepSec(): number {
    return 5; // hack! real is 60 sec
  }

  private async getPrices(name: string, increaseHistory?: TokenPriceHistory[]): Promise<TokenPriceHistory[]> {
    const result: TokenPriceHistory[] = [];

    try {
      const response = await axios.get(this.host + this.HISTORY_BY_HOUR_API_PATH
        .replace('{file}', this.BTC_VALUES.get(name) || '')
      );

      const data: number[] = response.data;
      let increase: number = 0;

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
