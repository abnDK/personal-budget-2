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
const category_1 = require("../models/1.3/category");
const pool = require("../configs/queries");
const CustomError = require("../utils/errors/CustomError");
class CategoryService {
    static getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            // get Budgets in database
            let data = yield pool
                .query("SELECT * FROM category ORDER BY id ASC")
                .catch((err) => {
                throw new CustomError(err.message, 500);
            });
            // make categories array
            let categories = data.rows.map((res) => new category_1.Category(res.name, res.amount, parseInt(res.id), parseInt(res.parent_id), parseInt(res.budget_id)));
            return categories;
        });
    }
    static getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // get Budget in database
            let data = yield pool
                .query("SELECT * FROM category WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 500);
            });
            if (data.rowCount === 0) {
                throw new CustomError("Category id unknown", 404);
            }
            // init budget as Budget object
            let category_in_array = data.rows.map((res) => new category_1.Category(res.name, res.amount, parseInt(res.id), parseInt(res.parent_id), parseInt(res.budget_id)));
            let category = category_in_array[0];
            return category;
        });
    }
    static createCategory(name, amount, parent_id, budget_id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("ready to insert new cat into db: ", name, amount);
            // create budget
            let data_category = yield pool
                .query("INSERT INTO category (name, amount, parent_id, budget_id) VALUES ($1, $2, $3, $4) RETURNING *", [name, amount, parent_id, budget_id])
                .catch((err) => {
                throw new CustomError(err.message, 500);
            });
            // verify only 1 budget has been created and returned from db
            if (data_category.rowCount === 0) {
                throw new CustomError("No new category row was created in db", 404);
            }
            if (data_category.rowCount !== 1) {
                throw new CustomError("Created more than 1 new category in db", 404);
            }
            // init category object
            let category = new category_1.Category(data_category.rows[0].name, data_category.rows[0].amount, data_category.rows[0].id, data_category.rows[0].parent_id, data_category.rows[0].budget_id);
            // return category object
            return category;
        });
    }
    static deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // query db - verify category exists, and only returns one unique row from db
            const to_be_deleted_category_sql_object = yield pool
                .query("SELECT * FROM category WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 500);
            });
            if (to_be_deleted_category_sql_object.rowCount === 0) {
                throw new CustomError("Category id unknown!", 404);
            }
            // delete category in db
            const deleted_category_sql_object = yield pool
                .query("DELETE FROM category WHERE id = $1 RETURNING *", [id])
                .catch((err) => {
                throw new CustomError(err.message, 500);
            });
            // create category object
            const deleted_category = new category_1.Category(deleted_category_sql_object["rows"][0].name, deleted_category_sql_object["rows"][0].amount, deleted_category_sql_object["rows"][0].id, deleted_category_sql_object["rows"][0].parent_id, deleted_category_sql_object["rows"][0].budget_id);
            // send response
            return deleted_category;
        });
    }
    static updateCategory(id, name, amount, parent_id, budget_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let previous_category = yield pool
                .query("SELECT * FROM category WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 500);
            });
            previous_category = previous_category.rows[0];
            // update category
            let updated_category = yield pool
                .query("UPDATE category SET name = $2, amount = $3, parent_id = $4, budget_id = $5 WHERE id = $1 RETURNING *", 
            // we need to keep checking parent_id for truthy or falsy, as updating categories name and value will be sent with parent_id == null and keep previous parent_id
            [
                id,
                name || previous_category.name,
                amount || previous_category.amount,
                parent_id || previous_category.parent_id,
                budget_id || previous_category.budget_id,
            ])
                .catch((err) => {
                throw new CustomError(err.message, 500);
            });
            if (updated_category.rowCount === 0) {
                throw new CustomError("Category id unknown", 404);
            }
            // init category object
            let category = new category_1.Category(updated_category.rows[0].name, updated_category.rows[0].amount, updated_category.rows[0].id, updated_category.rows[0].parent_id, updated_category.rows[0].budget_id);
            // return transaction object
            return category;
        });
    }
}
module.exports = CategoryService;
