"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
exports.RequestHandler = void 0;
var http = require("http");
var https = require("https");
var common_utils_1 = require("../common/common-utils");
var logger_1 = require("../common/logger");
var RequestHandler = /** @class */ (function () {
    function RequestHandler(req, res, ssl, proxyConfig) {
        this.req = req;
        this.res = res;
        this.ssl = ssl;
        this.proxyConfig = proxyConfig;
        this.rOptions = common_utils_1.CommonUtils.getOptionsFromRequest(req, ssl, proxyConfig.externalProxy);
    }
    RequestHandler.prototype.go = function () {
        return __awaiter(this, void 0, void 0, function () {
            var proxyRequestPromise, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setKeepAlive();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.interceptRequest()];
                    case 2:
                        _b.sent();
                        if (this.res.finished) {
                            return [2 /*return*/];
                        }
                        proxyRequestPromise = this.getProxyRequestPromise();
                        // Wait for proxy to process the full request
                        _a = this;
                        return [4 /*yield*/, proxyRequestPromise];
                    case 3:
                        // Wait for proxy to process the full request
                        _a.proxyRes = _b.sent();
                        if (this.res.finished) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.interceptResponse()];
                    case 4:
                        _b.sent();
                        if (this.res.finished) {
                            return [2 /*return*/];
                        }
                        this.sendHeadersAndPipe();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        if (!this.res.finished) {
                            this.res.writeHead(500);
                            this.res.write("Proxy Warning:\n\n " + error_1.toString());
                            this.res.end();
                        }
                        logger_1.logError(error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    RequestHandler.prototype.sendHeadersAndPipe = function () {
        var _this = this;
        if (this.res.headersSent)
            return;
        if (!this.proxyRes)
            common_utils_1.makeErr('No proxy res');
        var proxyRes = this.proxyRes;
        // prevent duplicate set headers
        Object.keys(proxyRes.headers).forEach(function (key) {
            var headerName = key;
            var headerValue = proxyRes.headers[headerName];
            if (headerValue) {
                // https://github.com/nodejitsu/node-http-proxy/issues/362
                if (/^www-authenticate$/i.test(key)) {
                    if (proxyRes.headers[headerName]) {
                        // @ts-ignore
                        proxyRes.headers[headerName] =
                            headerValue && typeof headerValue === 'string' && headerValue.split(',');
                    }
                    headerName = 'www-authenticate';
                }
                _this.res.setHeader(headerName, headerValue);
            }
        });
        if (proxyRes.statusCode)
            this.res.writeHead(proxyRes.statusCode);
        proxyRes.pipe(this.res);
    };
    RequestHandler.prototype.getProxyRequestPromise = function () {
        var _this = this;
        var self = this;
        return new Promise(function (resolve, reject) {
            _this.rOptions.host = _this.rOptions.hostname || _this.rOptions.host || 'localhost';
            // use the binded socket for NTLM
            if (_this.rOptions.agent &&
                _this.rOptions.customSocketId != null &&
                _this.rOptions.agent.getName) {
                var socketName = _this.rOptions.agent.getName(_this.rOptions);
                var bindingSocket = _this.rOptions.agent.sockets[socketName];
                if (bindingSocket && bindingSocket.length > 0) {
                    bindingSocket[0].once('free', onFree);
                    return;
                }
            }
            onFree();
            function onFree() {
                self.proxyReq = (self.rOptions.protocol === 'https:' ? https : http).request(self.rOptions, function (proxyRes) {
                    resolve(proxyRes);
                });
                self.proxyReq.on('timeout', function () {
                    reject(new Error(self.rOptions.host + ":" + self.rOptions.port + ", request timeout"));
                });
                self.proxyReq.on('error', function (e) {
                    reject(e);
                });
                self.proxyReq.on('aborted', function () {
                    reject(new Error('proxy server aborted the request'));
                    // TODO: Check if it's ok
                    // @ts-ignore
                    self.req.abort();
                });
                self.req.on('aborted', function () {
                    var _a;
                    // eslint-disable-next-line no-unused-expressions
                    (_a = self.proxyReq) === null || _a === void 0 ? void 0 : _a.abort();
                });
                self.req.pipe(self.proxyReq);
            }
        });
    };
    RequestHandler.prototype.interceptRequest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var next = function () {
                            resolve();
                        };
                        try {
                            if (typeof _this.proxyConfig.requestInterceptor === 'function') {
                                // const connectKey = `${this.req.socket.remotePort}:${this.req.socket.localPort}`;
                                _this.proxyConfig.requestInterceptor.call(null, _this.rOptions, _this.req, _this.res, _this.ssl, next);
                            }
                            else {
                                resolve();
                            }
                        }
                        catch (error) {
                            reject(error);
                        }
                    })];
            });
        });
    };
    RequestHandler.prototype.interceptResponse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b;
                        var next = function () {
                            resolve();
                        };
                        try {
                            if (typeof _this.proxyConfig.responseInterceptor === 'function') {
                                _this.proxyConfig.responseInterceptor.call(null, _this.req, _this.res, (_a = _this.proxyReq) !== null && _a !== void 0 ? _a : common_utils_1.makeErr('No proxyReq'), (_b = _this.proxyRes) !== null && _b !== void 0 ? _b : common_utils_1.makeErr('No proxyRes'), _this.ssl, next);
                            }
                            else {
                                resolve();
                            }
                        }
                        catch (error) {
                            reject(error);
                        }
                    })];
            });
        });
    };
    RequestHandler.prototype.setKeepAlive = function () {
        if (this.rOptions.headers.connection === 'close') {
            this.req.socket.setKeepAlive(false);
        }
        else if (this.rOptions.customSocketId != null) {
            // for NTLM
            this.req.socket.setKeepAlive(true, 60 * 60 * 1000);
        }
        else {
            this.req.socket.setKeepAlive(true, 30000);
        }
    };
    return RequestHandler;
}());
exports.RequestHandler = RequestHandler;
//# sourceMappingURL=request-handler.js.map