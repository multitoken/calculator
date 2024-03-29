import { Button, Col, Modal, Row, Select, Slider } from 'antd';
import * as React from 'react';
import Pair from '../../repository/models/Pair';
import { Token } from '../../repository/models/Token';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';
import { ScreenSizes, ScreenUtils } from '../../utils/ScreenUtils';
import './TokenWeightDialog.less';

const Option = Select.Option;
const ButtonGroup = Button.Group;

export interface Properties {
  openDialog: boolean;
  dateList: number[];
  maxWeight: number;
  rangeDateIndex: [number, number];
  tokenNames: string[];
  tokenWeights: Map<string, number>;
  editTokenWeights?: TokenWeight | undefined;

  onCancel(): void;

  onOkClick(tokenWeight: TokenWeight, oldModel: TokenWeight | undefined): void;
}

export interface State {
  selectedDateIndex: number;
  selectedTokenFirst: string;
  selectedTokenSecond: string;
  selectedWeightFirst: number;
  selectedWeightSecond: number;
}

export class TokenWeightDialog extends React.Component<Properties, State> {

  constructor(props: Properties, context: any) {
    super(props, context);

    const tokenNameFirst: string = this.props.tokenNames.length > 0 ? this.props.tokenNames[0] : '';
    const tokenNameSecond: string = this.props.tokenNames.length > 1 ? this.props.tokenNames[1] : '';

    this.state = {
      selectedDateIndex: this.props.rangeDateIndex[0],
      selectedTokenFirst: tokenNameFirst,
      selectedTokenSecond: tokenNameSecond,
      selectedWeightFirst: this.props.tokenWeights.get(tokenNameFirst) || 1,
      selectedWeightSecond: this.props.tokenWeights.get(tokenNameSecond) || 1,
    };
  }

  public componentDidUpdate(prevProps: Readonly<Properties>, prevState: Readonly<State>, snapshot?: any): void {
    let tokenNameFirst: string;
    let tokenNameSecond: string;
    let tokenWeightFirst: number;
    let tokenWeightSecond: number;

    let prevStateUpdated: boolean;

    if (this.props.editTokenWeights !== undefined) {
      tokenNameFirst = this.props.editTokenWeights.tokens.first.name;
      tokenNameSecond = this.props.editTokenWeights.tokens.second.name;
      tokenWeightFirst = this.props.editTokenWeights.tokens.first.weight;
      tokenWeightSecond = this.props.editTokenWeights.tokens.second.weight;
      prevStateUpdated = !this.props.editTokenWeights.equals(prevProps.editTokenWeights);

    } else {
      tokenNameFirst = this.props.tokenNames.length > 0 ? this.props.tokenNames[0] : '';
      tokenNameSecond = this.props.tokenNames.length > 1 ? this.props.tokenNames[1] : '';
      tokenWeightFirst = this.props.tokenWeights.get(tokenNameFirst) || 1;
      tokenWeightSecond = this.props.tokenWeights.get(tokenNameSecond) || 1;
      prevStateUpdated = (
        prevState.selectedDateIndex !== this.props.rangeDateIndex[0] ||
        prevState.selectedTokenFirst !== tokenNameFirst ||
        prevState.selectedTokenSecond !== tokenNameSecond ||
        prevState.selectedWeightFirst !== tokenWeightFirst ||
        prevState.selectedWeightSecond !== tokenWeightSecond
      );
    }

    if (this.props.openDialog && !prevProps.openDialog && prevStateUpdated) {
      this.setState({
        selectedDateIndex: this.props.rangeDateIndex[0],
        selectedTokenFirst: tokenNameFirst,
        selectedTokenSecond: tokenNameSecond,
        selectedWeightFirst: tokenWeightFirst,
        selectedWeightSecond: tokenWeightSecond,
      });
    }
  }

  public render() {
    return (
      <div>
        <Modal
          className="TokenWeightDialog__modal"
          title="Exchange token weight"
          visible={this.props.openDialog}
          destroyOnClose={true}
          footer={this.getFooter()}
          onOk={() => this.onOkClick()}
          onCancel={() => this.onCancelClick()}
        >
          <div className="TokenWeightDialog__content">
            {this.prepareConfiguration()}
            {this.prepareBlockChangeDate()}
          </div>
        </Modal>
      </div>
    );
  }

  private getFooter(): React.ReactNode {
    if (ScreenUtils.viewPortWidth() >= ScreenSizes.MD) {
      return [
        <Button key="Cancel" onClick={() => this.onCancelClick()}>Cancel</Button>,
        <Button key="Ok" type="primary" onClick={() => this.onOkClick()}>Ok</Button>
      ];
    }

    return (
      <div>
        <Button key="Ok" type="primary" onClick={() => this.onOkClick()}>Ok</Button>
        <div className="TokenWeightDialog__content__footer__button-cancel">
          <Button key="Cancel" onClick={() => this.onCancelClick()}>Cancel</Button>
        </div>
      </div>
    );
  }

  private onOkClick(): void {
    const tokens: Token[] = [];
    this.props.tokenWeights.forEach((value, key) => {
      if (key !== this.state.selectedTokenFirst && key !== this.state.selectedTokenSecond) {
        tokens.push(new Token(key, value));
      }
    });

    this.props.onOkClick(
      new TokenWeight(
        new Pair(
          new Token(this.state.selectedTokenFirst, this.state.selectedWeightFirst),
          new Token(this.state.selectedTokenSecond, this.state.selectedWeightSecond)
        ),
        tokens,
        this.props.dateList[this.state.selectedDateIndex],
        this.state.selectedDateIndex
      ),
      this.props.editTokenWeights
    );
  }

