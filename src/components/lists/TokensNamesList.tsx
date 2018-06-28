import { ListGridType } from 'antd/lib/list';
import * as React from 'react';
import { TokenItemEntity } from '../../entities/TokenItemEntity';
import { TokenNameHolder } from '../holders/TokenNameHolder';
import AbstractList, { AbstractProperties } from './AbstractList';
import './TokensNamesList.less';

interface Properties extends AbstractProperties<TokenItemEntity> {
  disabled: boolean;

  onCheck(checkedValue: string[]): void;
}

interface State {
  checkedSet: Set<string>;
}

export class TokensNamesList extends AbstractList<Properties, TokenItemEntity, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      checkedSet: new Set(),
    };
  }

  protected getGridType(): ListGridType | undefined {
    return {gutter: 1, column: 2};
  }

  protected bindHolder(dataItem: TokenItemEntity, position: number): object {
    return (
      <TokenNameHolder
        checked={this.state.checkedSet.has(dataItem.name)}
        onItemClick={model => this.onItemClick(model)}
        model={dataItem}
        key={position}
      />
    );
  }

  private onItemClick(model: TokenItemEntity): void {
    if (this.state.checkedSet.has(model.name)) {
      this.state.checkedSet.delete(model.name);
    } else {
      this.state.checkedSet.add(model.name);
    }

    console.log(this.state.checkedSet);
    this.setState({checkedSet: this.state.checkedSet});
    this.props.onCheck(Array.from(this.state.checkedSet.keys()));
  }

}
