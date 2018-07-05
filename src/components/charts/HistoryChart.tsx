import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<Map<string, TokenPriceHistory[]>> {
  start: number;
  end: number;
  timeStep: number;
}

export class HistoryChart extends AbstractChart<Properties, AbstractState, Map<string, TokenPriceHistory[]>, any> {

  public shouldComponentUpdate(data: Readonly<Properties>, data1: Readonly<AbstractState>, data2: any): boolean {
    return super.shouldComponentUpdate(data, data1, data2) ||
      (this.props.start !== data.start || this.props.end !== data.end);
  }

  public componentDidUpdate(prevProps: Readonly<Properties>, prevState: Readonly<any>, snapshot?: any): void {
    const start: number = parseInt((this.props.start / this.getTimeStep()).toFixed(0), 10);
    const end: number = parseInt((this.props.end / this.getTimeStep()).toFixed(0), 10);
    if (start !== this.state.calculateRangeIndex.min ||
      end !== this.state.calculateRangeIndex.max) {
      this.setState({calculateRangeIndex: {min: start, max: end}});
    }
  }

  public parseData(data: Map<string, TokenPriceHistory[]>): any[] {
    const result: any[] = [];
    const skipStep: number = this.getTimeStep();

    for (let i = 0; i < this.props.end; i++) {
      if (i % skipStep !== 0) {
        continue;
      }

      const dataResult: any = {data: ''};
      data.forEach((value, key) => {
        dataResult.date = value[i].time;
        dataResult[key] = parseFloat(value[i].value.toFixed(6));
      });

      result.push(dataResult);
    }

    return result;
  }

  public getNames(): string[] {
    return Array.from(this.props.data.keys());
  }

  private getTimeStep(): number {
    return (86400 /* sec in day */) / this.props.timeStep;
  }

}
