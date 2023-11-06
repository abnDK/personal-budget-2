var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Budget } from "../models/1.3/budget.js";
import { pool } from "../configs/queries.js";
import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
const ETH = new ErrorTextHelper();
// ("use strict"); // CAN WE DELETE THIS? Commented out since 24/10-2023
export class BudgetService {
    static getBudgets() {
        return __awaiter(this, void 0, void 0, function* () {
            // get Budgets in database
            let data = yield pool
                .query("SELECT * FROM budget ORDER BY id ASC")
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            // make budgets array
            let budgets = data.rows.map(function (res) {
                return new Budget(res.name, res.date_start, res.date_end, parseInt(res.id));
            });
            return budgets;
        });
    }
    static getBudgetById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // get Budget in database
            let data = yield pool
                .query("SELECT * FROM budget WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (data.rowCount === 0) {
                throw new CustomError(ETH.get("BUDGET.READ.ERROR.INVALIDID"), 404);
            }
            // init budget as Budget object
            let budget_in_array = data.rows.map(function (res) {
                return new Budget(res.name, res.date_start, res.date_end, parseInt(res.id));
            });
            let budget = budget_in_array[0];
            return budget;
        });
    }
    static createBudget(name, date_start, date_end) {
        return __awaiter(this, void 0, void 0, function* () {
            // create budget
            let data_budget = yield pool
                .query("INSERT INTO budget (name, date_start, date_end) VALUES ($1, $2, $3) RETURNING *", [name, date_start, date_end])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (data_budget.rowCount === 0) {
                throw new CustomError(ETH.get("BUDGET.CREATE.ERROR.NOROWCREATED"), 400);
            }
            // init budget object
            let budget = new Budget(data_budget.rows[0].name, data_budget.rows[0].date_start, data_budget.rows[0].date_end, data_budget.rows[0].id);
            // return budget object
            return budget;
        });
    }
    static deleteBudget(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // query db
            const to_be_deleted_budget_sql_object = yield pool
                .query("SELECT * FROM budget WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            // verify id only equals 1 budget
            if (to_be_deleted_budget_sql_object.rowCount === 0) {
                throw new CustomError(ETH.get("BUDGET.READ.ERROR.INVALIDID"), 404);
            }
            // delete budget in db
            const deleted_budget_sql_object = yield pool
                .query("DELETE FROM budget WHERE id = $1 RETURNING *", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            // create budget object
            const deleted_budget = new Budget(deleted_budget_sql_object["rows"][0].name, deleted_budget_sql_object["rows"][0].date_start, deleted_budget_sql_object["rows"][0].date_end, deleted_budget_sql_object["rows"][0].id);
            // send response
            return deleted_budget;
        });
    }
}
