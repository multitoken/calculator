"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
require("bootstrap/dist/css/bootstrap.css");
require("./res/styles/index.css");
var Dashboard_1 = require("./pages/Dashboard");
var Auth_1 = require("./pages/Auth");
var react_router_dom_1 = require("react-router-dom");
var CreateRequest_1 = require("./pages/CreateRequest");
var SearchRequests_1 = require("./pages/SearchRequests");
var Offers_1 = require("./pages/Offers");
var CreateSearchRequest_1 = require("./pages/CreateSearchRequest");
var CreateOffer_1 = require("./pages/CreateOffer");
var SearchOfferMatch_1 = require("./pages/SearchOfferMatch");
var DataPermissions_1 = require("./pages/DataPermissions");
var SearchResult_1 = require("./pages/SearchResult");
ReactDOM.render(<react_router_dom_1.HashRouter>
        <div className="router">
            <react_router_dom_1.Route exact={true} path="/" component={Auth_1.default}/>
            <react_router_dom_1.Route path="/dashboard/" component={Dashboard_1.default}/>
            <react_router_dom_1.Route path="/create-request/" component={CreateRequest_1.default}/>
            <react_router_dom_1.Route path="/permissions/" component={DataPermissions_1.default}/>
            <react_router_dom_1.Route path="/search-requests/" component={SearchRequests_1.default}/>
            <react_router_dom_1.Route path="/search-result/:searchRequestId" component={SearchResult_1.default}/>
            <react_router_dom_1.Route path="/create-search-request/" component={CreateSearchRequest_1.default}/>
            <react_router_dom_1.Route path="/offers/" component={Offers_1.default}/>
            <react_router_dom_1.Route path="/create-offer/" component={CreateOffer_1.default}/>
            <react_router_dom_1.Route path="/search-match/" component={SearchOfferMatch_1.default}/>
        </div>
    </react_router_dom_1.HashRouter>, document.getElementById('root'));
