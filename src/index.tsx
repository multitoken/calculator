import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'react-input-range/lib/css/index.css';
import { HashRouter as Router, Route } from 'react-router-dom';
import CalculatorPage from './pages/calculator/CalculatorPage';
import SetupTokenPage from './pages/setup/SetupTokenPage';
import './res/styles/Theme.less';

// const GH_PAGES_PREFIX_URL = 'arbitrator-simulator';

ReactDOM.render(
    <Router>
        <div className="router">
            <Route exact={true} path="/" component={SetupTokenPage}/>
            <Route exact={true} path="/calculator" component={CalculatorPage}/>
        </div>
    </Router>,
    document.getElementById('root') as HTMLElement
);
