import { RebalanceValues } from '../../repository/models/RebalanceValues';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<RebalanceValues[]> {
}

export class ArbiterChart extends AbstractChart<Properties, AbstractState, RebalanceValues[], any> {

  public parseData(data: RebalanceValues[]): any[] {
    return data.map(value => {
      const copy: any = Object.assign({}, value);
      copy.date = value.timestamp;
      copy['rebalance cap'] = parseFloat(copy.rebalanceCap.toFixed(0));
      copy['original cap'] = parseFloat(copy.originalCap.toFixed(0));
      copy['bitcoin cap'] = parseFloat(copy.bitcoinCap.toFixed(0));

      return copy;
    });
  }

  public getNames(): string[] {
    return ['rebalance cap', 'original cap', 'bitcoin cap'];
  }

}
