import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { lazyInject, Services } from '../Injections';
import { TokenManager } from '../manager/TokenManager';
import CheckButtonList from '../components/lists/CheckButtonList';
import Container from 'reactstrap/lib/Container';
import Button from 'reactstrap/lib/Button';

interface Props extends RouteComponentProps<{}> {
}

interface State {
    tokenNames: Map<string, boolean>;
}

export default class SetupTokenPage extends React.Component<Props, State> {

    @lazyInject(Services.TOKEN_MANAGER)
    tokenManager: TokenManager;
    availableTokens: Map<string, string>;

    constructor(props: Props) {
        super(props);

        this.availableTokens = new Map();

        this.state = {
            tokenNames: new Map()
        };
    }

    componentDidMount(): void {
        this.tokenManager
            .getAvailableTokens()
            .then(this.onSyncTokens.bind(this))
            .catch(reason => alert(reason.message));
    }

    render() {
        return (
            <Container className="text-center">
                Please select tokens for MultiToken. (Min two tokens)
                <div className="m-4 text-center">
                    <CheckButtonList
                        data={this.state.tokenNames}
                        onCheck={(key: string, checked: boolean) => this.onCheckToken(key, checked)}
                    />
                </div>

                <div className="text-center">
                    <Button
                        color="primary"
                        onClick={() => this.onNextClick()}
                        disabled={!this.checkActiveNext()}
                    >
                        Next
                    </Button>
                </div>
            </Container>
        );
    }

    private onSyncTokens(tokens: Map<string, string>) {
        this.availableTokens = tokens;
        const tokenItems: Map<string, boolean> = new Map();
        tokens.forEach((value, key) => tokenItems.set(key, false));

        this.setState({tokenNames: tokenItems});
    }

    private onCheckToken(key: string, checked: boolean) {
        this.state.tokenNames.set(key, checked);
        this.setState({tokenNames: this.state.tokenNames});
    }

    private onNextClick() {
        const {history} = this.props;
        const result: Array<string> = [];
        this.state.tokenNames.forEach((value, key) => {
            if (this.availableTokens.has(key) && value) {
                result.push(this.availableTokens.get(key) || '');
            }
        });

        this.tokenManager.setupTokens(result)
            .then(() => history.push('calculator'))
            .catch(reason => {
                console.log(reason);
                alert('something went wrong');
            });
    }

    private checkActiveNext(): boolean {
        let count: number = 0;
        this.state.tokenNames.forEach(value => count += value ? 1 : 0);

        return count > 1;
    }

}
