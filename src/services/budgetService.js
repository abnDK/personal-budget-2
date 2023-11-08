// MUST BE UPDATED TO RUN WITH 1.4
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { IBudget } from "../models/1.4/budget";
import { BudgetFactory } from "./budgetFactory.js";
import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
import { pool } from "../configs/queries.js";
// setting up text helper for error messages
const ETH = new ErrorTextHelper();
export const BudgetService = {
    getBudgets() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield pool
                .query("SELECT * FROM budget ORDER BY id ASC")
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            let budgets = data.rows.map(function (res) {
                return {
                    id: parseInt(res.id),
                    name: res.name,
                    create_date: res.create_date,
                };
            });
            return budgets;
        });
    },
    getBudgetById(id) {
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
            const budget = data.rows[0].map(function (res) {
                return {
                    id: parseInt(res.id),
                    name: res.name,
                    create_date: res.create_date,
                };
            })[0];
            return budget;
        });
    },
    createBudget(name, create_date, owner_name) {
        return __awaiter(this, void 0, void 0, function* () {
            // create budget
            let data_budget = yield pool
                .query("INSERT INTO budget (name, date_start, date_end) VALUES ($1, $2, $3) RETURNING *", [name, create_date, owner_name])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (data_budget.rowCount === 0) {
                throw new CustomError(ETH.get("BUDGET.CREATE.ERROR.NOROWCREATED"), 400);
            }
            // init budget object
            let budget = BudgetFactory(data_budget.rows[0].id, data_budget.rows[0].name, data_budget.rows[0].create_date, data_budget.rows[0].owner_name);
            // return budget object
            return budget;
        });
    },
    deleteBudgetById(id) {
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
            // delete budget in db and return true if one and only one budget with correct id has been deleted
            const deleted_budget_sql_object = yield pool
                .query("DELETE FROM budget WHERE id = $1 RETURNING *", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (deleted_budget_sql_object.rowCount === 1 &&
                deleted_budget_sql_object["rows"][0].id == id) {
                return true;
            }
            return false;
        });
    },
};
