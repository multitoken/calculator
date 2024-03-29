import { Button, Col, Input, Popover, Row, Switch, Tooltip } from 'antd';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { TokenType } from '../../manager/multitoken/PortfolioManagerImpl';
import { RebalanceResult } from '../../manager/multitoken/RebalanceResult';
import { Portfolio } from '../../repository/models/Portfolio';
import { TokenPriceHistory } from '../../repository/models/TokenPriceHistory';
import IcoInfo from '../../res/icons/ico_info.svg';
import { TokensHelper } from '../../utils/TokensHelper';
import { BalancesCapChart } from '../charts/BalancesCapChart';
import { HistoryChart } from '../charts/HistoryChart';
import { TokenWeightSimpleList } from '../lists/weight-simple/TokenWeightSimpleList';
import PageContent from '../page-content/PageContent';

import './CalculationResult.less';

export interface Props {
  portfolioManager: PortfolioManager;
  rebalanceResult: RebalanceResult;
  showCharts: boolean;
  showEditButton: boolean;
  showArbitrageInfo: boolean;
  toolTipExchangeAmountVisibility: boolean;
  toolTipRebalancePeriodVisibility: boolean;
  toolTipCommissionVisibility: boolean;
  toolTipRebalanceDiffPercentVisibility: boolean;

  onBackClick(): void;

  onResetClick(): void;

  onPortfolioSaveClick(portfolio: Portfolio): void;

  onSwitchChartsChange(checked: boolean): void;
}

export interface State {
  emailForSaveResult: string | undefined;
  showCharts: boolean;
  showPopoverSave: boolean;
  tokensHistory: Map<string, TokenPriceHistory[]>;
}

export class CalculationResult extends React.Component<Props, State> {

  private refsElements: { chart?: HTMLDivElement | null; } = {};
  private chartsAlreadyPrepared: boolean = false;

  constructor(props: Props, context: any) {
    super(props, context);

    this.state = {
      emailForSaveResult: undefined,
      showCharts: false,
      showPopoverSave: false,
      tokensHistory: props.portfolioManager.getPriceHistory(),
    };
  }

