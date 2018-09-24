import axios from 'axios';
import { Portfolio } from '../models/Portfolio';
import { PortfolioOptions } from '../models/PortfolioOptions';
import { PortfolioRepository } from './PortfolioRepository';

export class PortfolioRepositoryImpl implements PortfolioRepository {

  private readonly PORTFOLIO_API: string = '/portfolio/{email}';

  private host: string;

  public constructor(host: string) {
    this.host = host;
  }

  public async getByEmail(email: string): Promise<Portfolio[]> {
    const url: string = this.host + this.PORTFOLIO_API.replace('{email}', email.toLowerCase());
    const data: any[] = (await axios.get(url)).data;

    return data.map((value: any) => Object.assign(new Portfolio(), value));
  }

  public async getByEmailAndId(email: string, id: number): Promise<Portfolio> {
    const url: string = this.host + this.PORTFOLIO_API
        .replace('{email}', email.toLowerCase()) +
      `?id=${id}`;

    const portfolio = Object.assign(new Portfolio(), (await axios.get(url)).data);

    portfolio.options = PortfolioOptions.fromJson(JSON.stringify(portfolio.options));
    
    return portfolio;
  }

  public async save(model: Portfolio): Promise<void> {
    const result: Portfolio = Object.assign(new Portfolio(), model);

    result.email = result.email.toLowerCase();
    delete result.executors;

    const url: string = this.host + this.PORTFOLIO_API.replace('{email}', result.email);

    await axios.put(
      url,
      JSON.stringify(result),
      {headers: {'content-type': 'application/json'}}
    );
  }

}
