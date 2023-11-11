// MUST BE UPDATED TO RUN WITH 1.4

import { Budget } from "../models/1.4/budget.js";
import { BudgetFactory } from "./budgetFactory.js";

import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
import { pool } from "../configs/queries.js";

// setting up text helper for error messages
const ETH = new ErrorTextHelper();

interface IBudgetService {
    getBudgets(): Promise<Budget[]>;
    getBudgetById(id: number): Promise<Budget>;
    createBudget(
        name: string,
        create_date: Date,
        owner_name: string
    ): Promise<Budget>;
    updateBudget(
        id: number,
        name: string | undefined,
        ownerName: string | undefined
    ): Promise<Budget>;
    deleteBudgetById(id: number): Promise<boolean>;
}

export const BudgetService: IBudgetService = {
    async getBudgets(): Promise<Budget[]> {
        console.log("hello from BudgetService.getBudgets");

        // return mock data while testing - remove after implementation
        return [
            new Budget("testbudget_a", new Date(2023, 0, 1), "ABN", 1),
            new Budget("testbudget_b", new Date(2023, 0, 1), "ABN", 2),
        ];

        let data = await pool
            .query("SELECT * FROM budget ORDER BY id ASC")
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });
        console.log(data.fields);
        console.log(data.command);
        let budgets: Budget[] = data.rows.map(function (res: any) {
            return new Budget(
                res.name,
                res.create_date,
                res.owner_name,
                res.id
            );
        });

        return budgets;
    },

    async getBudgetById(id: number): Promise<Budget> {
        throw new Error("....error in service");
        // get Budget in database
        let data = await pool
            .query("SELECT * FROM budget WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data.rowCount === 0) {
            throw new CustomError(ETH.get("BUDGET.READ.ERROR.INVALIDID"), 404);
        }

        const budget: Budget = data.rows[0].map(function (res: any) {
            return new Budget(
                res.name,
                res.create_date,
                res.owner_name,
                res.id
            );
        })[0];

        return budget;
    },

    async createBudget(
        name: string,
        createDate: Date,
        ownerName: string
    ): Promise<Budget> {
        // create budget
        let data_budget = await pool
            .query(
                "INSERT INTO budget (name, date_start, date_end) VALUES ($1, $2, $3) RETURNING *",
                [name, createDate, ownerName]
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
        let budget: Budget = new Budget(
            data_budget.rows[0].name,
            data_budget.rows[0].create_date,
            data_budget.rows[0].owner_name,
            data_budget.rows[0].id
        );

        // return budget object
        return budget;
    },

    async updateBudget(
        id: number,
        name: string,
        ownerName: string
    ): Promise<Budget> {
        const newBudgetResponse = await pool
            .query(
                "UPDATE budget SET name = $2, owner_name = $3 WHERE id = $1 RETURNING *",
                [id, name, ownerName]
            )
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (newBudgetResponse.rowCount === 0) {
            throw new CustomError(
                ETH.get("BUDGET.UPDATE.ERROR.INVALIDID"),
                404
            );
        }

        return newBudgetResponse.rows[0];
    },

    async deleteBudgetById(id: number): Promise<boolean> {
        // delete budget in db and return true if one and only one budget with correct id has been deleted
        const deleted_budget_sql_object = await pool
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
