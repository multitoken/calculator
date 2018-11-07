import Button from 'antd/lib/button/button';
import * as React from 'react';
import { PreparedPortfolio } from '../../../entities/PreparedPortfolio';
import Background from '../../../res/icons/portfolio-blue.svg';
import { TokensHelper } from '../../../utils/TokensHelper';
import AbstractHolder, { AbstractProperties } from '../AbstractHolder';
import './PreparedPortfolioHolder.less';

export interface Properties extends AbstractProperties<PreparedPortfolio> {
  position: number;

  onItemClick(model: PreparedPortfolio): void;
}

export class PreparedPortfolioHolder extends AbstractHolder<Properties, {}, PreparedPortfolio> {

  public bindModel(model: PreparedPortfolio): object {
    return (
      <div
        className={`PreparedPortfolio__content`}
      >

        <div className="PreparedPortfolio__title">
          Portfolio #{this.props.position + 1}
        </div>

        <div className="PreparedPortfolio__sub-title">
          {model.getReadableType()}
        </div>

        <div className="PreparedPortfolio__img__block">
          <img className="PreparedPortfolio__img__block__background" src={Background}/>
          <img className="PreparedPortfolio__img__block__icon" src={model.getIcon()}/>
        </div>

        <div className={'PreparedPortfolio__coins-block'}>
          <div className="PreparedPortfolio__coins-block__key">Coins:</div>
          <div className="PreparedPortfolio__coins-block__value">
            {model.coins.map(coin => TokensHelper.getSymbol(coin)).join(', ')}
          </div>
        </div>
        <div className="PreparedPortfolio__content__btn">
          <Button
            type="primary"
            onClick={() => this.props.onItemClick(model)}
          >
            Select
          </Button>
        </div>
      </div>
    );
  }

}
