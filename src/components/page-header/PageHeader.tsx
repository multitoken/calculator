import { Col, Layout, Row } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import './PageHeader.css';

const { Header } = Layout;

export default class PageHeader extends React.Component {
  public render() {
    return (
      <Header className="PageHeader">
        <Row type="flex" justify="start">
          <Col span={24}>
            <Link to="/" className="SetupTokenPage-logo">Arbitrator simulator</Link>
          </Col>
        </Row>
      </Header>
    );
  }
}
