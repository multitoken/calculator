import { Arbitration } from '../../repository/models/Arbitration';
import { DateUtils } from '../../utils/DateUtils';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<Arbitration[]> {
}

export class ArbiterChart extends AbstractChart<Properties, AbstractState, Arbitration[], any> {

  public parseData(data: Arbitration[]): any[] {
    return data.map(value => {
      const copy: any = Object.assign({}, value);
      copy.date = DateUtils.toStringDate(value.timestamp, DateUtils.DATE_FORMAT_SHORT);

      return copy;
    });
  }

  public getNames(): string[] {
    return ['arbiterCap', 'originCap'];
  }

}
