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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var category_1 = require("../models/1.3/category");
var transaction_1 = require("../models/1.3/transaction");
var pool = require('../configs/queries');
var TransactionService = /** @class */ (function () {
    function TransactionService() {
    }
    // service will get models/dataclasses
    // service will call db service
    // service will return array of class type xyz
    // service will be called by router (API)
    // i.e. GET request goes through transactionService which in turn calls the databaseService, that gets the data. transactionService then packs the data in i.e. an array and returns to route as response.
    /**
     *  FIGURE OUT HOW TO PORT THIS INTO A (REQ, RES) KINDA FUNCTION FOR USE WITH ROUTER.
     */
    TransactionService.getTransactions = function (startDate, endDate, category) {
        return __awaiter(this, void 0, void 0, function () {
            var data, transactions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pool.query('SELECT * FROM transaction ORDER BY id ASC')
                        // build array of transactions
                    ];
                    case 1:
                        data = _a.sent();
                        transactions = data.rows.map(function (res) { return new transaction_1.Transaction(parseInt(res.id), res.name, res.amount, res.date); });
                        // filter transactions
                        if (startDate) {
                            transactions = transactions.filter(function (trans) { return trans.date >= startDate; });
                            if (endDate) {
                                transactions = transactions.filter(function (trans) { return trans.date <= endDate; });
                                if (startDate > endDate) {
                                    throw new RangeError('endDate cannot be before startDate');
                                }
                            }
                        }
                        if (category) {
                            transactions = transactions.filter(function (trans) { return trans.category !== undefined; });
                            transactions = transactions.filter(function (trans) { return trans.category.name == category.name; });
                        }
                        return [2 /*return*/, transactions];
                }
            });
        });
    };
    TransactionService.getTransactionById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var data, transaction_in_array, transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pool.query('SELECT * FROM transaction WHERE id = $1', [id])
                        // init transaction as Transaction object
                    ];
                    case 1:
                        data = _a.sent();
                        transaction_in_array = data.rows.map(function (res) { return new transaction_1.Transaction(parseInt(res.id), res.name, res.amount, res.date); });
                        transaction = transaction_in_array[0];
                        // if transaction unknown / id not known
                        if (transaction == undefined) {
                            throw new Error('Id not known');
                        }
                        return [2 /*return*/, transaction];
                }
            });
        });
    };
    TransactionService.createTransaction = function (name, amount, date, category_id) {
        return __awaiter(this, void 0, void 0, function () {
            var category, data_category, data_trans, transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!category_id) return [3 /*break*/, 1];
                        category_id = undefined;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, pool.query('SELECT * FROM category WHERE id = $1', [category_id])];
                    case 2:
                        data_category = _a.sent();
                        if (!data_category.rows.length) {
                            throw new Error('category_id unknown - please provide valid id instead');
                        }
                        else if (data_category.rows.length > 1) {
                            throw new Error('More than one category with same id should not be possible...');
                        }
                        else {
                            category = new category_1.Category(data_category.rows[0].name, data_category.rows[0].amount);
                        }
                        _a.label = 3;
                    case 3: return [4 /*yield*/, pool.query('INSERT INTO transaction (name, amount, date, category_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, amount, date, category_id])];
                    case 4:
                        data_trans = _a.sent();
                        // verify only 1 transaction has been created and returned from db
                        if (!data_trans.rows.length) {
                            throw new Error('no new transaction has been created, for some reason?');
                        }
                        else if (data_trans.rows.length > 1) {
                            console.log(data_trans.rows);
                            throw new Error('more than one transaction has been created in db. Something is not right...');
                        }
                        transaction = new transaction_1.Transaction(data_trans.rows[0].id, data_trans.rows[0].name, data_trans.rows[0].amount, data_trans.rows[0].date);
                        transaction.category = category;
                        // return transaction object
                        return [2 /*return*/, transaction];
                }
            });
        });
    };
    TransactionService.deleteTransaction = function (delete_id) {
        return __awaiter(this, void 0, void 0, function () {
            var id, to_be_deleted_transaction_sql_object, deleted_transaction_sql_object, deleted_transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = parseInt(delete_id);
                        return [4 /*yield*/, pool.query('SELECT * FROM transaction WHERE id = $1', [id])
                            // verify id only equals 1 transaction 
                        ];
                    case 1:
                        to_be_deleted_transaction_sql_object = _a.sent();
                        // verify id only equals 1 transaction 
                        if (to_be_deleted_transaction_sql_object['rows'].length === 0) {
                            throw new Error('id unknown');
                        }
                        if (to_be_deleted_transaction_sql_object['rows'].length > 1) {
                            throw new Error('Multiple rows to be deleted - id should be unique');
                        }
                        return [4 /*yield*/, pool.query('DELETE FROM transaction WHERE id = $1 RETURNING *', [id])
                            // create Transaction object
                        ];
                    case 2:
                        deleted_transaction_sql_object = _a.sent();
                        deleted_transaction = new transaction_1.Transaction(deleted_transaction_sql_object['rows'][0].id, deleted_transaction_sql_object['rows'][0].name, deleted_transaction_sql_object['rows'][0].amount, deleted_transaction_sql_object['rows'][0].date);
                        // send response
                        return [2 /*return*/, deleted_transaction];
                }
            });
        });
    };
    return TransactionService;
}());
module.exports = TransactionService;