  public render(): React.ReactNode {
    const {portfolioManager, rebalanceResult} = this.props;

    return (
      <div>
        <PageContent className="CalculationResult__content">

          <Tooltip title={this.getTooltipInfo()} placement={'rightTop'} defaultVisible={true}>
            <img src={IcoInfo} alt={'i'} className="CalculationResult__content-info"/>
          </Tooltip>

          <div
            className="CalculationResult__content-text-caption"
            style={{
              display: portfolioManager.getTokenType() === TokenType.FIX_PROPORTIONS
                ? 'none'
                : 'block',
            }}
          >
            The results of the portfolio with rebalancing
          </div>
          <div
            className="CalculationResult__content-block-profit"
            style={{
              display: portfolioManager.getTokenType() === TokenType.FIX_PROPORTIONS
                ? 'none'
                : 'block',
            }}
          >
            <Row>
              <Col span={8} className="CalculationResult__content-text-title">
                Portfolio capitalization:
              </Col>
              <Col span={8} className="CalculationResult__content-text-title">
                Profit for the period:
              </Col>
              <Col span={8} className="CalculationResult__content-text-title">
                ROI {rebalanceResult.calcCountDays()} days / ROI annual:
              </Col>
            </Row>
            <Row>
              <Col
                span={8}
                className={
                  'CalculationResult__content-text-result_big' + this.getModif(rebalanceResult.profitWithRebalance())
                }
              >
                ${rebalanceResult.capWithRebalance()}
              </Col>
              <Col
                span={8}
                className={
                  'CalculationResult__content-text-result_big' + this.getModif(rebalanceResult.profitWithRebalance())
                }
              >
                ${rebalanceResult.profitWithRebalance()}
              </Col>
              <Col
                span={8}
                className={
                  'CalculationResult__content-text-result_big' +
                  this.getModif(rebalanceResult.roiWithRebalance())
                }>
                {rebalanceResult.roiWithRebalance()}% / {rebalanceResult.roiYearWithRebalance()}%
              </Col>
            </Row>
          </div>

          {/*----------3------------*/}

          <div className="CalculationResult__content-text-caption">
            The results of the portfolio without rebalancing
          </div>
          <div className="CalculationResult__content-block">
            <Row>
              <Col span={8} className="CalculationResult__content-text-title">
                Portfolio capitalization:
              </Col>
              <Col span={8} className="CalculationResult__content-text-title">
                Profit for the period:
              </Col>
              <Col span={8} className="CalculationResult__content-text-title">
                ROI {rebalanceResult.calcCountDays()} days / ROI annual:
              </Col>
            </Row>
            <Row>
              <Col
                span={8}
                className={
                  'CalculationResult__content-text-result' + this.getModif(rebalanceResult.profitWithoutRebalance())
                }
              >
                ${rebalanceResult.capWithoutRebalance()}
              </Col>
              <Col
                span={8}
                className={
                  'CalculationResult__content-text-result' + this.getModif(rebalanceResult.profitWithoutRebalance())
                }
              >
                ${rebalanceResult.profitWithoutRebalance()}
              </Col>
              <Col
                span={8}
                className={
                  'CalculationResult__content-text-result' +
                  this.getModif(rebalanceResult.roiWithoutRebalance())
                }
              >
                {rebalanceResult.roiWithoutRebalance()}%
                / {rebalanceResult.roiYearWithoutRebalance()}%
              </Col>
            </Row>
          </div>

          {/*----------4------------*/}

          <div className="CalculationResult__content-text-caption">
            Portfolio Bitcoin only
            <br/>(It shows investor will get by investing in bitcoin the same amount of cash)
          </div>
          <div className="CalculationResult__content-block">
            <Row>
              <Col span={8} className="CalculationResult__content-text-title">
                Portfolio capitalization:
              </Col>
              <Col span={8} className="CalculationResult__content-text-title">
                Profit for the period:
              </Col>
              <Col span={8} className="CalculationResult__content-text-title">
                ROI {rebalanceResult.calcCountDays()} days / ROI annual:
              </Col>
            </Row>
            <Row>
              <Col span={8} className="CalculationResult__content-text-result">
                ${rebalanceResult.capBtc()}
              </Col>
              <Col
                span={8}
                className={'CalculationResult__content-text-result' + this.getModif(rebalanceResult.profitBtc())}
              >
                ${rebalanceResult.profitBtc()}
              </Col>
              <Col
                span={8}
                className={'CalculationResult__content-text-result' + this.getModif(rebalanceResult.profitPercentBtc())}
              >
                {rebalanceResult.profitPercentBtc()}% / {rebalanceResult.profitPercentYearBtc()}%
              </Col>
            </Row>
          </div>

          <div className="CalculationResult__content-text-caption">
            Calculation date range
          </div>
          <div className="CalculationResult__content-block">
            <Row>
              <Col span={12} className="CalculationResult__content-text-title">
                start date:
              </Col>
              <Col span={12} className="CalculationResult__content-text-title">
                end date:
              </Col>
            </Row>
            <Row>
              <Col span={12} className="CalculationResult__content-text-result">
                {new Date(portfolioManager.getCalculationTimestamp()[0]).toDateString()}
              </Col>
              <Col span={12} className="CalculationResult__content-text-result">
                {new Date(portfolioManager.getCalculationTimestamp()[1]).toDateString()}
              </Col>
            </Row>
          </div>

          {/*------------5-----------*/}

          <div style={{display: this.props.showArbitrageInfo ? 'block' : 'none'}}>
            <div
              className="CalculationResult__content-text-caption"
              style={{
                display: portfolioManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
              }}
            >
              Arbitrage transactions
            </div>
            <div
              className="CalculationResult__content-block"
              style={{
                display: portfolioManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
              }}
            >
              <Row>
                <Col span={8} className="CalculationResult__content-text-title">
                  Transactions count:
                </Col>
                <Col span={8} className="CalculationResult__content-text-title">
                  Total Ethereum fee:
                </Col>
                <Col span={8} className="CalculationResult__content-text-title">
                  Average Ethereum fee:
                </Col>
              </Row>
              <Row>
                <Col span={8} className="CalculationResult__content-text-result">
                  {rebalanceResult.getArbitrageListLen()}
                </Col>
                <Col span={8} className="CalculationResult__content-text-result">
                  ${rebalanceResult.totalEthFee()}
                </Col>
                <Col span={8} className="CalculationResult__content-text-result">
                  ${rebalanceResult.avgEthFee()}
                </Col>
              </Row>
            </div>

            {/*-----------------------*/}

            <div
              className="CalculationResult__content-block"
              style={{
                display: portfolioManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
                marginLeft: '32.45%',
              }}
            >
              <Row
                style={{
                  display: portfolioManager.getTokenType() !== TokenType.AUTO_REBALANCE ? 'none' : 'block',
                }}
              >
                <Col span={12}>
                  <div className="CalculationResult__content-text-title">
                    Total arbitrage profit:
                  </div>
                  <div className="CalculationResult__content-text-result">
                    ${rebalanceResult.totalArbiterProfit()}
                  </div>
                </Col>

                <Col span={12}>
                  <div className="CalculationResult__content-text-title">
                    The average arbitrage profit:
                  </div>
                  <div className="CalculationResult__content-text-result">
                    ${rebalanceResult.avgArbiterProfit()}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          {/*-----------------------*/}

          <div style={{textAlign: 'center', margin: '20px'}}>
            {this.prepareButtonEdit()}
            <Button
              type="primary"
              onClick={() => this.props.onResetClick()}
            >
              Start new
            </Button>

            {this.prepareButtonSave()}

            {this.prepareSwitchCharts()}
          </div>
        </PageContent>

        {this.prepareChartsComponents()}
      </div>
    );
  }

