import { TokenProportion } from '../../repository/models/TokenProportion';
import AbstractChart, { AbstractProperties, AbstractState } from './AbstractChart';

interface Properties extends AbstractProperties<TokenProportion[]> {
}

export class ProportionChart extends AbstractChart<Properties, AbstractState, TokenProportion[], any> {

  public parseData(data: TokenProportion[]): any[] {
    return data.map(value => {
      return {name: value.name, value: value.weight};
    });
  }

  public getNames(): string[] {
    return [];
  }

}
