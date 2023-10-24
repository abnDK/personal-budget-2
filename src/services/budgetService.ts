import { Budget } from "../models/1.3/budget";
const pool = require("../configs/queries");
const CustomError = require("../utils/errors/CustomError");
const ErrorTextHelper = require("../utils/errors/Texthelper/textHelper");

// ("use strict"); // CAN WE DELETE THIS? Commented out since 24/10-2023

class BudgetService {
    static async getBudgets(): Promise<Array<Budget>> {
        // get Budgets in database
        let data = await pool
            .query("SELECT * FROM budget ORDER BY id ASC")
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // make budgets array
        let budgets = data.rows.map(function (res: any) {
            return new Budget(
                res.name,
                res.date_start,
                res.date_end,
                parseInt(res.id)
            );
        });

        return budgets;
    }

    static async getBudgetById(id: number): Promise<Budget> {
        // get Budget in database
        let data = await pool
            .query("SELECT * FROM budget WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data.rowCount === 0) {
            throw new CustomError(
                ErrorTextHelper.get("BUDGET.READ.ERROR.INVALIDID"),
                404
            );
        }

        // init budget as Budget object
        let budget_in_array = data.rows.map(function (res: any) {
            return new Budget(
                res.name,
                res.date_start,
                res.date_end,
                parseInt(res.id)
            );
        });

        let budget = budget_in_array[0];

        return budget;
    }

    static async createBudget(
        name: string,
        date_start: Date,
        date_end: Date
    ): Promise<Budget> {
        // create budget
        let data_budget = await pool
            .query(
                "INSERT INTO budget (name, date_start, date_end) VALUES ($1, $2, $3) RETURNING *",
                [name, date_start, date_end]
            )
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data_budget.rowCount === 0) {
            throw new CustomError(
                ErrorTextHelper.get("BUDGET.CREATE.ERROR.NOROWCREATED"),
                400
            );
        }

        // init budget object
        let budget = new Budget(
            data_budget.rows[0].name,
            data_budget.rows[0].date_start,
            data_budget.rows[0].date_end,
            data_budget.rows[0].id
        );

        // return budget object
        return budget;
    }

    static async deleteBudget(id: number): Promise<Budget> {
        // query db
        const to_be_deleted_budget_sql_object: any = await pool
            .query("SELECT * FROM budget WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // verify id only equals 1 budget
        if (to_be_deleted_budget_sql_object.rowCount === 0) {
            throw new CustomError(
                ErrorTextHelper.get("BUDGET.READ.ERROR.INVALIDID"),
                404
            );
        }

        // delete budget in db
        const deleted_budget_sql_object: {
            rows: Array<{
                name: string;
                date_start: Date;
                date_end: Date;
                id: number;
            }>;
        } = await pool
            .query("DELETE FROM budget WHERE id = $1 RETURNING *", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // create budget object
        const deleted_budget: Budget = new Budget(
            deleted_budget_sql_object["rows"][0].name,
            deleted_budget_sql_object["rows"][0].date_start,
            deleted_budget_sql_object["rows"][0].date_end,
            deleted_budget_sql_object["rows"][0].id
        );

        // send response
        return deleted_budget;
    }
}

module.exports = BudgetService;
