"use strict";
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
var Config_1 = require("../Config");
var inversify_1 = require("inversify");
require("reflect-metadata");
var bitclave_base_1 = require("bitclave-base");
var BaseManager = (function () {
    function BaseManager() {
        this.base = new bitclave_base_1.default(Config_1.default.getBaseEndPoint(), location.hostname);
        console.log('your host name:', location.hostname);
    }
    BaseManager.prototype.changeStrategy = function (strategy) {
        this.base.changeStrategy(strategy);
    };
    BaseManager.prototype.signUp = function (mnemonicPhrase) {
        var _this = this;
        return this.getUniqueMessageForSigFromServerSide()
            .then(function (uniqueMessage) { return _this.base.accountManager.registration(mnemonicPhrase, uniqueMessage); })
            .then(this.sendAccountToServerSide.bind(this))
            .then(function (account) { return _this.account = account; });
    };
    BaseManager.prototype.signIn = function (mnemonicPhrase) {
        var _this = this;
        return this.getUniqueMessageForSigFromServerSide()
            .then(function (uniqueMessage) { return _this.base.accountManager.checkAccount(mnemonicPhrase, uniqueMessage); })
            .then(this.sendAccountToServerSide.bind(this))
            .then(function (account) { return _this.account = account; });
    };
    BaseManager.prototype.getUniqueMessageForSigFromServerSide = function () {
        return new Promise(function (resolve) {
            var text = '';
            var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 0; i < 64; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            console.log('unique message from server side:', text);
            resolve(text);
        });
    };
    BaseManager.prototype.sendAccountToServerSide = function (account) {
        return new Promise(function (resolve) {
            console.log('account for server side: ', account);
            resolve(account);
        });
    };
    BaseManager.prototype.getNewMnemonic = function () {
        return this.base.accountManager.getNewMnemonic()
            .then(function (phrase) { return phrase; });
    };
    BaseManager.prototype.unsubscribe = function (mnemonicPhrase) {
        var _this = this;
        return this.base.accountManager.unsubscribe(mnemonicPhrase)
            .then(function (account) { return _this.account = account; });
    };
    BaseManager.prototype.getOfferManager = function () {
        return this.base.offerManager;
    };
    BaseManager.prototype.getProfileManager = function () {
        return this.base.profileManager;
    };
    BaseManager.prototype.getSearchManager = function () {
        return this.base.searchManager;
    };
    BaseManager.prototype.getDataReuqestManager = function () {
        return this.base.dataRequestManager;
    };
    BaseManager.prototype.getId = function () {
        return this.account ? this.account.publicKey : 'undefined';
    };
    BaseManager.prototype.loadClientData = function () {
        return this.base.profileManager.getData();
    };
    BaseManager.prototype.saveData = function (data) {
        return this.base.profileManager.updateData(data);
    };
    BaseManager.prototype.decryptRequestFields = function (senderPk, encryptedData) {
        return this.base.dataRequestManager.decryptMessage(senderPk, encryptedData);
    };
    BaseManager.prototype.getClientRawData = function (clientPk) {
        return this.base.profileManager.getRawData(clientPk);
    };
    BaseManager.prototype.getAuthorizedData = function (recipientPk, encryptedData) {
        return this.base.profileManager.getAuthorizedData(recipientPk, encryptedData);
    };
    BaseManager.prototype.getAlreadyRequestedPermissions = function (recipientPk) {
        return this.base.dataRequestManager.getRequestedPermissions(recipientPk);
    };
    BaseManager.prototype.requestPermissions = function (recipientPk, fields) {
        return this.base.dataRequestManager.requestPermissions(recipientPk, fields);
    };
    BaseManager.prototype.shareDataForOffer = function (offer) {
        var fields = [];
        offer.compare.forEach(function (value, key) {
            fields.push(key.toString().toLowerCase());
        });
        return this.base.dataRequestManager.grantAccessForOffer(offer.id, offer.owner, fields);
    };
    BaseManager.prototype.grandPermissions = function (from, fields) {
        return __awaiter(this, void 0, void 0, function () {
            var grantedFields, accessFields;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        grantedFields = fields;
                        //get old granted permissions
                        // const grantedFields = await this.base.dataRequestManager.getGrantedPermissionsToMe(from);
                        //
                        // fields.forEach(value => {
                        //     if (grantedFields.indexOf(value) === -1) {
                        //         grantedFields.push(value);
                        //     }
                        // });
                        console.log('new', grantedFields);
                        accessFields = new Map();
                        grantedFields.forEach(function (value) {
                            accessFields.set(value, bitclave_base_1.AccessRight.R);
                        });
                        return [4 /*yield*/, this.base.dataRequestManager.grantAccessForClient(from, accessFields)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, grantedFields];
                }
            });
        });
    };
    BaseManager.prototype.getRequests = function (fromPk, toPk) {
        return this.base.dataRequestManager.getRequests(fromPk, toPk);
    };
    BaseManager.prototype.logout = function () {
        this.account = null;
    };
    BaseManager = __decorate([
        inversify_1.injectable()
    ], BaseManager);
    return BaseManager;
}());
exports.default = BaseManager;
