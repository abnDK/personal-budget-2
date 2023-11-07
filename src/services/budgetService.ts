// MUST BE UPDATED TO RUN WITH 1.4

import { IBudget } from "../models/1.4/budget";
import { BudgetFactory } from "./budgetFactory.js";

import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
import { pool } from "../configs/queries.js";

// setting up text helper for error messages
const ETH = new ErrorTextHelper();

interface IBudgetService {
    getBudgets(): Promise<IBudget[] | undefined>;
    getBudgetById(id: number): Promise<IBudget | undefined>;
    createBudget(
        name: string,
        create_date: Date,
        owner_name: string
    ): Promise<IBudget>;
    deleteBudgetById(id: number): Promise<boolean>;
}

export const BudgetService: IBudgetService = {
    async getBudgets(): Promise<IBudget[] | undefined> {
        let data = await pool
            .query("SELECT * FROM budget ORDER BY id ASC")
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        let budgets: IBudget[] = data.rows.map(function (res: any) {
            return {
                id: parseInt(res.id),
                name: res.name,
                create_date: res.create_date,
            };
        });

        return budgets;
    },

    async getBudgetById(id: number): Promise<IBudget | undefined> {
        // get Budget in database
        let data = await pool
            .query("SELECT * FROM budget WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data.rowCount === 0) {
            throw new CustomError(ETH.get("BUDGET.READ.ERROR.INVALIDID"), 404);
        }

        const budget: IBudget = data.rows[0].map(function (res: any) {
            return {
                id: parseInt(res.id),
                name: res.name,
                create_date: res.create_date,
            };
        })[0];

        return budget;
    },

    async createBudget(
        name: string,
        create_date: Date,
        owner_name: string
    ): Promise<IBudget> {
        // create budget
        let data_budget = await pool
            .query(
                "INSERT INTO budget (name, date_start, date_end) VALUES ($1, $2, $3) RETURNING *",
                [name, create_date, owner_name]
            )
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data_budget.rowCount === 0) {
            throw new CustomError(
                ETH.get("BUDGET.CREATE.ERROR.NOROWCREATED"),
                400
            );
        }

        // init budget object
        let budget: IBudget = BudgetFactory(
            data_budget.rows[0].id,
            data_budget.rows[0].name,
            data_budget.rows[0].create_date,
            data_budget.rows[0].owner_name
        );

        // return budget object
        return budget;
    },

    async deleteBudgetById(id: number): Promise<boolean> {
        // query db
        const to_be_deleted_budget_sql_object: any = await pool
            .query("SELECT * FROM budget WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // verify id only equals 1 budget
        if (to_be_deleted_budget_sql_object.rowCount === 0) {
            throw new CustomError(ETH.get("BUDGET.READ.ERROR.INVALIDID"), 404);
        }

        // delete budget in db and return true if one and only one budget with correct id has been deleted
        const deleted_budget_sql_object: {
            rows: Array<{
                id: number;
                name: string;
                create_date: Date;
                owner_name: string;
            }>;
            rowCount: number;
        } = await pool
            .query("DELETE FROM budget WHERE id = $1 RETURNING *", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (
            deleted_budget_sql_object.rowCount === 1 &&
            deleted_budget_sql_object["rows"][0].id == id
        ) {
            return true;
        }

        return false;
    },
};
