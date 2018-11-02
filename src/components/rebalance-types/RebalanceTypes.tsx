import * as React from 'react';
import { RebalanceTypeItem } from '../../entities/RebalanceTypeItem';
import './RebalanceTypes.less';

export interface Props {
  items: RebalanceTypeItem[];
  defaultSelection: RebalanceTypeItem;

  onItemChange(item: RebalanceTypeItem): void;
}

export interface State {
  selected: RebalanceTypeItem;
}

export class RebalanceTypes extends React.Component<Props, State> {

  constructor(props: Props, context: any) {
    super(props, context);

    this.state = {
      selected: this.props.defaultSelection,
    };
  }

  public render(): React.ReactNode {
    return (
      <div className="RebalanceTypes__content">
        {this.prepareItems(this.props.items)}
      </div>
    );
  }

  private prepareItems(items: RebalanceTypeItem[]): React.ReactNode {
    return items.map(item => this.prepareItem(item));
  }

  private prepareItem(item: RebalanceTypeItem): React.ReactNode {
    return (
      <div
        className={`RebalanceTypes__content__item${this.state.selected === item ? '_selected' : ''}`}
        onClick={() => this.onItemClick(item)}
      >
        <img
          className="RebalanceTypes__content__item__icon"
          alt="img"
          src={item.icon}
        />
        <div className="RebalanceTypes__content__item__desc">
          {item.desc}
        </div>
      </div>
    );
  }

  private onItemClick(item: RebalanceTypeItem): void {
    if (this.state.selected !== item) {
      this.setState({selected: item});
      this.props.onItemChange(item);
    }
  }

}
