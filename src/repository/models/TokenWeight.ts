import Pair from './Pair';
import { Token } from './Token';

export class TokenWeight {

  public tokens: Pair<Token, Token>;
  public otherTokens: Token[];
  public timestamp: number;
  public index: number;

  constructor(tokens: Pair<Token, Token>, otherTokens: Token[], timestamp: number, index: number) {
    this.tokens = tokens;
    this.otherTokens = otherTokens;
    this.timestamp = timestamp;
    this.index = index;
  }

  public equals(tokenWeight: TokenWeight | undefined): boolean {
    return tokenWeight !== undefined && tokenWeight === this ||
      tokenWeight !== undefined &&
      tokenWeight.timestamp === this.timestamp &&
      tokenWeight.index === this.index &&
      tokenWeight.tokens.key === this.tokens.value &&
      tokenWeight.tokens.value === this.tokens.value;
  }

}
