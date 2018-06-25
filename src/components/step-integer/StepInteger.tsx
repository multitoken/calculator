import { Col, InputNumber, Row, Slider } from 'antd';
import * as React from 'react';

export interface Properties {
  disabled: boolean;
  min?: number;
  max?: number;
  defaultValue?: number;

  onAfterChange(value: number): void;
}

export default class StepInteger extends React.Component<Properties, any> {
  public state = {
    disabled: false,
    inputValue: this.props.defaultValue,
  };

  public onChange = (value: number) => {
    this.setState({
      inputValue: value,
    });
  }

  public onInputNumberChange = (value: number) => {
    this.onChange(value);
    this.onAfterChange(value);
  }

  public onAfterChange = (value: number) => {
    this.props.onAfterChange(value);
  }

  public render() {
    return (
      <Row>
        <Col span={12}>
          <Slider
            disabled={this.props.disabled}
            min={this.props.min}
            max={this.props.max}
            value={this.state.inputValue}
            onChange={this.onChange}
            onAfterChange={this.onAfterChange}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            style={{marginLeft: 16}}
            min={this.props.min}
            max={this.props.max}
            defaultValue={this.props.defaultValue}
            value={this.state.inputValue}
            onChange={this.onInputNumberChange}
          />
        </Col>
      </Row>
    );
  }
}
