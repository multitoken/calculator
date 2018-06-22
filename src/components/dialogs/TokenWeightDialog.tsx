import { Button, Col, Modal, Row, Select, Slider } from 'antd';
import * as React from 'react';
import Pair from '../../repository/models/Pair';
import { Token } from '../../repository/models/Token';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';

const Option = Select.Option;
const ButtonGroup = Button.Group;

export interface Properties {
  openDialog: boolean;
  dateList: number[];
  maxWeight: number;
  minDateIndex: number;
  tokenNames: string[];
  tokenWeights: Map<string, number>;

  onCancel(): void;

  onOkClick(tokenWeight: TokenWeight): void;
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
      selectedDateIndex: this.props.minDateIndex,
      selectedTokenFirst: tokenNameFirst,
      selectedTokenSecond: tokenNameSecond,
      selectedWeightFirst: this.props.tokenWeights.get(tokenNameFirst) || 1,
      selectedWeightSecond: this.props.tokenWeights.get(tokenNameSecond) || 1,
    };
  }

  public componentDidUpdate(prevProps: Readonly<Properties>, prevState: Readonly<State>, snapshot?: any): void {
    const tokenNameFirst: string = this.props.tokenNames.length > 0 ? this.props.tokenNames[0] : '';
    const tokenNameSecond: string = this.props.tokenNames.length > 1 ? this.props.tokenNames[1] : '';
    const tokenWeightFirst: number = this.props.tokenWeights.get(tokenNameFirst) || 1;
    const tokenWeightSecond: number = this.props.tokenWeights.get(tokenNameSecond) || 1;

    const prevStateUpdated: boolean = (
      prevState.selectedTokenFirst !== tokenNameFirst ||
      prevState.selectedTokenSecond !== tokenNameSecond ||
      prevState.selectedWeightFirst !== tokenWeightFirst ||
      prevState.selectedWeightSecond !== tokenWeightSecond
    );

    if (!prevProps.openDialog && prevStateUpdated) {

      this.setState({
        selectedDateIndex: this.props.minDateIndex,
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
          className="text-center"
          title="exchange token weight"
          visible={this.props.openDialog}
          onOk={() => {
            const tokens: Token[] = [];
            this.props.tokenWeights.forEach((value, key) => {
              if (key !== this.state.selectedTokenFirst && key !== this.state.selectedTokenSecond) {
                tokens.push(new Token(key, value));
              }
            });

            this.props.onOkClick(new TokenWeight(
              new Pair(
                new Token(this.state.selectedTokenFirst, this.state.selectedWeightFirst),
                new Token(this.state.selectedTokenSecond, this.state.selectedWeightSecond)
              ),
              tokens,
              this.props.dateList[this.state.selectedDateIndex],
              this.state.selectedDateIndex
            ));
          }}
          onCancel={() => this.props.onCancel()}
        >
          <Row gutter={8}>
            <Col span={12}>
              <div>
                <div>Token name:</div>
                <Select
                  onChange={value => this.onFirstTokenChange(value.toString())}
                  value={this.state.selectedTokenFirst}
                  style={{width: 120}}
                >
                  {this.prepareTokenNames()}
                </Select>

              </div>
              <div>Weight:<b>{this.state.selectedWeightFirst}</b></div>

            </Col>

            <Col span={12}>
              <div>Token name:</div>
              <Select
                onChange={value => this.onSecondTokenChange(value.toString())}
                value={this.state.selectedTokenSecond}
                style={{width: 120}}
              >
                {this.prepareTokenNames()}
              </Select>

              <div>Weight:<b>{this.state.selectedWeightSecond}</b></div>
            </Col>
          </Row>

          <ButtonGroup className="pb-4">
            <Button
              type="primary"
              icon="left"
              onClick={() => this.onExchangeFromSecond()}
            />
            <Button
              type="primary"
              icon="right"
              onClick={() => this.onExchangeFromFirst()}
            />
          </ButtonGroup>

          {this.prepareBlockChangeDate()}
        </Modal>
      </div>
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

    this.setState({
      selectedTokenFirst: name,
      selectedWeightFirst: this.props.tokenWeights.get(name) || 1,
    });
  }

  private onSecondTokenChange(name: string) {
    if (name === this.state.selectedTokenFirst) {
      return;
    }

    this.setState({
      selectedTokenSecond: name,
      selectedWeightSecond: this.props.tokenWeights.get(name) || 1,
    });
  }

  private prepareBlockChangeDate(): any {
    return (
      <div>
        <div>Date:</div>
        <Slider
          max={this.props.dateList.length}
          value={this.state.selectedDateIndex}
          tipFormatter={(value) => this.formatter(value)}
          onChange={value =>
            this.setState({selectedDateIndex: Math.max(this.props.minDateIndex, value as number)})
          }
        />
      </div>
    );
  }

  private formatter(value: number): string {
    return DateUtils.toStringDate(this.props.dateList[value]);
  }

  private prepareTokenNames(): any {
    return this.props.tokenNames.map(name => <Option key={name}>{name}</Option>);
  }

}
