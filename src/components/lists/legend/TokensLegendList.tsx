import { ColumnCount, ListGridType } from 'antd/lib/list';
import * as React from 'react';
import { TokenLegend } from '../../../entities/TokenLegend';
import { LegendStyle, TokenLegendHolder } from '../../holders/legend/TokenLegendHolder';
import AbstractList, { AbstractProperties } from '../AbstractList';
import './TokensLegendList.less';

interface Properties extends AbstractProperties<TokenLegend> {
  columnCount: ColumnCount;
  style?: LegendStyle;
}

export class TokensLegendList extends AbstractList<Properties, TokenLegend, {}> {

  protected getGridType(): ListGridType | undefined {
    return {gutter: 1, column: this.props.columnCount};
  }

  protected getListName(): string {
    return 'TokenLegendHolder';
  }

  public bindHolder(dataItem: TokenLegend, position: number): object {
    return (
      <TokenLegendHolder
        style={this.props.style}
        model={dataItem}
        key={position}
      />
    );
  }

}
