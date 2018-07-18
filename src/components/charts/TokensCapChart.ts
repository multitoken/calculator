import { RebalanceHistory } from '../../repository/models/RebalanceHistory';
import { RebalanceValues } from '../../repository/models/RebalanceValues';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<RebalanceValues[]> {
}

export class TokensCapChart extends AbstractChart<Properties, AbstractState, RebalanceValues[], any> {

  public parseData(data: RebalanceValues[]): any[] {
    return data.map(value => {
      const dataResult: any = {};
      dataResult.date = value.timestamp;
      const rebalanceTokensCap: Map<string, number> = value.multitokenTokensCap
        .get(RebalanceHistory.MULTITOKEN_NAME_REBALANCE) || new Map();

      const standardTokensCap: Map<string, number> = value.multitokenTokensCap
        .get(RebalanceHistory.MULTITOKEN_NAME_STANDARD) || new Map();

      rebalanceTokensCap.forEach((value2, key) => {
        dataResult[RebalanceHistory.MULTITOKEN_NAME_REBALANCE + key] = parseFloat(value2.toFixed(0));
      });

      standardTokensCap.forEach((value2, key) => {
        dataResult[RebalanceHistory.MULTITOKEN_NAME_STANDARD + key] = parseFloat(value2.toFixed(0));
      });

      return dataResult;
    });
  }

  public getNames(): string[] {
    if (this.props.data.length > 0) {
      const result: Set<string> = new Set();
      const rebalanceTokensCap: Map<string, number> = this.data[0].multitokenTokensCap
        .get(RebalanceHistory.MULTITOKEN_NAME_REBALANCE) || new Map();
      const standardTokensCap: Map<string, number> = this.data[0].multitokenTokensCap
        .get(RebalanceHistory.MULTITOKEN_NAME_STANDARD) || new Map();

      rebalanceTokensCap.forEach((value2, key) => {
        result.add(RebalanceHistory.MULTITOKEN_NAME_REBALANCE + key);
      });

      standardTokensCap.forEach((value2, key) => {
        result.add(RebalanceHistory.MULTITOKEN_NAME_STANDARD + key);
      });

      return Array.from(result);
    }
    return [];
  }

}
