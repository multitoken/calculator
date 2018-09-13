import Pair from './Pair';
import { Token } from './Token';

export class TokenWeight {

  public static readonly EMPTY: TokenWeight = new TokenWeight(new Pair(Token.EMPTY, Token.EMPTY), [], -1, -1);

  public tokens: Pair<Token, Token>;
  public otherTokens: Token[];
  public timestamp: number;
  public index: number;

  constructor(tokens: Pair<Token, Token> = new Pair(new Token(), new Token()),
              otherTokens: Token[] = [],
              timestamp: number = 0,
              index: number = 0) {
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
      tokenWeight.tokens.first === this.tokens.second &&
      tokenWeight.tokens.second === this.tokens.second;
  }

  public isEmpty(): boolean {
    const tokensEmpty: boolean = this.tokens
      .toArray()
      .map(value => value.isEmpty())
      .indexOf(false) === -1;

    return tokensEmpty && this.otherTokens.length <= 0 && this.index <= -1 && this.timestamp <= 0;
  }

}
