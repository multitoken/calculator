import { Token } from '../repository/models/Token';
import { TokensHelper } from '../utils/TokensHelper';

export class CoinItemEntity extends Token {

  public symbol: string;
  public price: number;
  public proportionPercents: number;
  public count: number;
  public priceDiffPercents: number;

  public constructor(name: string,
                     weight: number,
                     symbol: string,
                     price: number,
                     proportionPercents: number,
                     count: number,
                     priceDiffPercents: number) {
    super(name, weight);

    this.symbol = symbol;
    this.price = price;
    this.proportionPercents = proportionPercents;
    this.count = count;
    this.priceDiffPercents = priceDiffPercents;
  }

  public getIcon(): any {
    return TokensHelper.getIcon(this.name);
  }

}
