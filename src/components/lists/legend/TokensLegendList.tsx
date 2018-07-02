import { ListGridType } from 'antd/lib/list';
import * as React from 'react';
import { TokenLegend } from '../../../entities/TokenLegend';
import { TokenLegendHolder } from '../../holders/legend/TokenLegendHolder';
import AbstractList, { AbstractProperties } from '../AbstractList';
import './TokensLegendList.less';

interface Properties extends AbstractProperties<TokenLegend> {
}

export class TokensLegendList extends AbstractList<Properties, TokenLegend, {}> {

  protected getGridType(): ListGridType | undefined {
    return {gutter: 1, column: 2};
  }

  public bindHolder(dataItem: TokenLegend, position: number): object {
    return (
      <TokenLegendHolder
        model={dataItem}
        key={position}
      />
    );
  }

}
