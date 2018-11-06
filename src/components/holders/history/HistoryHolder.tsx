import Button from 'antd/lib/button/button';
import * as React from 'react';
import { ExecutorType } from '../../../manager/multitoken/executors/TimeLineExecutor';
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
      <div className="HistoryHolder__content">
        <div className="HistoryHolder__content__title">{this.getTitleOfType(model.type)}</div>

        <div className="HistoryHolder__content__param">
          <span className="HistoryHolder__content__param-name">
            Rebalance cap:
          </span>
          <span className="HistoryHolder__content__param-value">
          ~$ {model.capWith.toLocaleString()}
          </span>
        </div>

        <div className="HistoryHolder__content__param">
          <span className="HistoryHolder__content__param-name">
            Origin cap:
          </span>
          <span className="HistoryHolder__content__param-value">
          $ {model.capWithout.toLocaleString()}
          </span>
        </div>

        <div className="HistoryHolder__content__param">
          <span className="HistoryHolder__content__param-name">
            BTC cap:
          </span>
          <span className="HistoryHolder__content__param-value">
          $ {model.capBtc.toLocaleString()}
          </span>
        </div>

        <div className="HistoryHolder__content__param">
          <span className="HistoryHolder__content__param-name">
            Amount:
          </span>
          <span className="HistoryHolder__content__param-value">
          $ {model.amount.toLocaleString()}
          </span>
        </div>

        {this.getRebalanceDiffPercent(model.executors, model.options.rebalanceDiffPercent)}
        {this.getRebalancePeriod(model.executors, model.options.rebalancePeriod)}
        {this.getExchangeAmount(model.executors, model.options.exchangeAmount)}
        {this.getCommissionPercent(model.executors, model.options.commissionPercents)}
        {this.getTokensProportions(model.options.proportions)}

        <div className="HistoryHolder__content__btn">
          <Button
            className="HistoryHolder__content__btn-load"
            type="primary"
            onClick={() => this.props.onChangePortfolio(model)}
          >
            Load
          </Button>
        </div>
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

  private getRebalanceDiffPercent(executors: ExecutorType[], value: number): React.ReactNode {
    if (this.diffPercentPercentsRebalanceVisibility(executors)) {
      return (
        <div>
          <div className="HistoryHolder__content__param">
        <span className="HistoryHolder__content__param-name">
        Rebalance diff:
        </span>
            <span className="HistoryHolder__content__param-value">
        {value}%
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getRebalancePeriod(executors: ExecutorType[], value: number): React.ReactNode {
    if (this.rebalancePeriodVisibility(executors)) {
      return (
        <div>
          <div className="HistoryHolder__content__param">
        <span className="HistoryHolder__content__param-name">
        Rebalance period:
        </span>
            <span className="HistoryHolder__content__param-value">
        {this.getRebalanceByPeriod(value)}
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getRebalanceByPeriod(seconds: number): string {
    if (seconds === 3600) {
      return 'HOUR';

    } else if (seconds === 86400) {
      return 'DAY';

    } else if (seconds === 604800) {
      return 'WEEK';

    } else if (seconds === 2592000) {
      return 'MONTH';
    }

    return 'SOME_CUSTOM';
  }

  private getExchangeAmount(executors: ExecutorType[], value: number): React.ReactNode {
    if (this.exchangeAmountVisibility(executors)) {
      return (
        <div>
          <div className="HistoryHolder__content__param">
        <span className="HistoryHolder__content__param-name">
        Exchange amount:
        </span>
            <span className="HistoryHolder__content__param-value">
        $ {value}
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getCommissionPercent(executors: ExecutorType[], value: number): React.ReactNode {
    if (this.commissionPercentsVisibility(executors)) {
      return (
        <div>
          <div className="HistoryHolder__content__param">
        <span className="HistoryHolder__content__param-name">
        Commission percent:
        </span>
            <span className="HistoryHolder__content__param-value">
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
          <div className="HistoryHolder__content__param">
        <span className="HistoryHolder__content__param-name">
        {value.name} weight:
        </span>
            <span className="HistoryHolder__content__param-value">
        {value.weight}
        </span>
          </div>
        </div>
      );
    });
  }

  private rebalancePeriodVisibility(executors: ExecutorType[]): boolean {
    return executors.indexOf(ExecutorType.PERIOD_REBALANCER) > -1;
  }

  private exchangeAmountVisibility(executors: ExecutorType[]): boolean {
    return executors.indexOf(ExecutorType.EXCHANGER) > -1;
  }

  private commissionPercentsVisibility(executors: ExecutorType[]): boolean {
    return executors.indexOf(ExecutorType.EXCHANGER) > -1 || executors.indexOf(ExecutorType.ARBITRAGEUR) > -1;
  }

  private diffPercentPercentsRebalanceVisibility(executors: ExecutorType[]): boolean {
    return executors.indexOf(ExecutorType.DIFF_PERCENT_REBALANCER) > -1;
  }

}
