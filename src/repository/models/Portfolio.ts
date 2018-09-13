import { PortfolioOptions } from './PortfolioOptions';

export class Portfolio {

  public id: number;
  public email: string;
  public options: PortfolioOptions;
  public type: string;
  public amount: number;
  public capWith: number;
  public capWithout: number;
  public capBtc: number;
  public createdAt: string;

  constructor(email: string = '',
              options: PortfolioOptions = new PortfolioOptions(),
              type: string = 'unknown',
              amount: number = 0,
              capWith: number = 0,
              capWithout: number = 0,
              capBtc: number = 0,
              createdAt: string = new Date().toISOString()) {
    this.id = -1;
    this.email = email;
    this.options = options;
    this.type = type;
    this.amount = amount;
    this.capWith = capWith;
    this.capWithout = capWithout;
    this.capBtc = capBtc;
    this.createdAt = createdAt;
  }

}
