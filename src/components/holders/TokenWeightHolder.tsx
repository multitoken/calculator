import { Col, List, Row } from 'antd';
import * as React from 'react';
import { Token } from '../../repository/models/Token';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';
import AbstractHolder, { AbstractProperties } from './AbstractHolder';
import './TokenWeight.less';

export interface Properties extends AbstractProperties<TokenWeight> {
  selected: boolean;

  onClick(model: TokenWeight): void;
}

export class TokenWeightHolder extends AbstractHolder<Properties, TokenWeight, object> {

  public bindModel(model: TokenWeight): object {
    return (
      <List.Item
        style={{
          background: this.props.selected ? 'rgb(232, 244, 255)' : 'white'
        }}
      >
        <div style={{width: '100%', cursor: 'pointer'}} onClick={e => this.props.onClick(model)}>
          {this.prepareTokens(model)}

          <Row>
            <Col span={2} className="TokenWeight__item-key">
              Date:
            </Col>
            <Col>
            <span className="TokenWeight__item-name">
               {DateUtils.toStringDate(model.timestamp, DateUtils.DATE_FORMAT_SHORT)}
              </span>
            </Col>
          </Row>
        </div>
      </List.Item>
    );
  }

  private prepareTokens(model: TokenWeight): any[] {
    return model.tokens.toArray().map((value: Token) => {
      return (
        <Row key={value.name}>
          <Col span={2} className="TokenWeight__item-key">
            Name:
          </Col>
          <Col>
            <span className="TokenWeight__item-name">
              {value.name} -> weight: {value.weight}
              </span>
          </Col>
        </Row>
      );
    });
  }

}