  private validateEmail(email: string): boolean {
    // tslint:disable:max-line-length
    const reg: RegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    return reg.test(String(email).toLowerCase());
  }

  private prepareButtonEdit(): React.ReactNode {
    if (!this.props.showEditButton) {
      return null;
    }
    return (
      <span>
          <Button
            type="primary"
            onClick={() => this.props.onBackClick()}
          >
            Edit options
          </Button>
          <span className="m-2"/>
      </span>
    );
  }

  private prepareButtonSave(): React.ReactNode {
    if (!this.props.showEditButton) {
      return null;
    }
    return (
      <span>
        <span className="m-2"/>
        <Popover
          content={this.prepareContentSaveResult()}
          trigger="click"
          visible={this.state.showPopoverSave}
          onVisibleChange={() => this.setState({showPopoverSave: true})}
        >
        <Button
          type="primary">
          Save result
        </Button>
        </Popover>
      </span>
    );
  }

  private prepareContentSaveResult(): React.ReactNode {
    return (
      <div>
        <div>
          <Input
            onPressEnter={() => {
              if (this.validateEmail(String(this.state.emailForSaveResult))) {
                this.onSavePortfolioClick();
              }
            }}
            value={this.state.emailForSaveResult}
            onChange={(e) => this.setState({emailForSaveResult: e.target.value})}
            placeholder="Email"
            style={{width: '100%'}}
          />

        </div>
        <span
          className="button-simple"
          onClick={() => {
            this.setState({showPopoverSave: false});
          }}>
          Cancel
        </span>
        <span
          className={`button-simple${this.validateEmail(String(this.state.emailForSaveResult)) ? '' : '-disabled'}`}
          onClick={() => this.onSavePortfolioClick()}>
          Save
        </span>
      </div>
    );
  }

  private onSavePortfolioClick(): void {
    const portfolio: Portfolio = this.props.rebalanceResult.getPortfolio();
    portfolio.email = String(this.state.emailForSaveResult);

    this.props.onPortfolioSaveClick(portfolio);
    this.setState({showPopoverSave: false});
  }

  private prepareSwitchCharts(): React.ReactNode {
    if (!this.props.showCharts) {
      return null;
    }

    return (
      <div className="CalculationResult__content-switch-block">
        <span className="CalculationResult__content-switch-block-text">Show Charts</span>
        <Switch
          onChange={checked => {
            this.props.onSwitchChartsChange(checked);
            setTimeout(
              () => {
                this.setState({showCharts: checked});
              },
              1000
            );
          }}
        />
      </div>
    );
  }

  private prepareChartsComponents(): any {
    if (!this.state.showCharts && !this.chartsAlreadyPrepared) {
      return null;
    }
    this.chartsAlreadyPrepared = true;

    const {portfolioManager, rebalanceResult} = this.props;

    return (
      <div style={{overflow: 'hidden', height: this.chartsAlreadyPrepared && !this.state.showCharts ? '0' : '100%'}}>
        <PageContent className="CalculationResult__content">
          <div ref={(div) => this.refsElements.chart = div} className="CalculationResult__result-chart">
            <span className="CalculationResult__result-chart-title">Currency price history $:</span>
            <HistoryChart
              data={this.state.tokensHistory}
              colors={TokensHelper.COLORS}
              timeStep={portfolioManager.getStepSec()}
              isDebugMode={false}
              start={portfolioManager.getCalculationDateIndex()[0]}
              end={portfolioManager.getCalculationDateIndex()[1]}
              showRange={false}
              showLegendCheckBox={true}
            />
          </div>
        </PageContent>

        <PageContent className="CalculationResult__content">
          <div className="CalculationResult__result-chart">
        <span className="CalculationResult__result-chart-title">
        Portfolio capitalization:
        </span>
            <BalancesCapChart
              showRebalanceCap={portfolioManager.getTokenType() !== TokenType.FIX_PROPORTIONS}
              isDebugMode={false}
              applyScale={true}
              data={rebalanceResult.getRebalanceHistory().rebalanceValues}
              colors={TokensHelper.COLORS}
              showRange={false}
              showLegendCheckBox={true}
            />
          </div>
        </PageContent>
        {this.scrollToCharts()}
      </div>
    );
  }

