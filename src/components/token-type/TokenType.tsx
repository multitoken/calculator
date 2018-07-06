import { Button } from 'antd';
import * as React from 'react';
import './TokenType.less';

export interface Props {
  title: string;
  img: any;
  desc: React.ReactElement<any>;

  onItemClick(): void;
}

export default class TokenType extends React.Component<Props, {}> {

  public render() {
    return (
      <div className="TokenType__content-block">
        <div className="TokenType__content-block-title">
          {this.props.title}
        </div>
        <img className="TokenType__content-block-img" src={this.props.img} alt="img"/>
        <div className="TokenType__content-block-desc">
          {this.props.desc}
        </div>

        <Button
          type="primary"
          size="large"
          onClick={() => this.props.onItemClick()}
        >
          Select
        </Button>
      </div>
    );
  }

}