  private onCancelClick(): void {
    this.props.onCancel();
  }

  private prepareConfiguration(): React.ReactNode {
    return ScreenUtils.viewPortWidth() < ScreenSizes.MD ? this.getSmallConfiguration() : this.getNormalConfiguration();
  }

  private getSmallConfiguration(): React.ReactNode {
    return (
      <div>
        <div>
          <div className="TokenWeightDialog__content-text">Token name:</div>
          <Select
            onChange={value => this.onFirstTokenChange(value.toString())}
            value={this.state.selectedTokenFirst}
          >
            {this.prepareTokenNames()}
          </Select>

        </div>
        <div className="TokenWeightDialog__content-text">Weight: {this.state.selectedWeightFirst}</div>

        <div>
          <ButtonGroup>
            <Button
              type="primary"
              icon="up"
              size="small"
              onClick={() => this.onExchangeFromSecond()}
            />
            <Button
              type="primary"
              icon="down"
              size="small"
              onClick={() => this.onExchangeFromFirst()}
            />
          </ButtonGroup>
        </div>
        <div>
          <div className="TokenWeightDialog__content-text">Token name:</div>
          <Select
            onChange={value => this.onSecondTokenChange(value.toString())}
            value={this.state.selectedTokenSecond}
          >
            {this.prepareTokenNames()}
          </Select>

          <div className="TokenWeightDialog__content-text">Weight: {this.state.selectedWeightSecond}</div>
        </div>
      </div>
    );
  }

  private getNormalConfiguration(): React.ReactNode {
    return (
      <Row gutter={8} type="flex" justify="space-around" align="middle">
        <Col span={8}>
          <div>
            <div className="TokenWeightDialog__content-text">Token name:</div>
            <Select
              onChange={value => this.onFirstTokenChange(value.toString())}
              value={this.state.selectedTokenFirst}
            >
              {this.prepareTokenNames()}
            </Select>

          </div>
          <div className="TokenWeightDialog__content-text">Weight: {this.state.selectedWeightFirst}</div>
        </Col>

        <Col span={8}>
          <ButtonGroup>
            <Button
              type="primary"
              icon="left"
              size="small"
              onClick={() => this.onExchangeFromSecond()}
            />
            <Button
              type="primary"
              icon="right"
              size="small"
              onClick={() => this.onExchangeFromFirst()}
            />
          </ButtonGroup>
        </Col>
        <Col span={8}>
          <div className="TokenWeightDialog__content-text">Token name:</div>
          <Select
            onChange={value => this.onSecondTokenChange(value.toString())}
            value={this.state.selectedTokenSecond}
          >
            {this.prepareTokenNames()}
          </Select>

          <div className="TokenWeightDialog__content-text">Weight: {this.state.selectedWeightSecond}</div>
        </Col>
      </Row>
    );
  }

  private onExchangeFromFirst(): void {
    if (this.state.selectedWeightFirst > 1) {
      this.setState({
        selectedWeightFirst: this.state.selectedWeightFirst - 1,
        selectedWeightSecond: this.state.selectedWeightSecond + 1,
      });
    }
  }

  private onExchangeFromSecond(): void {
    if (this.state.selectedWeightSecond > 1) {
      this.setState({
        selectedWeightFirst: this.state.selectedWeightFirst + 1,
        selectedWeightSecond: this.state.selectedWeightSecond - 1,
      });
    }
  }

  private onFirstTokenChange(name: string) {
    if (name === this.state.selectedTokenSecond) {
      return;
    }

    const {tokenWeights} = this.props;
    this.setState({
      selectedTokenFirst: name,
      selectedWeightFirst: tokenWeights.get(name) || 1,
      selectedWeightSecond: tokenWeights.get(this.state.selectedTokenSecond) || 1,
    });
  }

  private onSecondTokenChange(name: string) {
    if (name === this.state.selectedTokenFirst) {
      return;
    }

    const {tokenWeights} = this.props;
    this.setState({
      selectedTokenSecond: name,
      selectedWeightFirst: tokenWeights.get(this.state.selectedTokenFirst) || 1,
      selectedWeightSecond: tokenWeights.get(name) || 1
    });
  }

  private prepareBlockChangeDate(): any {
    return (
      <div>
        <div>
          <span className="TokenWeightDialog__content-text-date">Date:</span>
          <span className="TokenWeightDialog__content-text-date-value">
            {DateUtils.toFormat(this.props.dateList[this.state.selectedDateIndex], DateUtils.DATE_FORMAT_SHORT)}
          </span>
        </div>
        <Slider
          disabled={this.props.editTokenWeights !== undefined}
          className="TokenWeightDialog__content-date-slider"
          max={this.props.dateList.length - 1}
          value={this.state.selectedDateIndex}
          tipFormatter={(value) => this.formatter(value)}
          onChange={value =>
            this.setState({
              selectedDateIndex:
                Math.min(this.props.rangeDateIndex[1], Math.max(this.props.rangeDateIndex[0], value as number))
            })
          }
        />
      </div>
    );
  }

  private formatter(value: number): string {
    return DateUtils.toFormat(this.props.dateList[value], DateUtils.DATE_FORMAT_SHORT);
  }

  private prepareTokenNames(): any {
    return this.props.tokenNames.map(name => <Option key={name}>{name}</Option>);
  }

}
