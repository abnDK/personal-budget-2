"use strict";
// REWRITE FROM TRANSACTION TO CATEGORY
// DONE?
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
var budget_1 = require("../models/1.3/budget");
var pool = require('../configs/queries');
var BudgetService = /** @class */ (function () {
    function BudgetService() {
    }
    BudgetService.getBudgets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, budgets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pool.query('SELECT * FROM budget ORDER BY id ASC')
                        // make budgets array
                    ];
                    case 1:
                        data = _a.sent();
                        budgets = data.rows.map(function (res) { return new budget_1.Budget(res.name, res.date_start, res.date_end, parseInt(res.id)); });
                        return [2 /*return*/, budgets];
                }
            });
        });
    };
    BudgetService.getBudgetById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var data, budget_in_array, budget;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pool.query('SELECT * FROM budget WHERE id = $1', [id])
                        // init budget as Budget object
                    ];
                    case 1:
                        data = _a.sent();
                        budget_in_array = data.rows.map(function (res) { return new budget_1.Budget(res.name, res.date_start, res.date_end, parseInt(res.id)); });
                        budget = budget_in_array[0];
                        // if budget unknown / id not known
                        if (budget == undefined) {
                            throw new Error('Id not known');
                        }
                        return [2 /*return*/, budget];
                }
            });
        });
    };
    BudgetService.createBudget = function (name, date_start, date_end) {
        return __awaiter(this, void 0, void 0, function () {
            var data_budget, budget;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pool.query('INSERT INTO budget (name, date_start, date_end) VALUES ($1, $2, $3) RETURNING *', [name, date_start, date_end])];
                    case 1:
                        data_budget = _a.sent();
                        // verify only 1 budget has been created and returned from db
                        if (!data_budget.rows.length) {
                            throw new Error('no new budget has been created, for some reason?'); // WILL THIS ERROR BE THROWN WHEN QUERING DB?
                        }
                        else if (data_budget.rows.length > 1) {
                            console.log(data_budget.rows);
                            throw new Error('more than one budget has been created in db. Something is not right...');
                        }
                        budget = new budget_1.Budget(data_budget.rows[0].name, data_budget.rows[0].date_start, data_budget.rows[0].date_end, data_budget.rows[0].id);
                        // return transaction object
                        return [2 /*return*/, budget];
                }
            });
        });
    };
    BudgetService.deleteBudget = function (delete_id) {
        return __awaiter(this, void 0, void 0, function () {
            var id, to_be_deleted_budget_sql_object, deleted_budget_sql_object, deleted_budget;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = parseInt(delete_id);
                        return [4 /*yield*/, pool.query('SELECT * FROM budget WHERE id = $1', [id])
                            // verify id only equals 1 transaction 
                        ];
                    case 1:
                        to_be_deleted_budget_sql_object = _a.sent();
                        // verify id only equals 1 transaction 
                        if (to_be_deleted_budget_sql_object['rows'].length === 0) {
                            throw new Error('id unknown');
                        }
                        if (to_be_deleted_budget_sql_object['rows'].length > 1) {
                            throw new Error('Multiple rows to be deleted - id should be unique');
                        }
                        return [4 /*yield*/, pool.query('DELETE FROM budget WHERE id = $1 RETURNING *', [id])
                            // create Transaction object
                        ];
                    case 2:
                        deleted_budget_sql_object = _a.sent();
                        deleted_budget = new budget_1.Budget(deleted_budget_sql_object['rows'][0].name, deleted_budget_sql_object['rows'][0].date_start, deleted_budget_sql_object['rows'][0].date_end, deleted_budget_sql_object['rows'][0].id);
                        // send response
                        return [2 /*return*/, deleted_budget];
                }
            });
        });
    };
    return BudgetService;
}());
module.exports = BudgetService;
