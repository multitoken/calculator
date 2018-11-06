import Button from 'antd/lib/button/button';
import * as React from 'react';
import { PreparedPortfolio } from '../../../entities/PreparedPortfolio';
import { TokensHelper } from '../../../utils/TokensHelper';
import AbstractHolder, { AbstractProperties } from '../AbstractHolder';
import './PreparedPortfolioHolder.less';

export interface Properties extends AbstractProperties<PreparedPortfolio> {
  onItemClick(model: PreparedPortfolio): void;
}

export class PreparedPortfolioHolder extends AbstractHolder<Properties, {}, PreparedPortfolio> {

  public bindModel(model: PreparedPortfolio): object {
    return (
      <div
        className={`PreparedPortfolio__content`}
      >
        <img className="PreparedPortfolio__icon" src={model.getIcon()}/>

        <div className={'PreparedPortfolio__type-block'}>
          <span className="PreparedPortfolio__type-block__key">Type:</span>
          <span className="PreparedPortfolio__type-block__value">{model.getReadableType()}</span>
        </div>
        <div className={'PreparedPortfolio__coins-block'}>
          <span className="PreparedPortfolio__coins-block__key">Coins:</span>
          <span
            className="PreparedPortfolio__coins-block__value"
          >
              {model.coins.map(coin => TokensHelper.getSymbol(coin)).join(',')}
            </span>
        </div>
        <div className="PreparedPortfolio__content__btn">
          <Button
            type="primary"
            onClick={() => this.props.onItemClick(model)}
          >
            Load
          </Button>
        </div>
      </div>
    );
  }

}
