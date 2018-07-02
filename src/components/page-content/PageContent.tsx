import { Layout } from 'antd';
import * as React from 'react';
import './PageContent.less';

const {Content} = Layout;

export interface Props {
  className?: any;
}

export default class PageContent extends React.Component<Props> {
  public render() {
    return (
      <Content className={`PageContent`}>
        <div className={`PageContent-content ${this.props.className || ''}`}>
          {this.props.children}
        </div>
      </Content>
    );
  }
}
