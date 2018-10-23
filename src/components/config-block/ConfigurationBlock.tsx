import { Select } from 'antd';
import * as React from 'react';
import NumberFormat from 'react-number-format';
import BlockContent from '../block-content/BlockContent';
import './ConfigurationBlock.less';

const Option = Select.Option;

export interface Props {
  amount: number;
  exchangeAmount: number;
  commission: number;
  diffPercentExchange: number;
  rebalancePeriod: number;

  exchangeAmountVisibility: boolean;
  commissionVisibility: boolean;
  diffPercentExchangeVisibility: boolean;
  rebalancePeriodVisibility: boolean;

  onAmountChange (amount: number): void;

  onExchangeAmountChange(exchangeAmount: number): void;

  onCommissionChange(commission: number): void;

  onDiffPercentExchangeChange(percent: number): void;

  onPeriodChange(period: number): void;
}

export class ConfigurationBlock extends React.Component<Props, {}> {

  private static readonly REBALANCE_PERIOD: Map<string, number> = new Map([
    ['HOUR', 3600],
    ['DAY', 86400],
    ['WEEK', 604800],
    ['MONTH', 2592000]
  ]);

  public render(): React.ReactNode {
    return (
      <BlockContent className="ConfigurationBlock__content">
        {/*-------------------------------*/}
        <div className="ConfigurationBlock__content__item">
          <div className="ConfigurationBlock__content__item__title">Deposit:&nbsp;</div>
          <NumberFormat
            value={this.props.amount}
            thousandSeparator={true}
            prefix={'$ '}
            allowNegative={false}
            onValueChange={value => this.onAmountChange(value.floatValue)}
          />
        </div>

        {/*----------------------------------*/}
        <div
          className="ConfigurationBlock__content__item"
          style={{display: this.props.rebalancePeriodVisibility ? 'block' : 'none'}}
        >
          <div className="ConfigurationBlock__content__item__title">Rebalance every:&nbsp;</div>
          <Select
            onChange={value => this.onRebalancePeriodChange(value.toString())}
            value={this.getPeriodByValue(this.props.rebalancePeriod)}
          >
            {this.preparePeriodValues()}
          </Select>
        </div>

        {/*---------------------------------------*/}
        <div
          className="ConfigurationBlock__content__item"
          style={{display: this.props.exchangeAmountVisibility ? 'block' : 'none'}}
        >
          <div className="ConfigurationBlock__content__item__title">Exchange Amount / day:&nbsp;</div>
          <NumberFormat
            value={this.props.exchangeAmount}
            thousandSeparator={true}
            prefix={'$ '}
            allowNegative={false}
            onValueChange={(value) => this.onExchangeAmountChange(value.floatValue)}
          />
        </div>

        {/*--------------------------*/}
        <div
          className="ConfigurationBlock__content__item"
          style={{display: this.props.commissionVisibility ? 'block' : 'none'}}
        >
          <div className="ConfigurationBlock__content__item__title">
            Commission percents:&nbsp;
          </div>
          <NumberFormat
            value={this.props.commission}
            thousandSeparator={true}
            suffix={'%'}
            allowNegative={false}
            onValueChange={value => this.onCommissionChange(value.floatValue)}
          />
        </div>

        {/*-----------------------*/}
        <div
          className="ConfigurationBlock__content__item"
          style={{display: this.props.diffPercentExchangeVisibility ? 'block' : 'none'}}
        >
          <div className="ConfigurationBlock__content__item__title">
            Diff percent rebalance:&nbsp;
          </div>
          <NumberFormat
            value={this.props.diffPercentExchange}
            thousandSeparator={true}
            suffix={'%'}
            allowNegative={false}
            onValueChange={(value) => this.onRebalanceDiffPercentChange(value.floatValue)}
          />
        </div>
      </BlockContent>
    );
  }

  private onAmountChange(value: number): void {
    value = Math.min(100000000, isNaN(value) ? 0 : value);

    if (value > 0) {
      this.props.onAmountChange(value);
      this.props.onExchangeAmountChange(Math.min(value, this.props.exchangeAmount));
    }
  }

  private onExchangeAmountChange(value: number): void {
    this.props.onExchangeAmountChange(Math.min(this.props.amount, value));
  }

  private onCommissionChange(value: number): void {
    let valueNumber = Math.max(0.0, Math.min(99.99, Number(value)));
    valueNumber = isNaN(valueNumber) ? 0.0 : valueNumber;

    if (valueNumber > 0) {
      this.props.onCommissionChange(valueNumber);
    }
  }

  private onRebalanceDiffPercentChange(value: number): void {
    let valueNumber = Math.max(0.01, Math.min(100, value)) || 0;
    valueNumber = isNaN(valueNumber) ? 0.01 : valueNumber;

    if (value > 0) {
      this.props.onDiffPercentExchangeChange(valueNumber);
    }
  }

  private preparePeriodValues(): React.ReactNode {
    const periods: string[] = Array.from(ConfigurationBlock.REBALANCE_PERIOD.keys());

    return periods.map(name => <Option key={name}>{name}</Option>);
  }

  private getPeriodByValue(value: number): string {
    for (const [name, period] of ConfigurationBlock.REBALANCE_PERIOD) {
      if (period === Number(value)) {
        return name;
      }
    }

    return 'undefined';
  }

  private onRebalancePeriodChange(period: string): void {
    const periodValue: number = ConfigurationBlock.REBALANCE_PERIOD.get(period) || 0;
    if (periodValue > 0) {
      this.props.onPeriodChange(periodValue);
    }
  }

}
