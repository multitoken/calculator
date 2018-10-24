import * as React from 'react';
import BlockContent from '../block-content/BlockContent';
import './StatisticItem.less';

export interface Props {
  name: string;
  compareCap: string;
  cap: string;
  roi: string;
}

export class StatisticItem extends React.Component<Props, {}> {

  public render(): React.ReactNode {
    const diff: number = Number(this.props.cap) - Number(this.props.compareCap);

    return (
      <BlockContent className="StatisticItem__content">
        <div className="StatisticItem__content__title">{this.props.name}</div>
        <div className="StatisticItem__content__sub-title">Portfolio capitalization</div>
        <div className={`StatisticItem__content__value StatisticItem__content__value_${diff > 0 ? 'green' : 'red'}`}>
          $ {this.props.cap}
        </div>
        <div className="StatisticItem__content__sub-title">ROI</div>
        <div className="StatisticItem__content__roi">{this.props.roi}%</div>
      </BlockContent>
    );
  }

}
