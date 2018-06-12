"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Button_1 = require("reactstrap/lib/Button");
var Container_1 = require("reactstrap/lib/Container");
var PairItemHolder_1 = require("../components/holders/PairItemHolder");
var Form_1 = require("reactstrap/lib/Form");
var FormGroup_1 = require("reactstrap/lib/FormGroup");
var Input_1 = require("reactstrap/lib/Input");
var Row_1 = require("reactstrap/lib/Row");
var Col_1 = require("reactstrap/lib/Col");
var Injections_1 = require("../Injections");
var BaseManager_1 = require("../manager/TokenManagerImpl");
var SimplePairList_1 = require("../components/lists/SimplePairList");
var ButtonGroup_1 = require("reactstrap/lib/ButtonGroup");
var Pair_1 = require("../models/Pair");
var web3_1 = require("web3");
var ethUtil = require('ethereumjs-util');
var web3;
window.addEventListener('load', function () {
    if (typeof window.web3 !== 'undefined') {
        // Use Mist/MetaMask's provider.
        web3 = new web3_1.default(window.web3.currentProvider);
        console.log('Injected web3 detected.');
    }
});
var g_Dashboard;
var Dashboard = (function (_super) {
    __extends(Dashboard, _super);
    function Dashboard(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            inputKey: '',
            inputValue: '',
            ethAddress: '',
            ethSignature: '',
            clientDataRefreshhTrigger: 0,
            clientData: []
        };
        return _this;
    }
    Dashboard.prototype.componentDidMount = function () {
        this.getDataList();
        this.state.ethSignature = '';
        g_Dashboard = this;
    };
    Dashboard.prototype.render = function () {
        var _this = this;
        return (<div className="text-white h-100">
                <Button_1.default className="m-2 float-right" color="danger" size="sm" onClick={function (e) { return _this.onLogoutClick(); }}>
                    Logout
                </Button_1.default>

                <ButtonGroup_1.default className="m-2 btn-group-toggle justify-content-center">
                    <Button_1.default color="primary" onClick={function (e) { return _this.onDataPermissionsClick(); }}>
                        Data permissions
                    </Button_1.default>{''}
                    <Button_1.default color="primary" onClick={function (e) { return _this.onCreateRequestClick(); }}>
                        Request permissions
                    </Button_1.default>
                    <Button_1.default color="primary" onClick={function (e) { return _this.onSearchRequestsClick(); }}>
                        Search Requests
                    </Button_1.default>
                    <Button_1.default color="primary" onClick={function (e) { return _this.onOffersClick(); }}>
                        Offers
                    </Button_1.default>
                    <Button_1.default color="primary" onClick={function (e) { return _this.onMatchClick(); }}>
                        Match Search And Offer
                    </Button_1.default>
                </ButtonGroup_1.default>

                <div className="m-2 text-white">your id: {this.baseManager.getId()}</div>

                <Container_1.default className="h-100 align-items-center">
                    <div className="row h-100 justify-content-center align-items-center">
                        <Form_1.default>
                            <FormGroup_1.default>
                                <Row_1.default>
                                    <Col_1.default className="p-0" xs="1" sm="2">
                                        <Input_1.default value={'eth_address'} readOnly/>
                                    </Col_1.default>
                                    <Col_1.default className="p-0" xs="1" sm="5">
                                        <Input_1.default value={this.state.ethAddress || ''} placeholder="eth address" onChange={function (e) { return _this.onChangeEthAddress(e.target.value); }}/>
                                    </Col_1.default>
                                    <Col_1.default className="p-0" xs="1" sm="5">
                                        <Input_1.default value={this.state.ethSignature || ''} placeholder="signature" onChange={function (e) { return _this.onChangeEthSignature(e.target.value); }}/>
                                    </Col_1.default>
                                </Row_1.default>
                                <Row_1.default><p /></Row_1.default>
                                <Row_1.default>
                                    <Col_1.default xs="3" sm="3">
                                        <Button_1.default color="primary" onClick={function (e) { return _this.onSetEthSignature(); }}>
                                            Sign w/Web3
                                        </Button_1.default>
                                    </Col_1.default>
                                    <Col_1.default xs="3" sm="3">
                                        <Button_1.default color="primary" onClick={function (e) { return _this.onSetEthAddress(); }}>
                                            Set Single
                                        </Button_1.default>
                                    </Col_1.default>

                                    <Col_1.default xs="3" sm="3">
                                        <Button_1.default color="primary" onClick={function (e) { return _this.onVerifyWallets(); }}>
                                            Verify
                                        </Button_1.default>
                                    </Col_1.default>
                                    <Col_1.default xs="3" sm="3">
                                        <Button_1.default color="primary" onClick={function (e) { return _this.onSignWallets(); }}>
                                            Sign Wallets
                                        </Button_1.default>
                                    </Col_1.default>
                                </Row_1.default>
                                <Row_1.default><p /></Row_1.default>
                                <Row_1.default><p /></Row_1.default>
                            </FormGroup_1.default>
                            <FormGroup_1.default>
                                <Row_1.default>
                                    <Col_1.default className="p-0" xs="6" sm="4">
                                        <Input_1.default value={this.state.inputKey || ''} placeholder="key" onChange={function (e) { return _this.onChangeKey(e.target.value); }}/>
                                    </Col_1.default>
                                    <Col_1.default className="p-0" xs="6" sm="4">
                                        <Input_1.default value={this.state.inputValue || ''} placeholder="value" onChange={function (e) { return _this.onChangeValue(e.target.value); }}/>
                                    </Col_1.default>
                                    <Col_1.default sm="4">
                                        <Button_1.default color="primary" onClick={function (e) { return _this.onSetClick(); }}>
                                            Set
                                        </Button_1.default>
                                    </Col_1.default>
                                </Row_1.default>
                            </FormGroup_1.default>

                            <PairItemHolder_1.default name="Key:" value="Value:" onDeleteClick={null}/>
                            <SimplePairList_1.default data={this.state.clientData} onDeleteClick={null}/>
                            <Button_1.default color="primary" className="m-2 float-right" onClick={function (e) { return _this.onSaveClick(); }}>
                                Save
                            </Button_1.default>
                        </Form_1.default>
                    </div>
                </Container_1.default>
            </div>);
    };
    Dashboard.prototype.getDataList = function () {
        var _this = this;
        this.baseManager.loadClientData()
            .then(function (data) {
            try {
                _this.state.clientData = [];
                data.forEach(function (value, key) {
                    _this.state.clientData.push(new Pair_1.default(key, value));
                });
                _this.state.clientDataRefreshhTrigger = 1;
                _this.setState({ clientData: _this.state.clientData });
            }
            catch (e) {
                console.log(e);
            }
        }).catch(function (response) { return console.log('message: ' + JSON.stringify(response)); });
    };
    Dashboard.prototype.onChangeKey = function (key) {
        this.setState({ inputKey: key });
    };
    Dashboard.prototype.onChangeEthAddress = function (key) {
        this.setState({ ethAddress: key });
    };
    Dashboard.prototype.onChangeEthSignature = function (key) {
        this.setState({ ethSignature: key });
    };
    Dashboard.prototype.onChangeValue = function (value) {
        this.setState({ inputValue: value });
    };
    Dashboard.prototype.onLogoutClick = function () {
        this.baseManager.logout();
        var history = this.props.history;
        history.replace('/');
    };
    Dashboard.prototype.onDataPermissionsClick = function () {
        var history = this.props.history;
        history.push('permissions');
    };
    Dashboard.prototype.onResponsesClick = function () {
        var history = this.props.history;
        history.push('responses');
    };
    Dashboard.prototype.onCreateRequestClick = function () {
        var history = this.props.history;
        history.push('create-request');
    };
    Dashboard.prototype.onSearchRequestsClick = function () {
        var history = this.props.history;
        history.push('search-requests');
    };
    Dashboard.prototype.onOffersClick = function () {
        var history = this.props.history;
        history.push('offers');
    };
    Dashboard.prototype.onMatchClick = function () {
        var history = this.props.history;
        history.push('search-match');
    };
    Dashboard.prototype.onSaveClick = function () {
        var map = new Map();
        this.state.clientData.forEach(function (item) {
            map.set(item.key, item.value);
        });
        this.baseManager.saveData(map)
            .then(function (result) { return alert('data has been saved'); })
            .catch(function (e) { return alert('Something went wrong! data not saved! =(') + e; });
    };
    Dashboard.prototype.onSetEthAddress = function () {
        // alert('onSetEthAddress');
        var _a = this.state, ethAddress = _a.ethAddress, ethSignature = _a.ethSignature;
        if (ethAddress == null
            || ethAddress.trim().length === 0
            || ethAddress == null
            || ethAddress.trim().length === 0) {
            alert('The ethAddress must not be empty');
            return;
        }
        var pos = this.state.clientData.findIndex(function (model) { return model.key === 'eth_wallets'; });
        var newAddr = {
            'baseID': this.baseManager.getId(),
            'ethAddr': ethAddress
        };
        var newAddrRecord = {
            'data': JSON.stringify(newAddr),
            'sig': ethSignature
        };
        if (pos >= 0) {
            var wallets = JSON.parse(this.state.clientData[pos].value);
            wallets.data.push(newAddrRecord);
            wallets.sig = '';
            this.state.clientData[pos].value = JSON.stringify(wallets);
        }
        else {
            this.state.clientData.push(new Pair_1.default('eth_wallets', JSON.stringify({
                'data': [newAddrRecord],
                'sig': ''
            })));
            pos = this.state.clientData.length - 1;
        }
        // var msg = JSON.parse(this.state.clientData[pos].value);
        // var res = this.baseManager.getProfileManager().validateEthWallets(
        //     this.state.clientData[pos].key, msg, this.baseManager.getId());
        // alert(JSON.stringify(res));
        this.setState({ ethAddress: '', ethSignature: '' });
    };
    Dashboard.prototype.onVerifyWallets = function () {
        var pos = this.state.clientData.findIndex(function (model) { return model.key === 'eth_wallets'; });
        if (pos >= 0) {
            var msg = JSON.parse(this.state.clientData[pos].value);
            var res = this.baseManager.getProfileManager().validateEthWallets(this.state.clientData[pos].key, msg, this.baseManager.getId());
            alert(JSON.stringify(res));
        }
        else {
            alert('no eth_wallets found');
        }
    };
    Dashboard.prototype.onSignWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pos, msg, res, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pos = this.state.clientData.findIndex(function (model) { return model.key === 'eth_wallets'; });
                        if (!(pos >= 0)) return [3 /*break*/, 5];
                        msg = JSON.parse(this.state.clientData[pos].value);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.baseManager.getProfileManager().createEthWallets(msg.data, this.baseManager.getId())];
                    case 2:
                        res = _a.sent();
                        msg.sig = res.sig;
                        this.state.clientData[pos].value = JSON.stringify(msg);
                        alert('eth_wallets signed');
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        alert('exception in onSignWallets: ' + err_1);
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        alert('no eth_wallets found');
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Dashboard.prototype.onSetEthSignature = function () {
        return __awaiter(this, void 0, void 0, function () {
            var signingAddr, thisMessage, signedMessage, msg, params, method, sig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        signingAddr = '';
                        if (typeof web3 == 'undefined') {
                            alert('WEB3 is not detected');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, web3.eth.getAccounts(function (err, res) {
                                console.log(res[0]);
                                signingAddr = res[0];
                            })];
                    case 1:
                        _a.sent();
                        if ((signingAddr == '') || (signingAddr == undefined)) {
                            alert('Can not detect ETH address from WEB3 provider.\nPlease login');
                            return [2 /*return*/];
                        }
                        //always use lower casse for addresses
                        signingAddr = signingAddr.toLowerCase();
                        thisMessage = JSON.stringify({
                            'baseID': this.baseManager.getId(),
                            'ethAddr': signingAddr
                        });
                        signedMessage = '';
                        if (!(typeof web3 != 'undefined')) return [3 /*break*/, 3];
                        msg = ethUtil.bufferToHex(new Buffer(thisMessage, 'utf8'));
                        params = [msg, signingAddr];
                        method = 'personal_sign';
                        return [4 /*yield*/, web3.currentProvider.sendAsync({
                                method: method,
                                params: params,
                                signingAddr: signingAddr,
                            }, function (err, result) {
                                // if (err) return $scope.notifier.danger(err)
                                // if (result.error) return $scope.notifier.danger(result.error)
                                sig = result.result;
                                signedMessage = JSON.stringify({
                                    address: signingAddr,
                                    msg: thisMessage,
                                    sig: sig,
                                    version: '3',
                                    signer: 'web3'
                                }, null, 2);
                                // alert('Successfully Signed Message with ' + signingAddr + signedMessage);
                                g_Dashboard.setState({ ethSignature: sig });
                                g_Dashboard.setState({ ethAddress: signingAddr });
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Dashboard.prototype.onSetClick = function () {
        var _a = this.state, inputKey = _a.inputKey, inputValue = _a.inputValue;
        if (inputKey == null
            || inputKey.trim().length === 0
            || inputValue == null
            || inputValue.trim().length === 0) {
            alert('The key and value must not be empty');
            return;
        }
        var pos = this.state.clientData.findIndex(function (model) { return model.key === inputKey; });
        if (pos >= 0) {
            this.state.clientData[pos].value = inputValue;
        }
        else {
            this.state.clientData.push(new Pair_1.default(inputKey, inputValue));
        }
        this.setState({ inputKey: '', inputValue: '' });
    };
    Dashboard.prototype.onDeleteClick = function (key) {
        this.state.clientData = this.state.clientData.filter(function (model) { return model.key !== key; });
        this.setState({});
    };
    __decorate([
        Injections_1.lazyInject(BaseManager_1.default)
    ], Dashboard.prototype, "baseManager", void 0);
    return Dashboard;
}(React.Component));
exports.default = Dashboard;
