import * as React from 'react';
import { TokenType } from '../../../manager/multitoken/PortfolioManagerImpl';
import { Portfolio } from '../../../repository/models/Portfolio';
import { TokenProportion } from '../../../repository/models/TokenProportion';
import AbstractHolder, { AbstractProperties } from '../AbstractHolder';
import './HisotryHolder.less';

export interface Properties extends AbstractProperties<Portfolio> {
  onChangePortfolio(portfolio: Portfolio): void;
}

export class HistoryHolder extends AbstractHolder<Properties, {}, Portfolio> {

  public bindModel(model: Portfolio): object {
    return (
      <div className="HistoryHolder__content" onClick={() => this.props.onChangePortfolio(model)}>
        <div className="HistoryHolder__content_title">{this.getTitleOfType(model.type)}</div>
        <div className="HistoryHolder__content_param">
        <span className="HistoryHolder__content_param_name">
          Amount:
        </span>
          <span className="HistoryHolder__content_param_value">
        $ {model.amount.toLocaleString()}
        </span>
        </div>
        {this.getRebalanceDiffPercent(model.options.rebalanceDiffPercent)}
        {this.getExchangeAmount(model.options.exchangeAmount)}
        {this.getCommissionPercent(model.options.commissionPercents)}
        {this.getTokensProportions(model.options.proportions)}
      </div>

    );
  }

  private getTitleOfType(type: string): string {
    const tokenType: TokenType = TokenType[type];
    switch (tokenType) {
      case TokenType.AUTO_REBALANCE:
        return 'Auto rebalance:';

      case TokenType.MANUAL_REBALANCE:
        return 'Manual rebalance:';

      case TokenType.FIX_PROPORTIONS:
        return 'Fix proportions:';

      case TokenType.PERIOD_REBALANCE:
        return 'Rebalance by period:';

      case TokenType.DIFF_PERCENT_REBALANCE:
        return 'Price rebalancing:';

      case TokenType.ADAPTIVE_PERCENT_EXCHANGER:
        return '10% exchanges of balance:';

      default:
        return 'unknown';
    }
  }

  private getRebalanceDiffPercent(value: number): React.ReactNode {
    if (value > 0) {
      return (
        <div>
          <div className="HistoryHolder__content_param">
        <span className="HistoryHolder__content_param_name">
        Rebalance diff:
        </span>
            <span className="HistoryHolder__content_param_value">
          {value}%
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getExchangeAmount(value: number): React.ReactNode {
    if (value > 0) {
      return (
        <div>
          <div className="HistoryHolder__content_param">
        <span className="HistoryHolder__content_param_name">
        Exchange amount:
        </span>
            <span className="HistoryHolder__content_param_value">
        $ {value}
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getCommissionPercent(value: number): React.ReactNode {
    if (value > 0) {
      return (
        <div>
          <div className="HistoryHolder__content_param">
        <span className="HistoryHolder__content_param_name">
        Commission percent:
        </span>
            <span className="HistoryHolder__content_param_value">
        {value}%
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getTokensProportions(proportions: TokenProportion[]): React.ReactNode {
    return proportions.map(value => {
      return (
        <div key={value.name}>
          <div className="HistoryHolder__content_param">
        <span className="HistoryHolder__content_param_name">
        {value.name} weight:
        </span>
            <span className="HistoryHolder__content_param_value">
        {value.weight}
        </span>
          </div>
        </div>
      );
    });
  }

}
