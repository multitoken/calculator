import { CryptocurrencyRepository } from './CryptocurrencyRepository';
import { TokenPriceHistory } from '../models/TokenPriceHistory';
import axios from 'axios';

const ethbtc = require('./ethbtc.json');
const eosbtc = require('./eosbtc.json');
const trxbtc = require('./trxbtc.json');
const venbtc = require('./venbtc.json');
const bnbbtc = require('./bnbbtc.json');
const omgbtc = require('./omgbtc.json');
const icxbtc = require('./icxbtc.json');
const zilbtc = require('./zilbtc.json');
const aebtc = require('./aebtc.json');
const zrxbtc = require('./zrxbtc.json');

export class CryptocurrencyRepositoryImpl implements CryptocurrencyRepository {

    private readonly AVAILABLE_TOKENS: Map<string, string> = new Map([
        ['Eth', 'ETH'], ['EOS', 'EOS'], ['Tron', 'TRX'], ['VeChain', 'VEN'], ['Binance', 'BNB'],
        ['OmiseGO', 'OMG'], ['Icon', 'ICX'], ['Zilliqa', 'ZIL'], ['Aeternity', 'AE'], ['0x', 'ZRX']
    ]);

    private readonly BTC_VALUES: Map<string, any> = new Map([
        ['ETH', ethbtc], ['EOS', eosbtc], ['TRX', trxbtc], ['VEN', venbtc], ['BNB', bnbbtc],
        ['OMG', omgbtc], ['ICX', icxbtc], ['ZIL', zilbtc], ['AE', aebtc], ['ZRX', zrxbtc],
    ]);

    private readonly HISTORY_BY_HOUR_API_PATH: string =
        '/data/histohour?fsym={token}&tsym={convertToSymbol}&limit={limit}';

    private host: string;

    constructor(host: string) {
        this.host = host;
    }

    async getAvailableTokens(): Promise<Map<string, string>> {
        return this.AVAILABLE_TOKENS;
    }

    public async getPriceHistoryByHour(tokenName: string,
                                       convertToSymbol: string,
                                       hours: number): Promise<Array<TokenPriceHistory>> {
        const result: Array<TokenPriceHistory> = [];

        if (this.BTC_VALUES.has(tokenName)) {
            const data =  this.BTC_VALUES.get(tokenName) || [];

            for (let item of data) {
                result.push(Object.assign(new TokenPriceHistory(), item));
            }

        } else {
            const response: any = await axios.get(this.host + this.HISTORY_BY_HOUR_API_PATH
                .replace('{token}', tokenName)
                .replace('{convertToSymbol}', convertToSymbol)
                .replace('{limit}', hours.toString()));

            for (let item of response.data.Data) {
                result.push(Object.assign(new TokenPriceHistory(), item));
            }
        }

        return result;
    }

}
