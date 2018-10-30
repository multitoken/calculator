import * as React from 'react';
import { CoinItemEntity } from '../../../entities/CoinItemEntity';
import { TokenNameHolder } from '../../holders/name/TokenNameHolder';
import { AbstractProperties } from '../AbstractList';
import './TokensNamesList.less';

interface Properties extends AbstractProperties<CoinItemEntity> {
  disabled: boolean;
  checked: string[];

  onCheck(checkedValue: string[]): void;

  onChange(name: string, checked: boolean): void;

}

interface State {
  checkedSet: Set<string>;
}

export class TokensNamesList extends React.Component<Properties, State> {

  constructor(props: Properties) {
    super(props);

    this.state = {
      checkedSet: new Set(this.props.checked),
    };
    console.log(this.state.checkedSet, this.props.checked);
  }

  public render() {
    return (
      <div className="TokensNamesList__content">
        {this.prepareItems()}
      </div>
    );
  }

  private prepareItems(): React.ReactNode {
    return this.props.data
      .map((item: CoinItemEntity, index: number) => this.bindHolder(item, index));
  }

  private bindHolder(dataItem: CoinItemEntity, position: number): object {
    return (
      <TokenNameHolder
        checked={this.state.checkedSet.has(dataItem.name)}
        onItemClick={model => this.onItemClick(model)}
        model={dataItem}
        key={position}
      />
    );
  }

  private onItemClick(model: CoinItemEntity): void {
    if (this.state.checkedSet.has(model.name)) {
      this.state.checkedSet.delete(model.name);
    } else {
      this.state.checkedSet.add(model.name);
    }

    this.setState({checkedSet: this.state.checkedSet});
    this.props.onCheck(Array.from(this.state.checkedSet.keys()));
    this.props.onChange(model.name, this.state.checkedSet.has(model.name));
  }

}
