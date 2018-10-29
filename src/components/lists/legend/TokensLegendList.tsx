import * as React from 'react';
import { TokenLegend } from '../../../entities/TokenLegend';
import { LegendStyle, TokenLegendHolder } from '../../holders/legend/TokenLegendHolder';
import { AbstractProperties } from '../AbstractList';
import './TokensLegendList.less';

interface Properties extends AbstractProperties<TokenLegend> {
  style?: LegendStyle;
  showCheckbox?: boolean;

  onChangeNames?(names: string[]): void;
}

export class TokensLegendList extends React.Component<Properties, {}> {

  private checked: Map<string, boolean> = new Map();

  public componentDidUpdate(prevProps: Readonly<Properties>, prevState: Readonly<{}>, snapshot?: any): void {
    if (this.checked.size !== this.props.data.length) {
      this.checked.clear();
      this.props.data.forEach(value => this.checked.set(value.name, true));
      if (this.props.onChangeNames) {
        this.props.onChangeNames(this.props.data.map(value => value.name));
      }
    }
  }

  public render() {
    return (
      <div className="TokensLegendList__content">
        {this.prepareItems()}
      </div>
    );
  }

  private prepareItems(): React.ReactNode {
    return this.props.data
      .map((item: TokenLegend, index: number) => this.bindHolder(item, index));
  }

  private bindHolder(dataItem: TokenLegend, position: number): object {
    return (
      <TokenLegendHolder
        style={this.props.style}
        model={dataItem}
        key={position}
        defChecked={true}
        showCheckbox={this.props.showCheckbox === true}
        onCheckItemClick={(model, checked) => this.onCheckItemClick(model, checked)}
      />
    );
  }

  private onCheckItemClick(model: TokenLegend, checked: boolean) {
    this.checked.set(model.name, checked);

    if (this.props.onChangeNames) {
      const result: string[] = [];
      this.checked.forEach((value, key) => {
        if (value === true) {
          result.push(key);
        }
      });
      this.props.onChangeNames(result);
    }
  }

}
