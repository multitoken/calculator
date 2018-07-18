export interface Multitoken {

  setup(amounts: Map<string, number>, weights: Map<string, number>): void;

  /**
   * @param {string} fromSymbol name of cheap token.
   * @param {string} toSymbol name of expensive token.
   * @param {number} amount number of cheap token for exchange.
   *
   * @returns {[number , number]} array of number where 0 - is number of exchange tokens, 1 - is commission percent.
   */
  preCalculateExchange(fromSymbol: string, toSymbol: string, amount: number): [number, number];

  exchange(fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number): void;

  getAmounts(): Map<string, number>;

  getWeights(): Map<string, number>;

  getName(): string;

}
