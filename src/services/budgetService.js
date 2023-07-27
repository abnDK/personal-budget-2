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
Object.defineProperty(exports, "__esModule", { value: true });
const budget_1 = require("../models/1.3/budget");
const pool = require('../configs/queries');
"use strict";
class BudgetService {
    static getBudgets() {
        return __awaiter(this, void 0, void 0, function* () {
            // get Budgets in database
            let data = yield pool.query('SELECT * FROM budget ORDER BY id ASC');
            // make budgets array
            let budgets = data.rows.map(function (res) {
                return new budget_1.Budget(res.name, res.date_start, res.date_end, parseInt(res.id));
            });
            return budgets;
        });
    }
    static getBudgetById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // get Budget in database
            let data = yield pool.query('SELECT * FROM budget WHERE id = $1', [id]);
            // init budget as Budget object
            let budget_in_array = data.rows.map(function (res) {
                return new budget_1.Budget(res.name, res.date_start, res.date_end, parseInt(res.id));
            });
            let budget = budget_in_array[0];
            // if budget unknown / id not known
            if (budget == undefined) {
                throw new Error('Id not known');
            }
            return budget;
        });
    }
    static createBudget(name, date_start, date_end) {
        return __awaiter(this, void 0, void 0, function* () {
            // create budget
            let data_budget = yield pool.query('INSERT INTO budget (name, date_start, date_end) VALUES ($1, $2, $3) RETURNING *', [name, date_start, date_end]);
            // verify only 1 budget has been created and returned from db
            if (!data_budget.rows.length) {
                throw new Error('no new budget has been created, for some reason?'); // WILL THIS ERROR BE THROWN WHEN QUERING DB?
            }
            else if (data_budget.rows.length > 1) {
                console.log(data_budget.rows);
                throw new Error('more than one budget has been created in db. Something is not right...');
            }
            // init budget object
            let budget = new budget_1.Budget(data_budget.rows[0].name, data_budget.rows[0].date_start, data_budget.rows[0].date_end, data_budget.rows[0].id);
            // return budget object
            return budget;
        });
    }
    static deleteBudget(delete_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO
            // - What to do if category fkeys to to_be_deleted budget?
            // --- deleted all
            // --- delete budget, and remove fkey rel on category
            // --- throw error, and delete category first (CURRENT CHOICE)
            // parse id
            const id = parseInt(delete_id);
            // query db
            const to_be_deleted_budget_sql_object = yield pool.query('SELECT * FROM budget WHERE id = $1', [id]);
            // verify id only equals 1 budget 
            if (to_be_deleted_budget_sql_object['rows'].length === 0) {
                throw new Error('id unknown');
            }
            if (to_be_deleted_budget_sql_object['rows'].length > 1) {
                throw new Error('Multiple rows to be deleted - id should be unique');
            }
            // delete budget in db
            const deleted_budget_sql_object = yield pool.query('DELETE FROM budget WHERE id = $1 RETURNING *', [id]);
            // create budget object
            const deleted_budget = new budget_1.Budget(deleted_budget_sql_object['rows'][0].name, deleted_budget_sql_object['rows'][0].date_start, deleted_budget_sql_object['rows'][0].date_end, deleted_budget_sql_object['rows'][0].id);
            // send response
            return deleted_budget;
        });
    }
}
module.exports = BudgetService;
