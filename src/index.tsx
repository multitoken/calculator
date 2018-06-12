import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './res/styles/index.css';
import 'react-input-range/lib/css/index.css';
import SetupTokenPage from './pages/SetupTokenPage';
import { HashRouter, Route } from 'react-router-dom';
import CalculatorPage from './pages/CalculatorPage';

ReactDOM.render(
    <HashRouter>
        <div className="router">
            <Route exact={true} path="/" component={SetupTokenPage}/>
            <Route exact={true} path="/calculator" component={CalculatorPage}/>
        </div>
    </HashRouter>,
    document.getElementById('root') as HTMLElement
);
