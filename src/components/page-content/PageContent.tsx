import { Layout } from 'antd';
import * as React from 'react';
import './PageContent.less';

const {Content} = Layout;

export interface Props {
  className?: any;
  visibility?: boolean;
}

export default class PageContent extends React.Component<Props> {
  public render() {
    return (
      <Content className={
        `PageContent ${this.props.visibility === false ? 'PageContent__hide' : 'PageContent__visible'}`
      }>
        <div className={`PageContent-content ${this.props.className || ''}`}>
          {this.props.children}
        </div>
      </Content>
    );
  }
}
