import { ListGridType } from 'antd/lib/list';
import * as React from 'react';
import { CoinItemEntity } from '../../../entities/CoinItemEntity';
import { TokenNameHolder } from '../../holders/name/TokenNameHolder';
import AbstractList, { AbstractProperties } from '../AbstractList';
import './TokensNamesList.less';

interface Properties extends AbstractProperties<CoinItemEntity> {
  disabled: boolean;

  onCheck(checkedValue: string[]): void;

  onChange(name: string, checked: boolean): void;

}

interface State {
  checkedSet: Set<string>;
}

export class TokensNamesList extends AbstractList<Properties, CoinItemEntity, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      checkedSet: new Set(),
    };
  }

  protected getGridType(): ListGridType | undefined {
    return {gutter: 2, column: 6};
  }

  protected getListName(): string {
    return 'TokensNamesList';
  }

  protected bindHolder(dataItem: CoinItemEntity, position: number): object {
    return (
      <TokenNameHolder
        checked={this.state.checkedSet.has(dataItem.name)}
        onItemClick={model => this.onItemClick(model)}
        model={dataItem}
        key={position}
      />
    );
  }

  private onItemClick(model: CoinItemEntity): void {
    if (this.state.checkedSet.has(model.name)) {
      this.state.checkedSet.delete(model.name);
    } else {
      this.state.checkedSet.add(model.name);
    }

    this.setState({checkedSet: this.state.checkedSet});
    this.props.onCheck(Array.from(this.state.checkedSet.keys()));
    this.props.onChange(model.name, this.state.checkedSet.has(model.name));
  }

}
