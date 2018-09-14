import { Button, Col, Row } from 'antd';
import * as React from 'react';
import { PortfolioManager } from '../../manager/multitoken/PortfolioManager';
import { RebalanceResult } from '../../manager/multitoken/RebalanceResult';
import PageContent from '../page-content/PageContent';
import './CompareCalculationResult.less';

export interface Properties {
  rebalanceResult: RebalanceResult[];
  portfolioManager: PortfolioManager[];

  onResetClick(): void;
}

export class CompareCalculationResult extends React.Component<Properties, any> {

  public render(): React.ReactNode {
    return (
      <div>
        <PageContent className="CompareCalculationResult__content">
          <Row>
            <Col span={8}>
              Coins:
            </Col>
            {this.getCoins()}
          </Row>
          <Row>
            <Col span={8}>
              Amount:
            </Col>
            {this.getAmounts()}
          </Row>
          <Row>
            <Col span={8}>
              Proportions:
            </Col>
            {this.getProportions()}
          </Row>
          <Row>
            <Col span={8}>
              Commission Percent:
            </Col>
            {this.getCommissionPercents()}
          </Row>
          <Row>
            <Col span={8}>
              period:
              <div>start</div>
              <div>finish</div>
              <div>days</div>
            </Col>
            {this.getDaysPeriod()}
          </Row>
          <span className="CompareCalculationResult__row-type-separator">
            The results of the portfolio with rebalancing
          </span>
          <Row>
            <Col span={8}>
              Portfolio capitalization:
            </Col>
            {this.getRebalanceCaps()}
          </Row>
          <Row>
            <Col span={8}>
              Profit for the period:
            </Col>
            {this.getRebalaceProfits()}
          </Row>
          <Row>
            <Col span={8}>
              ROI period of days / ROI annual:
            </Col>
            {this.getRebalanceROI()}
          </Row>
          <span className="CompareCalculationResult__row-type-separator">
          The results of the portfolio without rebalancing
          </span>
          <Row>
            <Col span={8}>
              Portfolio capitalization:
            </Col>
            {this.getCaps()}
          </Row>
          <Row>
            <Col span={8}>
              Profit for the period:
            </Col>
            {this.getProfits()}
          </Row>
          <Row>
            <Col span={8}>
              ROI period of days / ROI annual:
            </Col>
            {this.getROI()}
          </Row>
          <span className="CompareCalculationResult__row-type-separator">
          Portfolio Bitcoin only
          </span>
          <Row>
            <Col span={8}>
              Portfolio capitalization:
            </Col>
            {this.getBtcCaps()}
          </Row>
          <Row>
            <Col span={8}>
              Profit for the period:
            </Col>
            {this.getBtcProfits()}
          </Row>
          <Row>
            <Col span={8}>
              ROI period of days / ROI annual:
            </Col>
            {this.getBtcROI()}
          </Row>

          <div className="CompareCalculationResult__button-place">
            <Button
              type="primary"
              onClick={() => this.props.onResetClick()}
            >
              Start new
            </Button>
          </div>

        </PageContent>

      </div>
    );
  }

  private getCoins(): React.ReactNode[] {
    return this.props.portfolioManager.map((manager, index) => {
      return (
        <Col className="ant-col-5" key={index}>
          <span className="CompareCalculationResult__row-item">
          {manager.getProportions()
            .map(value => <div key={value.name}>{value.name}</div>)}
          </span>
        </Col>
      );
    });
  }

  private getAmounts(): React.ReactNode[] {
    return this.props.portfolioManager.map((manager, index) => {
      return (
        <Col className="ant-col-5" key={index}>
          ${manager.getAmount()}
        </Col>
      );
    });
  }

  private getProportions(): React.ReactNode[] {
    return this.props.portfolioManager.map((manager, index) => {
      return (
        <Col className="ant-col-5" key={index}>
          <span className="CompareCalculationResult__row-item">
          {manager.getProportions()
            .map(value => <div key={value.name}>{value.name}: {value.weight}</div>)}
          </span>
        </Col>
      );
    });
  }

