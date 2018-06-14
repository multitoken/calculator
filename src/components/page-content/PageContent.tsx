import { Col, Layout, Row } from 'antd';
import * as React from 'react';
import './PageContent.css';

const { Content } = Layout;

export default class PageContent extends React.Component {
  public render() {
    return (
      <Content className="PageContent">
        <Row type="flex" justify="center">
          <Col span={20} className="PageContent-content">
            {this.props.children}
          </Col>
        </Row>
      </Content>
    );
  }
}
