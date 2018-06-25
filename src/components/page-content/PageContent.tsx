import { Layout } from 'antd';
import * as React from 'react';
import './PageContent.less';

const {Content} = Layout;

export default class PageContent extends React.Component {
  public render() {
    return (
      <Content className="PageContent">
        <div className="PageContent-content">
          {this.props.children}
        </div>
      </Content>
    );
  }
}
