import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Layout, Row, Col, Button, InputNumber } from 'antd';
import { lazyInject, Services } from '../Injections';
import { TokenManager } from '../manager/TokenManager';
import Label from 'reactstrap/lib/Label';
import FormGroup from 'reactstrap/lib/FormGroup';
import Form from 'reactstrap/lib/Form';
import { TokenPriceHistory } from '../repository/models/TokenPriceHistory';
import { Arbitration } from '../repository/models/Arbitration';
import { ArbiterChart } from '../components/charts/ArbiterChart';
import { TokensCapChart } from '../components/charts/TokensCapChart';
import { HistoryChart } from '../components/charts/HistoryChart';
import { TokensProportionsList } from '../components/lists/TokensProportionsList';
import { TokenProportion } from '../repository/models/TokenProportion';
import { Range } from 'react-input-range';
import Config from '../Config';
import PageContent from '../components/page-content/PageContent';
import PageFooter from '../components/page-footer/PageFooter';

const { Header } = Layout;
const InputRange = require('react-input-range');

interface Props extends RouteComponentProps<{}> {
}

interface State {
  tokenNames: Map<string, boolean>;
  tokensHistory: Map<string, Array<TokenPriceHistory>>;
  tokensDate: Array<number>;
  arbitrationList: Array<Arbitration>;
  amount: number;
  cap: number;
  arbiterCap: number;
  proportionList: Array<TokenProportion>;
  calculateRangeDateIndex: Range | number;
  calculateMaxDateIndex: number;
  arbiterProfit: number;
}

const DATE_FORMAT: any = {
  year: '2-digit',
  month: 'short',
  day: '2-digit',
  hour: '2-digit'
};

function inputNumberParser(value: string) {
  return Number(value.replace(/\$\s?|(,*)/g, ''));
}

export default class CalculatorPage extends React.Component<Props, State> {
  private readonly COLORS: Array<string> = [
    '#8884d8', '#82ca9d', '#f4f142', '#a6f441', '#41f497', '#41f4df', '#414cf4', '#d941f4',
    '#f4419d', '#720009'
  ];

  @lazyInject(Services.TOKEN_MANAGER)
  private tokenManager: TokenManager;

  constructor(props: Props) {
    super(props);

    this.state = {
      tokenNames: new Map(),
      tokensHistory: new Map(),
      tokensDate: [],
      arbitrationList: [],
      amount: 10000,
      cap: 0,
      arbiterCap: 0,
      proportionList: [],
      calculateRangeDateIndex: {min: 0, max: 1},
      calculateMaxDateIndex: 1,
      arbiterProfit: 0,
    };
  }

  componentDidMount(): void {
    if (this.tokenManager.getPriceHistory().size === 0) {
      window.location.replace('/');
    }

    // console.log( this.tokenManager.cryptocurrencyRepository);
    this.tokenManager
      .getAvailableTokens()
      .then(this.onSyncTokens.bind(this))
      .catch(reason => alert(reason.message));
  }

  render() {
    return (
      <Layout
        style={{
          minHeight: '100vh',
          minWidth: 1000
        }}
      >
        <Header style={{ color: 'white' }}>
          <Row type="flex" justify="start">
            <Col span={24}>
              <Link to="/">Arbitrator simulator</Link>
            </Col>
          </Row>
        </Header>
        <PageContent>
          <Form style={{ width: 900 }}>
            <FormGroup>
              <Label>Amount: </Label>

              <InputNumber
                value={this.state.amount}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={inputNumberParser}
                onChange={this.onAmountChange}
                style={{ width: 200 }}
              />

              <div className="m-4">
                <InputRange
                  maxValue={this.state.calculateMaxDateIndex}
                  minValue={0}
                  formatLabel={value => this.inputRangeTrackValue(value)}
                  value={this.state.calculateRangeDateIndex}
                  onChange={value => this.setState({calculateRangeDateIndex: value})}
                  onChangeComplete={(value: Range) => {
                    this.tokenManager.changeCalculationDate(value.min, value.max);
                  }}
                />
              </div>

              <TokensProportionsList
                data={this.state.proportionList}
                onChangeProportion={
                  (name, value, position) => this.onChangeProportion(name, value, position)
                }
              />
            </FormGroup>

            <Button
              type="primary"
              onClick={() => this.onCalculateClick()}
            >
              Calculate
            </Button>

            <FormGroup>
              <Label>Result cap <b>without/with</b> arbitrage BTC: </Label>
              <div>
                <Label>{this.state.cap} / {this.state.arbiterCap}</Label>
              </div>
              <Label>Result cap <b>without/with</b> arbitrage $: </Label>
              <div>
                <Label>
                  {this.state.cap * Config.getBtcUsdPrice()} /&nbsp;
                  {this.state.arbiterCap * Config.getBtcUsdPrice()}
                </Label>
                &nbsp;
                <Label>
                  ({(this.state.arbiterCap - this.state.cap) * Config.getBtcUsdPrice()})
                </Label>
              </div>
              <Label>Result percent. in {this.calcCountDays()} days</Label>
              <div>
                <Label>{(1 - (this.state.cap / this.state.arbiterCap)) * 100}%</Label>
              </div>
              <Label>Arbiter profit</Label>
              <div>
                <Label>${this.state.arbiterProfit * Config.getBtcUsdPrice()}</Label>
              </div>
            </FormGroup>

            <FormGroup>
              <Label>Tokens history price $:</Label>
              <div>
                <HistoryChart
                  data={this.state.tokensHistory}
                  colors={this.COLORS}
                  start={(this.state.calculateRangeDateIndex as Range).min}
                  end={(this.state.calculateRangeDateIndex as Range).max}
                  showRange={true}
                  width={800}
                  height={200}
                />
              </div>
            </FormGroup>
            <FormGroup>
              <Label>
                Manipulation by the arbitrators (cap)$
                (count Operations:{this.getArbitrationListLen()}) :
              </Label>
              <div>
                <ArbiterChart
                  data={this.state.arbitrationList}
                  colors={this.COLORS}
                  width={800}
                  height={200}
                  showRange={true}
                />
              </div>
            </FormGroup>
            <FormGroup>
              <Label>
                Tokens history price when manipulation by the arbitrators (cap per
                token)$
                (count Operations:{this.getArbitrationListLen()}) :
              </Label>
              <div>
                <TokensCapChart
                  data={this.state.arbitrationList}
                  colors={this.COLORS}
                  width={800}
                  height={200}
                  showRange={true}
                />
              </div>
            </FormGroup>
          </Form>
        </PageContent>
        <PageFooter />
      </Layout>
    );
  }

