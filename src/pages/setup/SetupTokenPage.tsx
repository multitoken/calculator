import { Button, Layout } from 'antd';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { TokensNamesList } from '../../components/lists/name/TokensNamesList';
import PageFooter from '../../components/page-footer/PageFooter';
import PageHeader from '../../components/page-header/PageHeader';
import { TokenItemEntity } from '../../entities/TokenItemEntity';
import { lazyInject, Services } from '../../Injections';
import { TokenManager } from '../../manager/TokenManager';
import { TokensHelper } from '../../utils/TokensHelper';
import './SetupTokenPage.less';

interface Props extends RouteComponentProps<{}> {
}

interface State {
  availableTokenNames: TokenItemEntity[];
  selectedTokenNames: string[];
  isTokenLoading: boolean;
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
      isTokenLoading: false,
      selectedTokenNames: [],
    };
  }

  public componentDidMount(): void {
    this.tokenManager
      .getAvailableTokens()
      .then(result => this.onSyncTokens(result))
      .catch(reason => alert(reason.message));
  }

  public render() {
    return (
      <Layout
        style={{
          minHeight: '100vh',
          minWidth: 320,
        }}
      >
        <PageHeader/>
        <header className="SetupTokenPage__header">
          Select tokens to simulate multiToken(at least two)
        </header>

        <div className="SetupTokenPage">

          <TokensNamesList
            data={this.state.availableTokenNames}
            onCheck={result => this.onCheckToken(result)}
            disabled={this.state.isTokenLoading}
          />

          <Button
            type="primary"
            onClick={() => this.onNextClick()}
            disabled={!this.checkActiveNext()}
            loading={this.state.isTokenLoading}
            style={{
              marginTop: 30
            }}
          >
            Next
          </Button>
        </div>
        <PageFooter/>
      </Layout>
    );
  }

  private onSyncTokens(tokens: Map<string, string>) {
    this.availableTokensMap = tokens;

    const entities: TokenItemEntity[] = Array.from(tokens.keys())
      .map(value => new TokenItemEntity(TokensHelper.getIcon(value), value));

    this.setState({availableTokenNames: entities});
  }

  private onCheckToken(checkedValue: string[]) {
    this.setState({
      selectedTokenNames: checkedValue,
    });
  }

  private onNextClick() {
    this.setState({isTokenLoading: true});
    const {history} = this.props;

    this.state.selectedTokenNames.sort();

    this.tokenManager.setupTokens(this.state.selectedTokenNames)
      .then(() => history.push('calculator'))
      .catch(reason => {
        console.error(reason);
        alert('something went wrong');
        this.setState({isTokenLoading: false});
      });
  }

  private checkActiveNext(): boolean {
    return this.state.selectedTokenNames.length > 1;
  }

}
