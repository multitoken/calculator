export default class Pair<K, V> {

  public key: K;
  public value: V;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }

  public toArray(): any[] {
    return [this.key, this.value];
  }

}
