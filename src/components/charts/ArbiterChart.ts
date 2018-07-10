import { RebalanceValues } from '../../repository/models/RebalanceValues';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<RebalanceValues[]> {
  showRebalanceCap: boolean;
}

export class ArbiterChart extends AbstractChart<Properties, AbstractState, RebalanceValues[], any> {

  public parseData(data: RebalanceValues[]): any[] {
    return data.map(value => {
      const copy: any = Object.assign({}, value);
      copy.date = value.timestamp;

      if (this.props.showRebalanceCap) {
        copy['rebalance cap'] = parseFloat(copy.rebalanceCap.toFixed(0));
      }

      copy['original cap'] = parseFloat(copy.originalCap.toFixed(0));
      copy['bitcoin cap'] = parseFloat(copy.bitcoinCap.toFixed(0));

      return copy;
    });
  }

  public getNames(): string[] {
    const names: string[] = ['original cap', 'bitcoin cap'];
    if (this.props.showRebalanceCap) {
      names.unshift('rebalance cap');
    }

    return names;
  }

}
