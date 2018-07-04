import { Arbitration } from '../../repository/models/Arbitration';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<Arbitration[]> {
}

export class TokensCapChart extends AbstractChart<Properties, AbstractState, Arbitration[], any> {

  public parseData(data: Arbitration[]): any[] {
    return data.map(value => {
      const dataResult: any = {};
      dataResult.date = value.timestamp;

      value.arbiterTokensCap.forEach((value2, key) => {
        dataResult['arbiter' + key] = value2;
      });
      value.originTokensCap.forEach((value2, key) => {
        dataResult['origin' + key] = value2;
      });

      return dataResult;
    });
  }

  public getNames(): string[] {
    if (this.props.data.length > 0 && this.props.data[0].originTokensCap.size > 0) {
      const result: Set<string> = new Set();

      this.props.data[0].arbiterTokensCap.forEach((value2, key) => {
        result.add('arbiter' + key);
      });
      this.props.data[0].originTokensCap.forEach((value2, key) => {
        result.add('origin' + key);
      });

      return Array.from(result);
    }
    return [];
  }

}
