import { Token } from '../../repository/models/Token';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<TokenWeight[]> {
  initialState: Token[];
  initialDate: number;
  finishDate: number;
}

export class WeightChart extends AbstractChart<Properties, AbstractState, TokenWeight[], any> {

  public parseData(data: TokenWeight[]): any[] {
    const result: any[] = [{date: DateUtils.toStringDate(this.props.initialDate, DateUtils.DATE_FORMAT_SHORT)}];

    this.props.initialState.map(value => result[0][value.name] = value.weight);

    this.props.data.forEach(value => {
      const dataResult: any = {data: ''};
      dataResult.date = DateUtils.toStringDate(value.timestamp, DateUtils.DATE_FORMAT_SHORT);
      value.tokens.toArray().forEach((value2: Token) => {
        dataResult[value2.name] = value2.weight;
      });

      value.otherTokens.forEach((value2: Token) => {
        dataResult[value2.name] = value2.weight;
      });

      result.push(dataResult);
    });

    result.push(Object.assign({} , result[result.length - 1]));
    result[result.length - 1].date = DateUtils.toStringDate(this.props.finishDate, DateUtils.DATE_FORMAT_SHORT);

    return result;
  }

  public getNames(): string[] {
    const names: Set<string> = new Set();
    this.props.data.forEach((value: TokenWeight) => {
      value.tokens.toArray().forEach((value2: Token) => names.add(value2.name));
      value.otherTokens.forEach((value2: Token) => names.add(value2.name));
    });

    return Array.from(names.keys());
  }

}
