import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<TokenWeight[]> {
}

export class WeightChart extends AbstractChart<Properties, AbstractState, TokenWeight[], any> {

  public parseData(data: TokenWeight[]): any[] {
    return this.props.data.map(value => {
      const dataResult: any = {data: ''};
      dataResult.date = DateUtils.toStringDate(value.timestamp, DateUtils.DATE_FORMAT_SHORT);
      dataResult[value.tokenName] = value.weight;

      return dataResult;
    });
  }

  public getNames(): string[] {
    const names: Set<string> = new Set();
    this.props.data.forEach(value => names.add(value.tokenName));

    return Array.from(names.keys());
  }

}
