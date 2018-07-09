import { Checkbox } from 'antd';
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
  showCheckbox: boolean;
  defChecked: boolean;

  onCheckItemClick(name: TokenLegend, value: boolean): void;
}

export class TokenLegendHolder extends AbstractHolder<Properties, {}, TokenLegend> {

  public bindModel(model: TokenLegend): object {
    return (
      <div className="TokenLegendHolder__content">
        <span
          className={'TokenLegendHolder__color' + (this.props.style === LegendStyle.LINE ? '_line' : '_dot')}
          style={{backgroundColor: model.color}}/>
        <span className="TokenLegendHolder__name">{model.name}</span>
        {this.prepareCheckbox(model)}
      </div>
    );
  }

  private prepareCheckbox(model: TokenLegend): any {
    return this.props.showCheckbox
      ? <Checkbox style={{marginLeft: '8px'}} defaultChecked={this.props.defChecked} onChange={
        e => this.props.onCheckItemClick(model, e.target.checked)
      }/>
      : null;
  }
}
