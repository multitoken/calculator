import Config from '../../Config';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import { DateUtils } from '../../utils/DateUtils';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<Map<string, TokenPriceHistory[]>> {
  start: number;
  end: number;
}

export class HistoryChart extends AbstractChart<Properties, AbstractState, Map<string, TokenPriceHistory[]>, any> {

  public shouldComponentUpdate(data: Readonly<Properties>, data1: Readonly<AbstractState>, data2: any): boolean {
    return super.shouldComponentUpdate(data, data1, data2) ||
      (this.props.start !== data.start || this.props.end !== data.end);
  }

  public parseData(data: Map<string, TokenPriceHistory[]>): any[] {
    const result: any[] = [];

    for (let i = this.props.start; i < this.props.end; i++) {
      if (i % 3600 !== 0) {
        continue;
      }

      const dataResult: any = {data: ''};
      data.forEach((value, key) => {
        dataResult.date = DateUtils.toStringDate(value[i].time, DateUtils.DATE_FORMAT_SHORT);
        dataResult[key] = Number((value[i].close * Config.getBtcUsdPrice()).toFixed(4));
      });

      result.push(dataResult);
    }

    return result;
  }

  public getNames(): string[] {
    return Array.from(this.props.data.keys());
  }

}
