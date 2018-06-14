import { Button, Col, Layout, Row } from 'antd';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import CheckButtonList from '../components/lists/CheckButtonList';
import PageContent from '../components/page-content/PageContent';
import PageFooter from '../components/page-footer/PageFooter';
import { lazyInject, Services } from '../Injections';
import { TokenManager } from '../manager/TokenManager';
import './SetupTokenPage.css';

const { Header } = Layout;

interface Props extends RouteComponentProps<{}> {
}

interface State {
  availableTokenNames: string[];
  selectedTokenNames: string[];
}

export default class SetupTokenPage extends React.Component<Props, State> {

  @lazyInject(Services.TOKEN_MANAGER)
  public tokenManager: TokenManager;
  public availableTokensMap: Map<string, string>;

  constructor(props: Props) {
    super(props);

    this.availableTokensMap = new Map();

    this.state = {
      availableTokenNames: [],
      selectedTokenNames: [],
    };
  }

  public componentDidMount(): void {
    this.tokenManager
      .getAvailableTokens()
      .then(this.onSyncTokens)
      .catch(reason => alert(reason.message));
  }

  public render() {
    return (
      <Layout
        style={{
          minHeight: '100vh',
          minWidth: 320
        }}
      >
        <Header style={{ color: 'white' }}>
          <Row type="flex" justify="start">
            <Col span={24}>
              <Link to="/" className="SetupTokenPage-logo">Arbitrator simulator</Link>
            </Col>
          </Row>
        </Header>
        <PageContent>
          <div className="SetupTokenPage">
            <header className="SetupTokenPage-header">
              Select tokens to simulate multiToken
              <br />
              (at least two)
            </header>

            <CheckButtonList
              data={this.state.availableTokenNames}
              onCheck={this.onCheckToken}
            />

            <Button
              type="primary"
              onClick={this.onNextClick}
              disabled={!this.checkActiveNext()}
              size="large"
              style={{
                marginTop: 30,
              }}
            >
              Simulate
            </Button>
          </div>
        </PageContent>
        <PageFooter />
      </Layout>
    );
  }

  private onSyncTokens = (tokens: Map<string, string>) => {
    this.availableTokensMap = tokens;

    this.setState({
      availableTokenNames: Array.from(tokens.keys()),
    });
  }

  private onCheckToken = (checkedValue: string[]) => {
    this.setState({
      selectedTokenNames: checkedValue,
    });
  }

  private onNextClick = () => {
    const { history } = this.props;

    const selectedTokenSymbols = this.state.selectedTokenNames.map((tokenName) => {
      return this.availableTokensMap.get(tokenName) || '';
    });

    console.log(selectedTokenSymbols);

    this.tokenManager.setupTokens(selectedTokenSymbols)
      .then(() => history.push('calculator'))
      .catch(reason => {
        console.log(reason);
        alert('something went wrong');
      });
  }

  private checkActiveNext(): boolean {
    return this.state.selectedTokenNames.length > 1;
  }

}
