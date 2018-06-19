export class TokenWeight {

  public tokenName: string;
  public weight: number;
  public timestamp: number;
  public index: number;

  constructor(tokenName: string, weight: number, timestamp: number, index: number) {
    this.tokenName = tokenName;
    this.weight = weight;
    this.timestamp = timestamp;
    this.index = index;
  }

}
