import * as React from 'react';
import { Checkbox } from 'antd';
import { CheckboxOptionType } from 'antd/es/checkbox';
import './CheckButtonList.css';

const CheckboxGroup = Checkbox.Group;

interface Props {
  data: Array<string>;
  onCheck: Function;
}

export default class CheckButtonList extends React.Component<Props, {}> {

  onChange = (checkedValues) => {
    this.props.onCheck(checkedValues);
  }

  render() {
    const options = this.getOptions();

    return (
      <CheckboxGroup
        options={options}
        onChange={this.onChange}
        className="CheckButtonList"
      />
    );
  }

  getOptions() {
    const options: Array<CheckboxOptionType> = [];

    this.props.data.forEach((tokenName: string) => {
      options.push({
        label: tokenName,
        value: tokenName,
      });
    });

    return options;
  }

}
