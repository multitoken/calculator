import { Col, Row } from 'antd';
import * as React from 'react';
import { CoinItemEntity } from '../../entities/CoinItemEntity';
import { ScreenSizes, ScreenUtils } from '../../utils/ScreenUtils';
import BlockContent from '../block-content/BlockContent';
import StepInteger from '../step-integer/StepInteger';
import './CoinsProportions.less';

export interface Props {
  coins: CoinItemEntity[];
  disabled: boolean;
  isEditMode?: boolean;
  maxWeight: number;

  onChangeProportion(name: string, value: number, position: number): void;
}

export class CoinsProportions extends React.Component<Props, {}> {

  public render(): React.ReactNode {
    return (
      <BlockContent className="CoinsProportions__content">
        {this.getHeadresByMode()}
        {this.prepareItems()}
      </BlockContent>
    );
  }

  private getHeadresByMode(): React.ReactNode {
    if (this.props.isEditMode) {
      return (
        <Row className="CoinsProportions__content__header">
          <Col span={6}/>
          <Col span={11} className="CoinsProportions">
            Actual
          </Col>
        </Row>
      );
    }

    return (
      <Row className="CoinsProportions__content__header" type="flex" justify="end">
        <Col span={6}/>
        <Col span={6} className="CoinsProportions">
          Actual(%)
        </Col>
        <Col span={6} className="CoinsProportions">
          Actual
        </Col>
        <Col span={6} className="CoinsProportions">
          Difference
        </Col>
      </Row>
    );
  }

  private prepareItems(): React.ReactNode[] {
    return this.props.coins.map((coin, index) => {
      return this.props.isEditMode ? this.getEditModeItem(coin, index) : this.getNormalModeItem(coin, index);
    });
  }

  private getNormalModeItem(coin: CoinItemEntity, position: number): React.ReactNode {
    return (
      <Row key={coin.name}>
        <Col span={6}>
          <img className="CoinsProportions-item__icon" src={coin.getIcon()}/>
          <div className="CoinsProportions-item__name">{coin.name}</div>
          <div className="CoinsProportions-item__price">$ {coin.price}</div>
        </Col>
        <Col span={6} className="CoinsProportions-item__proportion-percents__block">
          <div className="CoinsProportions-item__proportion-percents">{coin.proportionPercents}%</div>
        </Col>
        <Col span={6}>
          <div className="CoinsProportions-item__proportion-value">{coin.count} {coin.symbol.toUpperCase()}</div>
          {this.getDiffPercentsInline(coin)}
        </Col>
        {this.getDiffPercents(coin)}
        {this.getSeparator(position)}
      </Row>
    );
  }

  private getDiffPercentsInline(coin: CoinItemEntity): React.ReactNode {
    if (ScreenUtils.viewPortWidth >= ScreenSizes.MD) {
      return null;
    }

    return (
      <div
        className={
          `CoinsProportions-item__diff
              CoinsProportions-item__diff_${coin.priceDiffPercents > 0 ? 'green' : 'red'}`
        }>
        {coin.priceDiffPercents}%
      </div>
    );
  }

  private getDiffPercents(coin: CoinItemEntity): React.ReactNode {
    if (ScreenUtils.viewPortWidth < ScreenSizes.MD) {
      return null;
    }

    return (
      <Col span={6}>
        <div
          className={
            `CoinsProportions-item__diff
              CoinsProportions-item__diff_${coin.priceDiffPercents > 0 ? 'green' : 'red'}`
          }>
          {coin.priceDiffPercents}%
        </div>
      </Col>
    );
  }

  private getEditModeItem(coin: CoinItemEntity, position: number): React.ReactNode {
    return (
      <Row key={coin.name}>
        <Col span={6}>
          <img className="CoinsProportions-item__icon" src={coin.getIcon()}/>
          <div className="CoinsProportions-item__name">{coin.name}</div>
          <div className="CoinsProportions-item__price">$ {coin.price}</div>
        </Col>
        <Col span={11}>
          <span className="CoinsProportions-item__percents">{coin.proportionPercents}%</span>
          <div className="CoinsProportions-item__slider">
            <StepInteger
              disabled={this.props.disabled}
              max={this.props.maxWeight}
              min={1}
              tipFormatter={() => `${coin.proportionPercents}%`}
              defaultValue={coin.weight}
              onChange={value => {
                this.props.onChangeProportion(coin.name, value, position);
              }}
            />
          </div>
        </Col>
        {this.getSeparator(position)}
      </Row>
    );
  }

  private getSeparator(position: number): React.ReactNode {
    if (position >= this.props.coins.length - 1) {
      return null;
    }

    return <div className="CoinsProportions-item__separator"/>;
  }
}
