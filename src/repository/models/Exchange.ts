import { ExecuteResult } from './ExecuteResult';

export class Exchange implements ExecuteResult {

  public from: string;
  public to: string;
  public fromNumber: number;
  public toNumber: number;
  public commission: number;
  public balanceUsed: number;

  constructor(from: string, to: string, fromNumber: number, toNumber: number, commission: number, balanceUsed: number) {
    this.from = from;
    this.to = to;
    this.fromNumber = fromNumber;
    this.toNumber = toNumber;
    this.commission = commission;
    this.balanceUsed = balanceUsed;
  }

}
