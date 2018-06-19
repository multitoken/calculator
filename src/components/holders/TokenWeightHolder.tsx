import { List } from 'antd';
import * as React from 'react';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';
import AbstractHolder, { AbstractProperties } from './AbstractHolder';

export interface Properties extends AbstractProperties<TokenWeight> {
  selected: boolean;

  onClick(model: TokenWeight): void;
}

export class TokenWeightHolder extends AbstractHolder<Properties, TokenWeight, object> {

  public bindModel(model: TokenWeight): object {
    return (
      <List.Item
        style={{
          background: this.props.selected ? '#1890ff' : 'white'
        }}
      >
        <div style={{width: '100%', cursor: 'pointer'}} onClick={e => this.props.onClick(model)}>
          <div>name: {model.tokenName}</div>
          <div>date: {DateUtils.toStringDate(model.timestamp, DateUtils.DATE_FORMAT_SHORT)}</div>
          <div>proportion: {model.weight}</div>
        </div>
      </List.Item>
    );
  }

}
