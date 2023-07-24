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
var pool = require('../configs/queries');
var CategoryService = /** @class */ (function () {
    function CategoryService() {
    }
    CategoryService.getCategories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, categories;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pool.query('SELECT * FROM category ORDER BY id ASC')
                        // make categories array
                    ];
                    case 1:
                        data = _a.sent();
                        categories = data.rows.map(function (res) { return new category_1.Category(res.name, res.amount, parseInt(res.id), parseInt(res.parent_id), parseInt(res.budget_id)); });
                        return [2 /*return*/, categories];
                }
            });
        });
    };
    CategoryService.getCategoryById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var data, category_in_array, category;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pool.query('SELECT * FROM category WHERE id = $1', [id])
                        // init budget as Budget object
                    ];
                    case 1:
                        data = _a.sent();
                        category_in_array = data.rows.map(function (res) { return new category_1.Category(res.name, res.amount, res.id, res.parent_id, res.budget_id); });
                        category = category_in_array[0];
                        // if budget unknown / id not known
                        if (category == undefined) {
                            throw new Error('Id not known');
                        }
                        return [2 /*return*/, category];
                }
            });
        });
    };
    CategoryService.createCategory = function (name, amount, parent_id, budget_id) {
        return __awaiter(this, void 0, void 0, function () {
            var data_category, category;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pool.query('INSERT INTO category (name, amount, parent_id, budget_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, amount, parent_id, budget_id])];
                    case 1:
                        data_category = _a.sent();
                        // verify only 1 budget has been created and returned from db
                        if (!data_category.rows.length) {
                            throw new Error('no new category has been created, for some reason?'); // WILL THIS ERROR BE THROWN WHEN QUERING DB?
                        }
                        else if (data_category.rows.length > 1) {
                            console.log(data_category.rows);
                            throw new Error('more than one category has been created in db. Something is not right...');
                        }
                        category = new category_1.Category(data_category.rows[0].name, data_category.rows[0].amount, data_category.rows[0].id, data_category.rows[0].parent_id, data_category.rows[0].budget_id);
                        // return category object
                        return [2 /*return*/, category];
                }
            });
        });
    };
    CategoryService.deleteCategory = function (delete_id) {
        return __awaiter(this, void 0, void 0, function () {
            var id, to_be_deleted_category_sql_object, deleted_category_sql_object, deleted_category;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = parseInt(delete_id);
                        return [4 /*yield*/, pool.query('SELECT * FROM category WHERE id = $1', [id])
                            // verify id only equals 1 category 
                        ];
                    case 1:
                        to_be_deleted_category_sql_object = _a.sent();
                        // verify id only equals 1 category 
                        if (to_be_deleted_category_sql_object['rows'].length === 0) {
                            throw new Error('id unknown');
                        }
                        if (to_be_deleted_category_sql_object['rows'].length > 1) {
                            throw new Error('Multiple rows to be deleted - id should be unique');
                        }
                        return [4 /*yield*/, pool.query('DELETE FROM category WHERE id = $1 RETURNING *', [id])
                            // create category object
                        ];
                    case 2:
                        deleted_category_sql_object = _a.sent();
                        deleted_category = new category_1.Category(deleted_category_sql_object['rows'][0].name, deleted_category_sql_object['rows'][0].amount, deleted_category_sql_object['rows'][0].id, deleted_category_sql_object['rows'][0].parent_id, deleted_category_sql_object['rows'][0].budget_id);
                        // send response
                        return [2 /*return*/, deleted_category];
                }
            });
        });
    };
    return CategoryService;
}());
module.exports = CategoryService;
