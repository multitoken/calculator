import * as React from 'react';
import { TokenLegend } from '../../entities/TokenLegend';
import AbstractHolder, { AbstractProperties } from './AbstractHolder';
import './TokenLegendHolder.less';

export interface Properties extends AbstractProperties<TokenLegend> {
}

export class TokenLegendHolder extends AbstractHolder<Properties, {}, TokenLegend> {

  public bindModel(model: TokenLegend): object {
    return (
      <div className="TokenLegendHolder__content">
        <span className="TokenLegendHolder__color" style={{backgroundColor: model.color}}/>
        <span className="TokenLegendHolder__name">{model.name}</span>
      </div>
    );
  }

}
