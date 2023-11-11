var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Category } from "../models/1.4/category.js";
import { pool } from "../configs/queries.js";
import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
// setting up text helper for error messages
const ETH = new ErrorTextHelper();
export class CategoryService {
    static getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            // returning mock data while testing - delete after implementation
            return [
                // TESTBUDGET A
                new Category("test_cat_a0", 1, // amount
                false, // end of life
                new Date(2023, 0, 1), 1, // id
                1, // budget id
                undefined, // prev id
                2, // next id
                undefined // parent id
                ),
                new Category("test_cat_a1", 1, // amount
                false, // end of life
                new Date(2023, 0, 2), 2, // id
                1, // budget id
                1, // prev id
                3, // next id
                undefined // parent id
                ),
                new Category("test_cat_a2", 1, // amount
                true, // end of life
                new Date(2023, 0, 3), 3, // id
                1, // budget id
                2, // prev id
                undefined, // next id
                undefined // parent id
                ),
                new Category("test_cat_ab0", 1, // amount
                false, // end of life
                new Date(2023, 0, 4), 4, // id
                1, // budget id
                undefined, // prev id
                undefined, // next id
                1 // parent id
                ),
                new Category("test_cat_abc0", 1, // amount
                false, // end of life
                new Date(2023, 0, 5), 5, // id
                1, // budget id
                undefined, // prev id
                6, // next id
                4 // parent id
                ),
                new Category("test_cat_abc1", 1, // amount
                false, // end of life
                new Date(2023, 0, 6), 6, // id
                1, // budget id
                5, // prev id
                undefined, // next id
                undefined // parent id
                ),
                // TESTBUDGET B
                new Category("test_cat_x0", 1, // amount
                false, // end of life
                new Date(2023, 0, 1), 7, // id
                2, // budget id
                undefined, // prev id
                undefined, // next id
                undefined // parent id
                ),
            ];
            // get Budgets in database
            let data = yield pool
                .query("SELECT * FROM category ORDER BY id ASC")
                .catch((err) => {
                throw new CustomError(err.message, 500);
            });
            // make categories array
            let categories = data.rows.map((res) => new Category(res.name, res.amount, res.endOfLife, res.create_date, res.id, res.budget_id, res.prev_id, res.next_id, res.parent_id));
            return categories;
        });
    }
    static getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // get category in database
            let data = yield pool
                .query("SELECT * FROM category WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (data.rowCount === 0) {
                throw new CustomError(ETH.get("CATEGORY.READ.ERROR.INVALIDID"), 404);
            }
            if (data.rowCount !== null && data.rowCount >= 2) {
                throw new CustomError(ETH.get("ALL.READ.ERROR.MULTIPLEIDROWS"), 500);
            }
            // init budget as Budget object
            let category_in_array = data.rows.map((res) => new Category(res.name, res.amount, res.end_of_life, res.create_date, res.id, res.budget_id, res.prev_id, res.next_id, res.parent_id));
            let category = category_in_array[0];
            return category;
        });
    }
    static createCategory(name, amount, endOfLife, createDate, budgetId = undefined, prevId = undefined, nextId = undefined, parentId = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            // create budget
            let data_category = yield pool
                .query("INSERT INTO category (budget_id, name, amount, end_of_life, create_date, prev_id, next_id, parent_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [
                budgetId,
                name,
                amount,
                endOfLife,
                createDate,
                prevId,
                nextId,
                parentId,
            ])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (data_category.rowCount === 0) {
                throw new CustomError(ETH.get("CATEGORY.CREATE.ERROR.NOROWCREATED"), 400);
            }
            // init and return category object
            return new Category(data_category.rows[0].name, data_category.rows[0].amount, data_category.rows[0].end_of_life, data_category.rows[0].create_date, data_category.rows[0].id, data_category.rows[0].budget_id, data_category.rows[0].prev_id, data_category.rows[0].next_id, data_category.rows[0].parent_id);
        });
    }
    static deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify id is valid
            yield this.exists(id);
            // delete category in db
            yield pool
                .query("DELETE FROM category WHERE id = $1 RETURNING *", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            // return id if delete succesful
            return id;
        });
    }
    static updateCategory(id, budgetId, name, amount, endOfLife, createDate, prevId, nextId, parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify valid prev, next and parent ids
            yield this.exists(id);
            prevId ? yield this.exists(prevId) : true;
            nextId ? yield this.exists(nextId) : true;
            parentId ? yield this.exists(parentId) : true;
            let pre_update_category = yield pool
                .query("SELECT * FROM category WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            // update category
            let updated_category = yield pool
                .query("UPDATE category SET budget_id = $2, name = $3, amount = $4, end_of_life = $5, create_date = $6, prev_id = $7, next_id = $8, parent_id = $9 WHERE id = $1 RETURNING *", [
                id,
                budgetId || pre_update_category.rows[0].budget_id,
                name || pre_update_category.rows[0].name,
                amount || pre_update_category.rows[0].amount,
                endOfLife || pre_update_category.rows[0].end_of_life,
                createDate || pre_update_category.rows[0].create_date,
                prevId || pre_update_category.rows[0].prev_id,
                nextId || pre_update_category.rows[0].next_id,
                parentId || pre_update_category.rows[0].parent_id,
            ])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            return new Category(updated_category.rows[0].name, updated_category.rows[0].amount, updated_category.rows[0].end_of_life, updated_category.rows[0].create_date, updated_category.rows[0].budget_id, updated_category.rows[0].prev_id, updated_category.rows[0].next_id, updated_category.rows[0].parent_id);
        });
    }
    static exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getCategoryById(id)
                .then(() => {
                return true;
            })
                .catch((err) => {
                throw err;
            });
        });
    }
}
