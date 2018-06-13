import { CryptocurrencyRepository } from './CryptocurrencyRepository';
import { TokenPriceHistory } from '../models/TokenPriceHistory';
import axios from 'axios';

export class CryptocurrencyRepositoryImpl implements CryptocurrencyRepository {

    private readonly AVAILABLE_TOKENS: Map<string, string> = new Map([
        ['Eth', 'ETH'], ['EOS', 'EOS'], ['Tron', 'TRX'], ['VeChain', 'VEN'], ['Binance', 'BNB'],
        ['OmiseGO', 'OMG'], ['Icon', 'ICX'], ['Zilliqa', 'ZIL'], ['Aeternity', 'AE'], ['0x', 'ZRX']
    ]);

    private readonly BTC_VALUES: Map<string, any> = new Map([
        ['ETH', 'ethbtc'], ['EOS', 'eosbtc'], ['TRX', 'trxbtc'], ['VEN', 'venbtc'], ['BNB', 'bnbbtc'],
        ['OMG', 'omgbtc'], ['ICX', 'icxbtc'], ['ZIL', 'zilbtc'], ['AE', 'aebtc'], ['ZRX', 'zrxbtc'],
    ]);

    private readonly HISTORY_BY_HOUR_API_PATH: string = '/data/{file}.json';

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

        const response = await axios.get(this.host + this.HISTORY_BY_HOUR_API_PATH
            .replace('{file}', this.BTC_VALUES.get(tokenName) || '')
        );

        for (let item of response.data) {
            result.push(Object.assign(new TokenPriceHistory(), item));
        }

        return result;
    }

}