  private getCommissionPercents(): React.ReactNode[] {
    return this.props.portfolioManager.map((manager, index) => {
      return (
        <Col className="ant-col-5" key={index}>
          {manager.getCommission()}%
        </Col>
      );
    });
  }

  private getDaysPeriod(): React.ReactNode[] {
    return this.props.portfolioManager.map((manager, index) => {
      const rebalanceResult: RebalanceResult = this.props.rebalanceResult[index];
      return (
        <Col className="ant-col-5" key={index}>
          <br/>
          <div>{new Date(manager.getCalculationTimestamp()[0]).toDateString()}</div>
          <div>{new Date(manager.getCalculationTimestamp()[1]).toDateString()}</div>
          <div>{rebalanceResult.calcCountDays()}</div>
        </Col>
      );
    });
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

  private getRebalanceCaps(): React.ReactNode[] {
    return this.props.rebalanceResult.map((result, index) => {
      return (
        <Col className={
          'ant-col-5 CompareCalculationResult__row-item' + this.getModif(result.capWithRebalance())
        }
             key={index}>
          ${result.capWithRebalance()}
        </Col>
      );
    });
  }

  private getRebalaceProfits(): React.ReactNode[] {
    return this.props.rebalanceResult.map((result, index) => {
      return (
        <Col className={
          'ant-col-5 CompareCalculationResult__row-item' + this.getModif(result.profitWithRebalance())
        }
             key={index}>
          ${result.profitWithRebalance()}
        </Col>
      );
    });
  }

  private getRebalanceROI(): React.ReactNode[] {
    return this.props.rebalanceResult.map((result, index) => {
      return (
        <Col className={
          'ant-col-5 CompareCalculationResult__row-item' + this.getModif(result.roiWithRebalance())
        }
             key={index}>
          {result.roiWithRebalance()} / {result.roiYearWithRebalance()}%
        </Col>
      );
    });
  }

  private getCaps(): React.ReactNode[] {
    return this.props.rebalanceResult.map((result, index) => {
      return (
        <Col className={
          'ant-col-5 CompareCalculationResult__row-item' + this.getModif(result.capWithoutRebalance())
        }
             key={index}>
          ${result.capWithoutRebalance()}
        </Col>
      );
    });
  }

  private getProfits(): React.ReactNode[] {
    return this.props.rebalanceResult.map((result, index) => {
      return (
        <Col className={
          'ant-col-5 CompareCalculationResult__row-item' + this.getModif(result.profitWithoutRebalance())
        }
             key={index}>
          ${result.profitWithoutRebalance()}
        </Col>
      );
    });
  }

  private getROI(): React.ReactNode[] {
    return this.props.rebalanceResult.map((result, index) => {
      return (
        <Col className={
          'ant-col-5 CompareCalculationResult__row-item' + this.getModif(result.roiWithoutRebalance())
        }
             key={index}>
          {result.roiWithoutRebalance()}% / {result.roiYearWithoutRebalance()}%
        </Col>
      );
    });
  }

  private getBtcCaps(): React.ReactNode[] {
    return this.props.rebalanceResult.map((result, index) => {
      return (
        <Col className={
          'ant-col-5 CompareCalculationResult__row-item' + this.getModif(result.capBtc())
        }
             key={index}>
          ${result.capBtc()}
        </Col>
      );
    });
  }

  private getBtcProfits(): React.ReactNode[] {
    return this.props.rebalanceResult.map((result, index) => {
      return (
        <Col className={
          'ant-col-5 CompareCalculationResult__row-item' + this.getModif(result.profitBtc())
        }
             key={index}>
          ${result.profitBtc()}
        </Col>
      );
    });
  }

  private getBtcROI(): React.ReactNode[] {
    return this.props.rebalanceResult.map((result, index) => {
      return (
        <Col className={
          'ant-col-5 CompareCalculationResult__row-item' + this.getModif(result.profitPercentBtc())
        }
             key={index}>
          {result.profitPercentBtc()}% / {result.profitPercentYearBtc()}%
        </Col>
      );
    });
  }

}
