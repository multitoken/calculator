import * as React from 'react';
import { Layout, Row, Col } from 'antd';
import './PageContent.css';

const { Content } = Layout;

export default class PageContent extends React.Component {
  render() {
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
