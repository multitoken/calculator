import { init } from '@sentry/browser';
import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'react-input-range/lib/css/index.css';
import { HashRouter as Router, Route } from 'react-router-dom';
import Config from './Config';
import CalculatorPage from './pages/calculator/CalculatorPage';
import HistoryPage from './pages/history/HistoryPage';
import SetupTokenPage from './pages/setup/SetupTokenPage';
import './res/styles/Theme.less';
import { Intercom } from './utils/Intercom';

// const GH_PAGES_PREFIX_URL = 'calculator';

init({dsn: Config.getSenrtyConfigUrl(), enabled: !Config.isDebug()});

ReactDOM.render(
  <Router>
    <div className="router">
      <Route exact={true} path="/" component={CalculatorPage}/>
      <Route exact={true} path="/tokens" component={SetupTokenPage}/>
      <Route exact={true} path="/history" component={HistoryPage}/>
      <Intercom appId={Config.getIntercomAppId()}/>
    </div>
  </Router>,
  document.getElementById('root') as HTMLElement
);
