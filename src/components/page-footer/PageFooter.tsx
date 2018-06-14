import * as React from 'react';
import { Layout } from 'antd';
import './PageFooter.css';

const { Footer } = Layout;

export default class PageFooter extends React.Component {
  render() {
    const version = process.env.REACT_APP_VERSION;
    const versionText = version || 'undefined';
    const versionLink = `https://github.com/MultiTKN/arbitrator-simulator/tree/v${version}`;
    return (
      <Footer
        style={{textAlign: 'center'}}
      >
        MultiTKN&nbsp;©2018&nbsp;
        <code className="PageFooter-version">
          {version ?
            <a href={versionLink} target="_blank">version&nbsp;{versionText}</a> :
            'version unspecified'
          }

        </code>
      </Footer>
    );
  }
}
