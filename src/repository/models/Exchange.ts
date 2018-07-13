export class Exchange {

  public from: string;
  public to: string;
  public fromNumber: number;
  public toNumber: number;
  public commission: number;

  constructor(from: string, to: string, fromNumber: number, toNumber: number, commission: number) {
    this.from = from;
    this.to = to;
    this.fromNumber = fromNumber;
    this.toNumber = toNumber;
    this.commission = commission;
  }

}
