export class Token {

  public static readonly EMPTY = new Token('', -1);

  public name: string;
  public weight: number;

  constructor(name: string = '', weight: number = -1) {
    this.name = name;
    this.weight = weight;
  }

  public isEmpty(): boolean {
    return (this.name === undefined || this.name === '') && this.weight === -1;
  }

}
