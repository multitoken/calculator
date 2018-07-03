import * as React from 'react';
import { TokenProportion } from '../../../repository/models/TokenProportion';
import { TokenProportionHolder } from '../../holders/proportion/TokenProportionHolder';
import AbstractList, { AbstractProperties } from '../AbstractList';
import './TokensProportionsList.less';

interface Properties extends AbstractProperties<TokenProportion> {
  disabled: boolean;

  onChangeProportion(name: string, value: number, position: number): void;
}

export class TokensProportionsList extends AbstractList<Properties, TokenProportion, {}> {

  protected getListName(): string {
    return 'TokensProportionsList';
  }

  public bindHolder(dataItem: TokenProportion, position: number): object {
    return (
      <TokenProportionHolder
        disabled={this.props.disabled}
        onChangeProportion={(name, value) => this.props.onChangeProportion(name, value, position)}
        model={dataItem}
        key={position}
      />
    );
  }

}
