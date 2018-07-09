import { ColumnCount, ListGridType } from 'antd/lib/list';
import * as React from 'react';
import { TokenLegend } from '../../../entities/TokenLegend';
import { LegendStyle, TokenLegendHolder } from '../../holders/legend/TokenLegendHolder';
import AbstractList, { AbstractProperties } from '../AbstractList';
import './TokensLegendList.less';

interface Properties extends AbstractProperties<TokenLegend> {
  columnCount: ColumnCount;
  style?: LegendStyle;
  showCheckbox?: boolean;

  onChangeNames?(names: string[]): void;
}

export class TokensLegendList extends AbstractList<Properties, TokenLegend, {}> {

  private checked: Map<string, boolean> = new Map();

  public componentDidUpdate(prevProps: Readonly<Properties>, prevState: Readonly<{}>, snapshot?: any): void {
    if (this.checked.size !== this.props.data.length) {
      this.checked.clear();
      this.props.data.forEach(value => this.checked.set(value.name, true));
      if (this.props.onChangeNames) {
        this.props.onChangeNames(this.props.data.map(value => value.name));
      }
    }
  }

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
        defChecked={true}
        showCheckbox={this.props.showCheckbox === true}
        onCheckItemClick={(model, checked) => this.onCheckItemClick(model, checked)}
      />
    );
  }

  private onCheckItemClick(model: TokenLegend, checked: boolean) {
    console.log(this.checked);
    this.checked.set(model.name, checked);

    if (this.props.onChangeNames) {
      const result: string[] = [];
      this.checked.forEach((value, key) => {
        if (value === true) {
          result.push(key);
        }
      });
      this.props.onChangeNames(result);
    }
  }

}
