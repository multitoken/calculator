import { Slider } from 'antd';
import * as React from 'react';

export interface Properties {
  disabled: boolean;
  min?: number;
  max?: number;
  defaultValue?: number;
  tipFormatter?: null | ((value: number) => React.ReactNode);

  onChange?(value: number): void;

  onAfterChange?(value: number): void;
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

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  public onInputNumberChange = (value: number) => {
    this.onChange(value);
    this.onAfterChange(value);
  }

  public onAfterChange = (value: number) => {
    if (this.props.onAfterChange) {
      this.props.onAfterChange(value);
    }
  }

  public render() {
    return (
      <Slider
        disabled={this.props.disabled}
        min={this.props.min}
        max={this.props.max}
        tipFormatter={this.props.tipFormatter}
        value={this.state.inputValue}
        onChange={this.onChange}
        onAfterChange={this.onAfterChange}
      />
    );
  }
}
