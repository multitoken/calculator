import { Token } from '../../repository/models/Token';
import { TokenWeight } from '../../repository/models/TokenWeight';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<TokenWeight[]> {
  initialState: Token[];
  initialDate: number;
  finishDate: number;
}

export class WeightChart extends AbstractChart<Properties, AbstractState, TokenWeight[], any> {

  public shouldComponentUpdate(props: Readonly<Properties>, state: Readonly<AbstractState>, data2: any): boolean {
    super.shouldComponentUpdate(props, state, data2);

    this.isChangedData = this.props.data !== props.data ||
      this.props.initialState !== props.initialState ||
      this.props.initialDate !== props.initialDate ||
      this.props.finishDate !== props.finishDate;

    return this.isChangedData || this.state.selectedNames.length !== state.selectedNames.length;
  }

  public parseData(data: TokenWeight[]): any[] {
    const result: any[] = [{date: this.props.initialDate}];

    this.props.initialState.map(value => result[0][value.name] = value.weight);

    this.props.data.forEach(value => {
      const dataResult: any = {data: ''};
      dataResult.date = value.timestamp;
      value.tokens.toArray().forEach((value2: Token) => {
        dataResult[value2.name] = value2.weight;
      });

      value.otherTokens.forEach((value2: Token) => {
        dataResult[value2.name] = value2.weight;
      });

      result.push(dataResult);
    });

    result.push(Object.assign({}, result[result.length - 1]));
    result[result.length - 1].date = this.props.finishDate;

    return result;
  }

  public getNames(): string[] {
    return this.props.initialState.map((value: Token) => value.name)
      .sort((a, b) => a.localeCompare(b));
  }

  protected prepareData(): any[] {
    this.data = this.parseData(this.props.data);
    this.setState({calculateRangeIndex: {min: 0, max: (this.data.length - 1) || 1}});

    return this.data;
  }

}
