import { Button } from 'antd';
import * as React from 'react';
import './TokenTypeHolder.less';

export interface Props {
  title: string;
  img: any;
  desc: React.ReactElement<any>;

  onItemClick(): void;
}

export default class TokenTypeHolder extends React.Component<Props, {}> {

  public render() {
    return (
      <div className="TokenTypeHolder__content-block">
        <div className="TokenTypeHolder__content-block-title">
          {this.props.title}
        </div>
        <img className="TokenTypeHolder__content-block-img" src={this.props.img} alt="img"/>
        <div className="TokenTypeHolder__content-block-desc">
          {this.props.desc}
        </div>

        <Button
          type="primary"
          onClick={() => this.props.onItemClick()}
        >
          Select
        </Button>
      </div>
    );
  }

}
