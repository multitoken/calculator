import axios from 'axios';
import { TokenPriceHistory } from '../models/TokenPriceHistory';
import { CryptocurrencyRepository } from './CryptocurrencyRepository';

export class CryptocurrencyCoinsRepositoryImpl implements CryptocurrencyRepository {

  private readonly POINT_STEP_SEC: number = 15;
  private readonly COINS_API_PATH: string = '/api/coins?detail=false&short=true';
  private readonly HISTORY_BY_HOUR_API_PATH: string =
    `/api/coins/{coin}/hist?convert={convert}&start={start}&interval=${this.POINT_STEP_SEC}s&readable=0`;

  private host: string;

  constructor(host: string) {
    this.host = host;
  }

  public async getAvailableCurrencies(): Promise<Map<string, string>> {
    const response: any = await axios.get(this.host + this.COINS_API_PATH);
    const result: Map<string, string> = new Map();

    for (const item of response.data.data) {
      result.set(item.name, item.short);
    }

    return result;
  }

  public async getHistoryPrice(name: string,
                               convertTo: string,
                               hours: number): Promise<TokenPriceHistory[]> {
    const result: TokenPriceHistory[] = [];
    const currentDate: number = Math.round(new Date().getTime() / 1000);
    const response = await axios.get(this.host + this.HISTORY_BY_HOUR_API_PATH
      .replace('{coin}', name)
      .replace('{convert}', convertTo)
      .replace('{start}', (currentDate - 1).toString())
      .replace('{end}', (currentDate - 5).toString())
    );

    const data: any[] = response.data.data[0].values;

    for (const item of data) {
      result.push(new TokenPriceHistory(item.timestamp, item.price.value));
    }

    return result;
  }

  public async getMinDate(names: string[]): Promise<number> {
    let timestamp: number;
    let result: number = 0;
    const currentDate: number = Math.round(new Date().getTime() / 1000);

    console.log(currentDate, currentDate - 3600, (currentDate - 3600).toString());
    for (const name of names) {
      const response = await axios.get(this.host + this.HISTORY_BY_HOUR_API_PATH
        .replace('{coin}', name)
        .replace('{convert}', 'usd')
        .replace('{start}', (currentDate - 3600).toString())
      );
      timestamp = response.data.data[0].minDate;

      if (timestamp > result) {
        result = timestamp;
      }
    }

    return result;
  }

}
