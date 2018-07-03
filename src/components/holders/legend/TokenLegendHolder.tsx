import * as React from 'react';
import { TokenLegend } from '../../../entities/TokenLegend';
import AbstractHolder, { AbstractProperties } from '../AbstractHolder';
import './TokenLegendHolder.less';

export enum LegendStyle {
  DOT = 'DOT',
  LINE = 'LINE'
}

export interface Properties extends AbstractProperties<TokenLegend> {
  style?: LegendStyle;
}

export class TokenLegendHolder extends AbstractHolder<Properties, {}, TokenLegend> {

  public bindModel(model: TokenLegend): object {
    return (
      <div className="TokenLegendHolder__content">
        <span
          className={'TokenLegendHolder__color' + (this.props.style === LegendStyle.LINE ? '_line' : '_dot')}
          style={{backgroundColor: model.color}}/>
        <span className="TokenLegendHolder__name">{model.name}</span>
      </div>
    );
  }

}
