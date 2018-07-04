import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<Map<string, TokenPriceHistory[]>> {
  start: number;
  end: number;
}

export class HistoryChart extends AbstractChart<Properties, AbstractState, Map<string, TokenPriceHistory[]>, any> {

  private static readonly TIME_STEP_MINUTES: number = 1800;

  public shouldComponentUpdate(data: Readonly<Properties>, data1: Readonly<AbstractState>, data2: any): boolean {
    return super.shouldComponentUpdate(data, data1, data2) ||
      (this.props.start !== data.start || this.props.end !== data.end);
  }

  public componentDidUpdate(prevProps: Readonly<Properties>, prevState: Readonly<any>, snapshot?: any): void {
    const start: number = parseInt((this.props.start / HistoryChart.TIME_STEP_MINUTES).toFixed(0), 10);
    const end: number = parseInt((this.props.end / HistoryChart.TIME_STEP_MINUTES).toFixed(0), 10);
    if (start !== this.state.calculateRangeIndex.min ||
      end !== this.state.calculateRangeIndex.max) {
      this.setState({calculateRangeIndex: {min: start, max: end}});
    }
  }

  public parseData(data: Map<string, TokenPriceHistory[]>): any[] {
    const result: any[] = [];

    for (let i = 0; i < this.props.end; i++) {
      if (i % HistoryChart.TIME_STEP_MINUTES !== 0) {
        continue;
      }

      const dataResult: any = {data: ''};
      data.forEach((value, key) => {
        dataResult.date = value[i].time;
        dataResult[key] = value[i].value;
      });

      result.push(dataResult);
    }

    return result;
  }

  public getNames(): string[] {
    return Array.from(this.props.data.keys());
  }

}
