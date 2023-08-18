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
const pool = require('../configs/queries');
class CategoryService {
    static getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            // get Budgets in database
            let data = yield pool.query('SELECT * FROM category ORDER BY id ASC');
            // make categories array
            let categories = data.rows.map((res) => new category_1.Category(res.name, res.amount, parseInt(res.id), parseInt(res.parent_id), parseInt(res.budget_id)));
            return categories;
        });
    }
    static getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // get Budget in database
            let data = yield pool.query('SELECT * FROM category WHERE id = $1', [id]);
            // init budget as Budget object
            let category_in_array = data.rows.map((res) => new category_1.Category(res.name, res.amount, parseInt(res.id), parseInt(res.parent_id), parseInt(res.budget_id)));
            let category = category_in_array[0];
            // if budget unknown / id not known
            if (category == undefined) {
                throw new Error('Id not known');
            }
            return category;
        });
    }
    static createCategory(name, amount, parent_id, budget_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // create budget
            let data_category = yield pool.query('INSERT INTO category (name, amount, parent_id, budget_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, amount, parent_id, budget_id]);
            // verify only 1 budget has been created and returned from db
            if (!data_category.rows.length) {
                throw new Error('no new category has been created, for some reason?'); // WILL THIS ERROR BE THROWN WHEN QUERING DB?
            }
            else if (data_category.rows.length > 1) {
                console.log(data_category.rows);
                throw new Error('more than one category has been created in db. Something is not right...');
            }
            // init category object
            let category = new category_1.Category(data_category.rows[0].name, data_category.rows[0].amount, data_category.rows[0].id, data_category.rows[0].parent_id, data_category.rows[0].budget_id);
            // return category object
            return category;
        });
    }
    static deleteCategory(delete_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO
            // - What to do if category fkeys to to_be_deleted category?
            // --- deleted children as well?
            // --- delete category and remove fkey rel on category (setting parent_id fkey to null will leave category with budget_id, this making it a primary category of the budget)
            // --- throw error, and delete parent category first (CURRENT CHOICE)
            // parse id
            const id = parseInt(delete_id);
            // query db
            const to_be_deleted_category_sql_object = yield pool.query('SELECT * FROM category WHERE id = $1', [id]);
            // verify id only equals 1 category 
            if (to_be_deleted_category_sql_object['rows'].length === 0) {
                throw new Error('id unknown');
            }
            if (to_be_deleted_category_sql_object['rows'].length > 1) {
                throw new Error('Multiple rows to be deleted - id should be unique');
            }
            // delete category in db
            const deleted_category_sql_object = yield pool.query('DELETE FROM category WHERE id = $1 RETURNING *', [id]);
            // create category object
            const deleted_category = new category_1.Category(deleted_category_sql_object['rows'][0].name, deleted_category_sql_object['rows'][0].amount, deleted_category_sql_object['rows'][0].id, deleted_category_sql_object['rows'][0].parent_id, deleted_category_sql_object['rows'][0].budget_id);
            // send response
            return deleted_category;
        });
    }
    static updateCategory(id, name, amount, parent_id, budget_id) {
        return __awaiter(this, void 0, void 0, function* () {
            parent_id = parent_id === 'null' ? undefined : parent_id;
            // update category
            let updated_category = yield pool.query('UPDATE category SET name = $2, amount = $3, parent_id = $4, budget_id = $5 WHERE id = $1 RETURNING *', [id, name, amount, (parent_id || undefined), (budget_id || undefined)]);
            // verify only 1 category has been returned and returned from db
            if (!updated_category.rows.length) {
                throw new Error('no new category has been created, for some reason. Maybe id was unknown?' + ' id: ' + id);
            }
            else if (updated_category.rows.length > 1) {
                console.log(updated_category.rows);
                throw new Error('more than one category has been created in db. Something is not right...');
            }
            // init category object
            let category = new category_1.Category(updated_category.rows[0].id, updated_category.rows[0].name, updated_category.rows[0].amount, updated_category.rows[0].parent_id, updated_category.rows[0].budget_id);
            // return transaction object
            return category;
        });
    }
}
module.exports = CategoryService;
