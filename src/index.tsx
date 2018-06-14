import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'react-input-range/lib/css/index.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import CalculatorPage from './pages/CalculatorPage';
import SetupTokenPage from './pages/SetupTokenPage';
import './res/styles/index.css';

// const GH_PAGES_PREFIX_URL = 'arbitrator-simulator';

ReactDOM.render(
    <Router>
        <div className="router">
            <Route exact={true} path="/arbitrator-simulator" component={SetupTokenPage}/>
            <Route exact={true} path="/arbitrator-simulator/calculator" component={CalculatorPage}/>
        </div>
    </Router>,
    document.getElementById('root') as HTMLElement
);
