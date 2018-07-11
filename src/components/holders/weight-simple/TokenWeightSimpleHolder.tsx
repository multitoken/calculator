import * as React from 'react';
import { Token } from '../../../repository/models/Token';
import { TokenWeight } from '../../../repository/models/TokenWeight';
import { DateUtils } from '../../../utils/DateUtils';
import AbstractHolder, { AbstractProperties } from '../AbstractHolder';
import './TokenWeightSimpleHolder.less';

export interface Properties extends AbstractProperties<TokenWeight> {
}

export class TokenWeightSimpleHolder extends AbstractHolder<Properties, TokenWeight, object> {

  public bindModel(model: TokenWeight): object {
    return (
      <div className="TokenWeightSimpleHolder__content">
        <div className="TokenWeightSimpleHolder__content-data">
        <span className="TokenWeightSimpleHolder__item-date">
          {DateUtils.toFormat(model.timestamp, DateUtils.DATE_FORMAT_SHORT)}
          </span>
          {this.prepareTokens(model)}
        </div>
      </div>
    );
  }

  private prepareTokens(model: TokenWeight): any[] {
    return model.tokens.toArray().map((value: Token) => {
      return (
        <div key={value.name}>
          <span className="TokenWeightSimpleHolder__item-key">{value.name}</span>
          <span className="TokenWeightSimpleHolder__item-value">{value.weight}</span>
        </div>
      );
    });
  }

}
