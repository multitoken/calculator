import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'react-input-range/lib/css/index.css';
import { HashRouter as Router, Route } from 'react-router-dom';
import CalculatorPage from './pages/calculator/CalculatorPage';
import ResultPage from './pages/result/ResultPage';
import SetupTokenPage from './pages/setup/SetupTokenPage';
import TokenTypesPage from './pages/types/TokenTypesPage';
import './res/styles/Theme.less';

// const GH_PAGES_PREFIX_URL = 'simulator';

ReactDOM.render(
  <Router>
    <div className="router">
      <Route exact={true} path="/" component={SetupTokenPage}/>
      <Route exact={true} path="/types" component={TokenTypesPage}/>
      <Route exact={true} path="/calculator" component={CalculatorPage}/>
      <Route exact={true} path="/calculator/result" component={ResultPage}/>
    </div>
  </Router>,
  document.getElementById('root') as HTMLElement
);
