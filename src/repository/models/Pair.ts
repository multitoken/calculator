export default class Pair<K, V> {

  public first: K;
  public second: V;

  constructor(first: K, second: V) {
    this.first = first;
    this.second = second;
  }

  public toArray(): any[] {
    return [this.first, this.second];
  }

}
