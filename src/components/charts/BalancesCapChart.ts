import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { RebalanceValues } from '../../repository/models/RebalanceValues';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<RebalanceValues[]> {
  showRebalanceCap: boolean;
}

export class BalancesCapChart extends AbstractChart<Properties, AbstractState, RebalanceValues[], any> {

  public parseData(data: RebalanceValues[]): any[] {
    const step: number = data.length > 1000 ? 3 : 1;
    const result: any[] = [];

    data.forEach((value, index) => {
      if (index % step === 0) {
        const rebalanceCap: number = value.multitokenCap.get(RebalanceHistory.MULTITOKEN_NAME_REBALANCE) || 0;
        const bitcoinCap: number = value.bitcoinCap;

        const copy: any = {date: value.timestamp};

        if (this.props.showRebalanceCap) {
          copy[RebalanceHistory.MULTITOKEN_NAME_REBALANCE] = parseFloat(rebalanceCap.toFixed(0));
        }

        copy[RebalanceHistory.BITCOIN_NAME] = parseFloat(bitcoinCap.toFixed(0));

        result.push(copy);
      }
    });

    return result;
  }

  public getNames(): string[] {
    const names: string[] = [RebalanceHistory.BITCOIN_NAME];
    if (this.props.showRebalanceCap) {
      names.unshift(RebalanceHistory.MULTITOKEN_NAME_REBALANCE);
    }

    return names;
  }

}
