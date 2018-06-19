import * as React from 'react';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { TokenWeightHolder } from '../holders/TokenWeightHolder';
import AbstractList, { AbstractProperties } from './AbstractList';

interface Properties extends AbstractProperties<TokenWeight> {
  selectedPosition: number;
  onItemSelect?(model: TokenWeight, position: number): void;
}

interface State {
  selectedPosition: number;
}

export class TokenWeightList extends AbstractList<Properties, TokenWeight, State> {

  constructor(props: Properties) {
    super(props);
  }

  public bindHolder(dataItem: TokenWeight, position: number): object {
    return (
      <TokenWeightHolder
        model={dataItem}
        onClick={e => this.onItemClick(e, position)}
        selected={this.props.selectedPosition === position}
        key={position}
      />
    );
  }

  private onItemClick(model: TokenWeight, position: number) {
    if (this.props.onItemSelect) {
      this.props.onItemSelect(model, position);
    }
  }

}
