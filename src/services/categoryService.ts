import { Category } from "../models/1.4/category.js";
import { pool } from "../configs/queries.js";
import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
// setting up text helper for error messages
const ETH = new ErrorTextHelper();

export class CategoryService {
    static async getCategories(): Promise<Array<Category>> {
        // get Budgets in database
        let data = await pool
            .query("SELECT * FROM category ORDER BY id ASC")
            .catch((err: Error) => {
                throw new CustomError(err.message, 500);
            });

        if (data.rowCount === 0) {
            throw new CustomError(ETH.get("ALL.READ.ERROR.INVALIDID"), 404);
        }
        if (data.rowCount >= 2) {
            throw new CustomError(
                ETH.get("ALL.READ.ERROR.MULTIPLEIDROWS"),
                500
            );
        }

        // make categories array
        let categories = data.rows.map(
            (res: {
                id: number;
                budget_id: number;
                name: string;
                amount: number;
                endOfLife: boolean;
                create_date: Date;
                prev_id: number | undefined;
                next_id: number | undefined;
                parent_id: number | undefined;
            }) =>
                new Category(
                    res.name,
                    res.amount,
                    res.endOfLife,
                    res.create_date,
                    res.id,
                    res.budget_id,
                    res.prev_id,
                    res.next_id,
                    res.parent_id
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
                id: number;
                budget_id: number;
                name: string;
                amount: number;
                end_of_life: boolean;
                create_date: Date;
                prev_id: number | undefined;
                next_id: number | undefined;
                parent_id: number | undefined;
            }) =>
                new Category(
                    res.name,
                    res.amount,
                    res.end_of_life,
                    res.create_date,
                    res.id,
                    res.budget_id,
                    res.prev_id,
                    res.next_id,
                    res.parent_id
                )
        );
        let category = category_in_array[0];

        return category;
    }

    static async createCategory(
        name: string,
        amount: number,
        endOfLife: boolean,
        createDate: Date,
        budgetId: number | undefined = undefined,
        prevId: number | undefined = undefined,
        nextId: number | undefined = undefined,
        parentId: number | undefined = undefined
    ): Promise<Category> {
        // create budget
        let data_category: {
            rows: Array<{
                id: number;
                budget_id: number;
                name: string;
                amount: number;
                end_of_life: boolean;
                create_date: Date;
                prev_id: number | undefined;
                next_id: number | undefined;
                parent_id: number | undefined;
            }>;
            rowCount: number;
        } = await pool
            .query(
                "INSERT INTO category (budget_id, name, amount, end_of_life, create_date, prev_id, next_id, parent_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                [
                    budgetId,
                    name,
                    amount,
                    endOfLife,
                    createDate,
                    prevId,
                    nextId,
                    parentId,
                ]
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

        // init and return category object
        return new Category(
            data_category.rows[0].name,
            data_category.rows[0].amount,
            data_category.rows[0].end_of_life,
            data_category.rows[0].create_date,
            data_category.rows[0].id,
            data_category.rows[0].budget_id,
            data_category.rows[0].prev_id,
            data_category.rows[0].next_id,
            data_category.rows[0].parent_id
        );
    }

    static async deleteCategory(id: number): Promise<number> {
        // verify id is valid
        await this.exists(id);

        // delete category in db
        await pool
            .query("DELETE FROM category WHERE id = $1 RETURNING *", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // return id if delete succesful
        return id;
    }

    static async updateCategory(
        id: number,
        budgetId?: string | undefined,
        name?: string | undefined,
        amount?: number | undefined,
        endOfLife?: boolean | undefined,
        createDate?: Date | undefined,
        prevId?: number | undefined,
        nextId?: number | undefined,
        parentId?: number | undefined
    ): Promise<Category> {
        // verify valid prev, next and parent ids
        await this.exists(id);
        prevId ? await this.exists(prevId) : true;
        nextId ? await this.exists(nextId) : true;
        parentId ? await this.exists(parentId) : true;

        let pre_update_category: {
            rows: Array<{
                id: number;
                budget_id: number;
                name: string;
                amount: number;
                end_of_life: boolean;
                create_date: Date;
                prev_id: number | undefined;
                next_id: number | undefined;
                parent_id: number | undefined;
            }>;
            rowCount: number;
        } = await pool
            .query("SELECT * FROM category WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // update category
        let updated_category: typeof pre_update_category = await pool
            .query(
                "UPDATE category SET budget_id = $2, name = $3, amount = $4, end_of_life = $5, create_date = $6, prev_id = $7, next_id = $8, parent_id = $9 WHERE id = $1 RETURNING *",
                [
                    id,
                    budgetId || pre_update_category.rows[0].budget_id,
                    name || pre_update_category.rows[0].name,
                    amount || pre_update_category.rows[0].amount,
                    endOfLife || pre_update_category.rows[0].end_of_life,
                    createDate || pre_update_category.rows[0].create_date,
                    prevId || pre_update_category.rows[0].prev_id,
                    nextId || pre_update_category.rows[0].next_id,
                    parentId || pre_update_category.rows[0].parent_id,
                ]
            )
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        return new Category(
            updated_category.rows[0].name,
            updated_category.rows[0].amount,
            updated_category.rows[0].end_of_life,
            updated_category.rows[0].create_date,
            updated_category.rows[0].budget_id,
            updated_category.rows[0].prev_id,
            updated_category.rows[0].next_id,
            updated_category.rows[0].parent_id
        );
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
