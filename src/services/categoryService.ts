// THIS IS THE 1.3 VERSION
// MUST BE UPDATED TO RUN WITH 1.4

import { Category } from "../models/1.3/category.js";
import { pool } from "../configs/queries.js";
import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
const ETH = new ErrorTextHelper();

export class CategoryService {
    static async getCategories(): Promise<Array<Category>> {
        // get Budgets in database
        let data = await pool
            .query("SELECT * FROM category ORDER BY id ASC")
            .catch((err: Error) => {
                throw new CustomError(err.message, 500);
            });

        // make categories array
        let categories = data.rows.map(
            (res: {
                name: string;
                amount: number;
                id: string;
                parent_id: string;
                budget_id: string;
            }) =>
                new Category(
                    res.name,
                    res.amount,
                    parseInt(res.id),
                    parseInt(res.parent_id),
                    parseInt(res.budget_id)
                )
        );

        return categories;
    }

    static async getCategoryById(id: number): Promise<Category> {
        // get category in database
        let data = await pool
            .query("SELECT * FROM category WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data.rowCount === 0) {
            throw new CustomError(
                ETH.get("CATEGORY.READ.ERROR.INVALIDID"),
                404
            );
        }

        // init budget as Budget object
        let category_in_array = data.rows.map(
            (res: {
                name: string;
                amount: number;
                id: string;
                parent_id: string;
                budget_id: string;
            }) =>
                new Category(
                    res.name,
                    res.amount,
                    parseInt(res.id),
                    parseInt(res.parent_id),
                    parseInt(res.budget_id)
                )
        );
        let category = category_in_array[0];

        return category;
    }

    static async createCategory(
        name: string,
        amount: number,
        parent_id?: number,
        budget_id?: number
    ): Promise<Category> {
        // create budget
        let data_category = await pool
            .query(
                "INSERT INTO category (name, amount, parent_id, budget_id) VALUES ($1, $2, $3, $4) RETURNING *",
                [name, amount, parent_id, budget_id]
            )
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data_category.rowCount === 0) {
            throw new CustomError(
                ETH.get("CATEGORY.CREATE.ERROR.NOROWCREATED"),
                400
            );
        }

        // init category object
        let category = new Category(
            data_category.rows[0].name,
            data_category.rows[0].amount,
            data_category.rows[0].id,
            data_category.rows[0].parent_id,
            data_category.rows[0].budget_id
        );

        // return category object
        return category;
    }

    static async deleteCategory(id: number): Promise<Category> {
        // query db - verify category exists, and only returns one unique row from db
        const to_be_deleted_category_sql_object: {
            rows: Array<{
                name: string;
                amount: number;
                id: number;
                parent_id: number;
                budget_id: number;
            }>;
            rowCount: number;
        } = await pool
            .query("SELECT * FROM category WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (to_be_deleted_category_sql_object.rowCount === 0) {
            throw new CustomError(
                ETH.get("CATEGORY.READ.ERROR.INVALIDID"),
                404
            );
        }

        // delete category in db
        const deleted_category_sql_object: {
            rows: Array<{
                name: string;
                amount: number;
                id: number;
                parent_id: number;
                budget_id: number;
            }>;
        } = await pool
            .query("DELETE FROM category WHERE id = $1 RETURNING *", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // create category object
        const deleted_category: Category = new Category(
            deleted_category_sql_object["rows"][0].name,
            deleted_category_sql_object["rows"][0].amount,
            deleted_category_sql_object["rows"][0].id,
            deleted_category_sql_object["rows"][0].parent_id,
            deleted_category_sql_object["rows"][0].budget_id
        );

        // send response
        return deleted_category;
    }

    static async updateCategory(
        id: number,
        name?: string,
        amount?: number,
        parent_id?: string,
        budget_id?: string
    ): Promise<Category> {
        let previous_category = await pool
            .query("SELECT * FROM category WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });
        previous_category = previous_category.rows[0];

        // update category
        let updated_category = await pool
            .query(
                "UPDATE category SET name = $2, amount = $3, parent_id = $4, budget_id = $5 WHERE id = $1 RETURNING *",
                // we need to keep checking parent_id for truthy or falsy, as updating categories name and value will be sent with parent_id == null and keep previous parent_id
                [
                    id,
                    name || previous_category.name,
                    amount || previous_category.amount,
                    parent_id || previous_category.parent_id,
                    budget_id || previous_category.budget_id,
                ]
            )
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (updated_category.rowCount === 0) {
            throw new CustomError(
                ETH.get("CATEGORY.READ.ERROR.INVALIDID"),
                404
            );
        }

        // init category object
        let category = new Category(
            updated_category.rows[0].name,
            updated_category.rows[0].amount,
            updated_category.rows[0].id,
            updated_category.rows[0].parent_id,
            updated_category.rows[0].budget_id
        );

        // return transaction object
        return category;
    }

    static async exists(id: number): Promise<boolean> {
        return await this.getCategoryById(id)
            .then(() => {
                return true;
            })
            .catch((err: Error) => {
                throw err;
            });
    }
}
