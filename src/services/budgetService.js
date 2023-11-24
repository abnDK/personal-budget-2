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
import { Budget } from "../models/1.4/budget.js";
import { BudgetFactory } from "./budgetFactory.js";
import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
import { pool } from "../configs/queries.js";
import { MOCKBUDGETS } from "../test/1.4/TestData/budgetMockData.js";
// setting up text helper for error messages
const ETH = new ErrorTextHelper();
export const BudgetService = {
    getBudgets() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("hello from BudgetService.getBudgets");
            return MOCKBUDGETS;
            // return mock data while testing - remove after implementation
            return [
                new Budget("testbudget_a", new Date(2023, 0, 1), "ABN", 1),
                new Budget("testbudget_b", new Date(2023, 0, 1), "ABN", 2),
            ];
            let data = yield pool
                .query("SELECT * FROM budget ORDER BY id ASC")
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            console.log(data.fields);
            console.log(data.command);
            let budgets = data.rows.map(function (res) {
                return new Budget(res.name, res.create_date, res.owner_name, res.id);
            });
            return budgets;
        });
    },
    getBudgetById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return MOCKBUDGETS.filter((budget) => budget.id == id)[0];
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
                return new Budget(res.name, res.create_date, res.owner_name, res.id);
            })[0];
            return budget;
        });
    },
    createBudget(name, createDate, ownerName) {
        return __awaiter(this, void 0, void 0, function* () {
            MOCKDB_BUDGET.push({
                name: name,
                createDate: createDate,
                ownerName: ownerName,
                id: 1,
            });
            return MOCKDB_BUDGET[0];
            // create budget
            let data_budget = yield pool
                .query("INSERT INTO budget (name, date_start, date_end) VALUES ($1, $2, $3) RETURNING *", [name, createDate, ownerName])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (data_budget.rowCount === 0) {
                throw new CustomError(ETH.get("BUDGET.CREATE.ERROR.NOROWCREATED"), 400);
            }
            // init budget object
            let budget = new Budget(data_budget.rows[0].name, data_budget.rows[0].create_date, data_budget.rows[0].owner_name, data_budget.rows[0].id);
            // return budget object
            return budget;
        });
    },
    updateBudget(id, name, ownerName) {
        return __awaiter(this, void 0, void 0, function* () {
            const newBudgetResponse = yield pool
                .query("UPDATE budget SET name = $2, owner_name = $3 WHERE id = $1 RETURNING *", [id, name, ownerName])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (newBudgetResponse.rowCount === 0) {
                throw new CustomError(ETH.get("BUDGET.UPDATE.ERROR.INVALIDID"), 404);
            }
            return newBudgetResponse.rows[0];
        });
    },
    deleteBudgetById(id) {
        return __awaiter(this, void 0, void 0, function* () {
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
