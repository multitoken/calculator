import { init } from '@sentry/browser';
import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'react-input-range/lib/css/index.css';
import { HashRouter as Router, Route } from 'react-router-dom';
import Config from './Config';
import CalculatorPage from './pages/calc/CalculatorPage';
import ConfiguratorPage from './pages/calculator/ConfiguratorPage';
import HistoryPage from './pages/history/HistoryPage';
import ResultPage from './pages/result/ResultPage';
import SetupTokenPage from './pages/setup/SetupTokenPage';
import SimpleSetupTokenPage from './pages/simple-setup/SimpleSetupTokenPage';
import TokenTypesPage from './pages/types/TokenTypesPage';
import './res/styles/Theme.less';
import { Intercom } from './utils/Intercom';

// const GH_PAGES_PREFIX_URL = 'calculator';

init({dsn: Config.getSenrtyConfigUrl(), enabled: !Config.isDebug()});

ReactDOM.render(
  <Router>
    <div className="router">
      <Route exact={true} path="/" component={CalculatorPage}/>
      <Route exact={true} path="/tokens" component={SetupTokenPage}/>
      <Route exact={true} path="/simple" component={SimpleSetupTokenPage}/>
      <Route exact={true} path="/types" component={TokenTypesPage}/>
      <Route exact={true} path="/history" component={HistoryPage}/>
      <Route exact={true} path="/calculator" component={ConfiguratorPage}/>
      <Route exact={true} path="/calculator/result" component={ResultPage}/>
      <Intercom appId={Config.getIntercomAppId()}/>
    </div>
  </Router>,
  document.getElementById('root') as HTMLElement
);
