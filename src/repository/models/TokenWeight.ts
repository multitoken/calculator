import Pair from './Pair';
import { Token } from './Token';

export class TokenWeight {

  public tokens: Pair<Token, Token>;
  public timestamp: number;
  public index: number;

  constructor(tokens: Pair<Token, Token>, timestamp: number, index: number) {
    this.tokens = tokens;
    this.timestamp = timestamp;
    this.index = index;
  }

}
