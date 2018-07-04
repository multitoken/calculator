import { Arbitration } from '../../repository/models/Arbitration';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<Arbitration[]> {
}

export class ArbiterChart extends AbstractChart<Properties, AbstractState, Arbitration[], any> {

  public parseData(data: Arbitration[]): any[] {
    return data.map(value => {
      const copy: any = Object.assign({}, value);
      copy.date = value.timestamp;
      copy.arbiterCap = parseFloat(copy.arbiterCap.toFixed(0));
      copy.originCap = parseFloat(copy.originCap.toFixed(0));
      copy['only Bitcoin'] = parseFloat(copy.bitcoinCap.toFixed(0));
      return copy;
    });
  }

  public getNames(): string[] {
    return ['arbiterCap', 'originCap', 'only Bitcoin'];
  }

}
