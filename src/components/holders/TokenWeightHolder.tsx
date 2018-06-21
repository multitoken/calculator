import { List } from 'antd';
import * as React from 'react';
import { Token } from '../../repository/models/Token';
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
          {this.prepareTokens(model)}
          <div>date: {DateUtils.toStringDate(model.timestamp, DateUtils.DATE_FORMAT_SHORT)}</div>
        </div>
      </List.Item>
    );
  }

  private prepareTokens(model: TokenWeight): any[] {
    return model.tokens.toArray().map((value: Token) => {
      return <div key={value.name}>name: {value.name} -> weight: {value.weight}</div>;
    });
  }

}
