import { Checkbox } from 'antd';
import { CheckboxOptionType } from 'antd/es/checkbox';
import * as React from 'react';
import './CheckButtonList.css';

const CheckboxGroup = Checkbox.Group;

interface Props {
  data: string[];
  onCheck(checkedValues: string[]): void;
}

export default class CheckButtonList extends React.Component<Props, {}> {

  public onChange = (checkedValues: string[]) => {
    this.props.onCheck(checkedValues);
  }

  public render() {
    const options = this.getOptions();

    return (
      <CheckboxGroup
        options={options}
        onChange={this.onChange}
        className="CheckButtonList"
      />
    );
  }

  public getOptions() {
    const options: CheckboxOptionType[] = [];

    this.props.data.forEach((tokenName: string) => {
      options.push({
        label: tokenName,
        value: tokenName,
      });
    });

    return options;
  }

}
