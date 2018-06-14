import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'react-input-range/lib/css/index.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import CalculatorPage from './pages/CalculatorPage';
import SetupTokenPage from './pages/SetupTokenPage';
import './res/styles/index.css';

ReactDOM.render(
    <Router>
        <div className="router">
            <Route exact={true} path="/" component={SetupTokenPage}/>
            <Route exact={true} path="/calculator" component={CalculatorPage}/>
        </div>
    </Router>,
    document.getElementById('root') as HTMLElement
);