  private getModif(value: string): string {
    const numb: number = parseFloat(value.replace(' ', ''));
    if (numb > 0) {
      return '_success';

    } else if (numb === 0) {
      return '';
    }

    return '_warn';
  }

  private getTooltipInfo(): React.ReactNode {
    return (
      <div className="CalculationResult__tooltip">
        <div className="CalculationResult__tooltip_title">{this.getTitleOfType()}</div>
        <div className="CalculationResult__tooltip_param">
        <span className="CalculationResult__tooltip_param_name">
        Amount of money:
        </span>
          <span className="CalculationResult__tooltip_param_value">
        $ {this.props.portfolioManager.getAmount().toLocaleString()}
        </span>
        </div>
        {this.getRebalancePeriod()}
        {this.getRebalanceDiffPercent()}
        {this.getExchangeAmount()}
        {this.getCommissionPercent()}
        {this.getTokensProportions()}
        {this.getManualRebalanceList()}
      </div>
    );
  }

  private getTitleOfType(): string {
    const tokenType: TokenType = this.props.portfolioManager.getTokenType();

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

  private getCommissionPercent(): React.ReactNode {
    const manager: PortfolioManager = this.props.portfolioManager;

    if (this.props.toolTipCommissionVisibility) {
      return (
        <div>
          <div className="CalculationResult__tooltip_param">
        <span className="CalculationResult__tooltip_param_name">
        Commission percent:
        </span>
            <span className="CalculationResult__tooltip_param_value">
        {manager.getCommission().toLocaleString()}%
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getExchangeAmount(): React.ReactNode {
    if (this.props.toolTipExchangeAmountVisibility) {
      return (
        <div>
          <div className="CalculationResult__tooltip_param">
        <span className="CalculationResult__tooltip_param_name">
        Exchange amount:
        </span>
            <span className="CalculationResult__tooltip_param_value">
        $ {this.props.portfolioManager.getExchangeAmount().toLocaleString()}
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getRebalancePeriod(): React.ReactNode {
    if (this.props.toolTipRebalancePeriodVisibility) {
      return (
        <div>
          <div className="CalculationResult__tooltip_param">
        <span className="CalculationResult__tooltip_param_name">
        Rebalance period:
        </span>
            <span className="CalculationResult__tooltip_param_value">
        {this.getRebalanceByPeriod(this.props.portfolioManager.getRebalancePeriod())}
        </span>
          </div>
        </div>
      );
    }

    return '';
  }

  private getRebalanceDiffPercent(): React.ReactNode {
    if (this.props.toolTipRebalanceDiffPercentVisibility) {
      return (
        <div>
          <div className="CalculationResult__tooltip_param">
        <span className="CalculationResult__tooltip_param_name">
        Rebalance diff:
        </span>
            <span className="CalculationResult__tooltip_param_value">
        {this.props.portfolioManager.getRebalanceDiffPercent()}%
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

  private getTokensProportions(): React.ReactNode {
    return this.props.portfolioManager.getProportions().map(value => {
      return (
        <div key={value.name}>
          <div className="CalculationResult__tooltip_param">
        <span className="CalculationResult__tooltip_param_name">
        {value.name} weight:
        </span>
            <span className="CalculationResult__tooltip_param_value">
        {value.weight}
        </span>
          </div>
        </div>
      );
    });
  }

  private getManualRebalanceList(): React.ReactNode {
    if (this.props.portfolioManager.getTokenType() === TokenType.MANUAL_REBALANCE) {
      return <TokenWeightSimpleList
        data={this.props.portfolioManager.getRebalanceWeights()}
      />;
    }
    return '';
  }

  private scrollToCharts() {
    if (!this.state.showCharts) {
      return;
    }

    setTimeout(
      () => {
        if (this.refsElements.chart) {
          const chart = ReactDOM.findDOMNode(this.refsElements.chart);
          if (chart !== null) {
            (chart as HTMLDivElement).scrollIntoView({block: 'center', behavior: 'smooth'});
          }
        } else {
          this.scrollToCharts();
        }
      }
      ,
      500);
  }

}
