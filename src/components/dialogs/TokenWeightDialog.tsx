import { InputNumber, Modal, Select, Slider } from 'antd';
import * as React from 'react';
import { TokenWeight } from '../../repository/models/TokenWeight';
import { DateUtils } from '../../utils/DateUtils';

const Option = Select.Option;

export interface Properties {
  openDialog: boolean;
  dateList: number[];
  maxWeight: number;
  tokenNames: string[];
  tokenWeight?: TokenWeight;

  onCancel(): void;

  onOkClick(token: string, dateIndex: number, weight: number, oldModel?: TokenWeight): void;
}

export interface State {
  selectedDateIndex: number;
  selectedToken: string;
  selectedWeight: number;
}

export class TokenWeightDialog extends React.Component<Properties, State> {

  constructor(props: Properties, context: any) {
    super(props, context);
    this.state = {
      selectedDateIndex: 0,
      selectedToken: this.props.tokenNames.length > -1 ? this.props.tokenNames[0] : '',
      selectedWeight: 1
    };
  }

  // public shouldComponentUpdate(nextProps: Readonly<Properties>, nextState: Readonly<State>,
  // nextContext: any): boolean {
  //   return nextProps.openDialog !== this.props.openDialog ||
  //     nextProps.tokenWeight === undefined &&
  //     (nextState.selectedToken !== this.state.selectedToken ||
  //       nextState.selectedDateIndex !== this.state.selectedDateIndex ||
  //       nextState.selectedWeight !== this.state.selectedWeight) ||
  //     nextProps.tokenWeight !== undefined;
  // }

  public componentDidUpdate(prevProps: Readonly<Properties>, prevState: Readonly<State>, snapshot?: any): void {
    if (!prevProps.openDialog && prevProps.tokenWeight && this.props.tokenWeight &&
      (prevState.selectedDateIndex !== this.props.tokenWeight.index ||
        prevState.selectedToken !== this.props.tokenWeight.tokenName ||
        prevState.selectedWeight !== this.props.tokenWeight.weight)) {
      this.setState({
        selectedDateIndex: prevProps.tokenWeight.index,
        selectedToken: prevProps.tokenWeight.tokenName,
        selectedWeight: prevProps.tokenWeight.weight
      });
    } else if (!prevProps.openDialog && !prevProps.tokenWeight &&
      (prevState.selectedToken !== (this.props.tokenNames.length > -1 ? this.props.tokenNames[0] : '') ||
        prevState.selectedDateIndex !== 0 ||
        prevState.selectedWeight !== 1)) {
      this.setState({
        selectedDateIndex: 0,
        selectedToken: this.props.tokenNames.length > -1 ? this.props.tokenNames[0] : '',
        selectedWeight: 1
      });
    }
  }

  public render() {
    return (
      <div>
        <Modal
          title="Add token weight"
          visible={this.props.openDialog}
          onOk={() => {
            this.props.onOkClick(
              this.state.selectedToken,
              this.state.selectedDateIndex,
              this.state.selectedWeight,
              this.props.tokenWeight
            );
          }
          }
          onCancel={() => this.props.onCancel()}
        >
          <div>
            <div>Token name:</div>
            <Select
              onChange={value => this.setState({selectedToken: value.toString()})}
              value={this.state.selectedToken}
              style={{width: 120}}
            >
              {this.prepareTokenNames()}
            </Select>
          </div>

          {this.prepareBlockChangeDate()}

          <div>Weight:</div>
          <InputNumber
            min={1}
            max={this.props.maxWeight}
            value={this.state.selectedWeight}
            onChange={value => this.setState({selectedWeight: parseInt((value || 0).toString(), 0)})}
          />
        </Modal>
      </div>
    );
  }

  private prepareBlockChangeDate(): any {
    if (this.props.tokenWeight) {
      return (
        <div>
          <div>Date:</div>
          <div>
            {DateUtils.toStringDate(this.props.dateList[this.props.tokenWeight.index], DateUtils.DATE_FORMAT_SHORT)}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div>Date:</div>
        <Slider
          max={this.props.dateList.length}
          value={this.state.selectedDateIndex}
          tipFormatter={(value) => this.formatter(value)}
          onChange={value =>
            this.setState({selectedDateIndex: value as number})
          }
        />
      </div>
    );
  }

  private formatter(value: number): string {
    return DateUtils.toStringDate(this.props.dateList[value], DateUtils.DATE_FORMAT_SHORT);
  }

  private prepareTokenNames(): any {
    return this.props.tokenNames.map(name => <Option key={name}>{name}</Option>);
  }

}
