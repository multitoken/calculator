import * as React from 'react';
import './BlockContent.less';

export interface Props {
  className?: any;
}

export default class BlockContent extends React.Component<Props> {
  public render() {
    return (
      <div className={`BlockContent-content ${this.props.className || ''}`}>
        {this.props.children}
      </div>
    );
  }
}