  private calcCountDays(): number {
    const max: number = (this.state.calculateRangeDateIndex as Range).max;
    const min: number = (this.state.calculateRangeDateIndex as Range).min;
    return Math.floor((max - min) / 60 / 24);
  }

  private inputRangeTrackValue(value: number): string {
    if (value > -1 && value <= this.state.tokensDate.length - 1) {
      return new Date(this.state.tokensDate[value])
        .toLocaleDateString(['en-US'], DATE_FORMAT);
    } else {
      return 'wrong date';
    }
  }

  private getArbitrationListLen(): number {
    return Math.max(0, this.state.arbitrationList.length - 1);
  }

  private onChangeProportion(name: string, value: number, position: number) {
    this.state.proportionList[position].proportion = value;
    this.setState({proportionList: this.state.proportionList});
  }

  private onSyncTokens(tokens: Map<string, string>) {
    const tokenItems: Map<string, boolean> = new Map();
    const proportions: Array<TokenProportion> = [];

    tokens.forEach((value, key) => tokenItems.set(key, false));

    this.tokenManager.getPriceHistory().forEach((value, key) => {
      proportions.push(new TokenProportion(key, 1, 1, 10));
    });
    const firstTokenName: string = Array.from(this.tokenManager.getPriceHistory().keys())[0];
    const history: Array<TokenPriceHistory> = this.tokenManager.getPriceHistory().get(firstTokenName) || [];

    this.setState({tokensDate: history.map(value => value.time)});

    const maxIndex: number = this.tokenManager.getMaxCalculationIndex() - 1;
    this.setState({
      calculateMaxDateIndex: maxIndex,
      calculateRangeDateIndex: {min: 0, max: maxIndex}
    });
    this.setState({proportionList: proportions});
    this.setState({tokenNames: tokenItems});
  }

  private onAmountChange = (value: number | string) => {
    const valueNumber = Number(value);

    if (valueNumber > 0) {
      this.setState({amount: valueNumber});
    }
  }

  private onCalculateClick() {
    const mapProportions: Map<string, number> = new Map();

    this.state.proportionList.forEach(value => {
      mapProportions.set(value.name, value.proportion);
    });

    this.tokenManager.changeProportions(mapProportions);

    this.tokenManager.calculateInitialAmounts(this.state.amount)
      .then(result => this.tokenManager.calculateCap())
      .then(cap => {
        this.setState({tokensHistory: this.tokenManager.getPriceHistory()});
        this.setState({cap: cap});

        return this.tokenManager.calculateArbitration();
      })
      .then(result => {
        this.setState({arbitrationList: result});
        console.log(result);
        let profit: number = 0;
        let txSum: number = 0;

        result.forEach(value => {
          profit += value.arbiterProfit;
          txSum += value.txPrice;
        });

        this.setState({arbiterProfit: profit});

        console.log('summary profit for arbiter', profit);
        console.log('summary eth price', txSum); // this is already in btc
        // todo: derive in $ = txSum * Config.getBtcUsdPrice()

        return this.tokenManager.calculateCap();
      })
      .then(cap => this.setState({arbiterCap: cap}));
  }

}
