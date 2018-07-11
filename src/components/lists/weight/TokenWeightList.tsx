import * as React from 'react';
import { TokenWeight } from '../../../repository/models/TokenWeight';
import { TokenWeightEmptyHolder } from '../../holders/weight/TokenWeightEmptyHolder';
import { TokenWeightHolder } from '../../holders/weight/TokenWeightHolder';
import AbstractList, { AbstractProperties } from '../AbstractList';
import './TokenWeightList.less';

interface Properties extends AbstractProperties<TokenWeight> {
  onEditClick?(model: TokenWeight, position: number): void;

  onDeleteClick?(model: TokenWeight, position: number): void;

  onAddClick?(): void;
}

export class TokenWeightList extends AbstractList<Properties, TokenWeight, {}> {

  protected getData(): TokenWeight[] {
    const data: TokenWeight[] = this.props.data;
    const lastModel: TokenWeight | undefined = data.length > 0
      ? data[data.length - 1]
      : undefined;

    const list: TokenWeight[] = data.length > 0
      ? data.slice(0, data.length)
      : [];

    if (lastModel === undefined || lastModel.index !== -1) {
      list.push(TokenWeight.EMPTY);
    }

    return list;
  }

  protected getItemLayout(): string | undefined {
    return 'horizontal';
  }

  protected getListName(): string {
    return 'TokenWeightList';
  }

  public bindHolder(dataItem: TokenWeight, position: number): React.ReactNode {
    if (dataItem.isEmpty()) {
      return (
        <TokenWeightEmptyHolder
          onItemClick={(model, id) => this.props.onAddClick ? this.props.onAddClick() : ''}
          model={dataItem}
          key={position}
        />
      );
    }

    return (
      <TokenWeightHolder
        model={dataItem}
        onItemClick={(model, id) => {
          if (id === TokenWeightHolder.HOLDER_ACTION_ID_DELETE && this.props.onDeleteClick) {
            this.props.onDeleteClick(model, position);
          } else if (id === TokenWeightHolder.HOLDER_ACTION_ID_EDIT && this.props.onEditClick) {
            this.props.onEditClick(model, position);
          }
        }}
        key={position}
      />
    );
  }

}
