import { Token } from './Token';

export class TokenProportion extends Token {

  public min: number;
  public max: number;

  constructor(name: string = '', weight: number = 0, min: number = 0, max: number = 0) {
    super(name, weight);

    this.min = min;
    this.max = max;
  }

}
