import { Category } from "../models/1.3/category";
const pool = require('../configs/queries')

class CategoryService {
    
    static async getCategories(): Promise<Array<Category>> {
        // get Budgets in database
        let data = await pool.query('SELECT * FROM category ORDER BY id ASC')
        
        // make categories array
        let categories = data.rows.map(res => new Category(
                    res.name, 
                    res.amount, 
                    parseInt(res.id), 
                    parseInt(res.parent_id), 
                    parseInt(res.budget_id)
                )
            )

        return categories;
    }

    static async getCategoryById(id): Promise<Category> {
        // get Budget in database
        let data = await pool.query('SELECT * FROM category WHERE id = $1', [id])


        // init budget as Budget object
        let category_in_array = data.rows.map(res => new Category(
                    res.name, 
                    res.amount, 
                    res.id, 
                    res.parent_id,
                    res.budget_id
                )
            )
        let category = category_in_array[0]

        // if budget unknown / id not known
        if (category == undefined) {
            throw new Error('Id not known')
        }

        return category
    }

    static async createCategory(name: string, amount: number, parent_id?: number, budget_id?:number): Promise<Category> {

        // create budget
        let data_category = await pool.query('INSERT INTO category (name, amount, parent_id, budget_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, amount, parent_id, budget_id]);

        // verify only 1 budget has been created and returned from db
        if (!data_category.rows.length) {
            throw new Error('no new category has been created, for some reason?') // WILL THIS ERROR BE THROWN WHEN QUERING DB?
        } else if (data_category.rows.length > 1) {
            console.log(data_category.rows)
            throw new Error('more than one category has been created in db. Something is not right...')
        }

        // init category object
        let category = new Category(
                data_category.rows[0].name, 
                data_category.rows[0].amount, 
                data_category.rows[0].id, 
                data_category.rows[0].parent_id, 
                data_category.rows[0].budget_id
            )

        // return category object
        return category


    }

    static async deleteCategory(delete_id): Promise<Category> {
        // TODO
        // - What to do if category fkeys to to_be_deleted category?
        // --- deleted children as well?
        // --- delete category and remove fkey rel on category (setting parent_id fkey to null will leave category with budget_id, this making it a primary category of the budget)
        // --- throw error, and delete parent category first (CURRENT CHOICE)

        // parse id
        const id : number = parseInt(delete_id);

        // query db
        const to_be_deleted_category_sql_object : Object = await pool.query('SELECT * FROM category WHERE id = $1', [id])

        
        // verify id only equals 1 category 
        if (to_be_deleted_category_sql_object['rows'].length === 0) {
            throw new Error('id unknown')
        }
        if (to_be_deleted_category_sql_object['rows'].length > 1) {
            throw new Error('Multiple rows to be deleted - id should be unique')
        }

        // delete category in db
        const deleted_category_sql_object : Object = await pool.query('DELETE FROM category WHERE id = $1 RETURNING *', [id])

        // create category object
        const deleted_category : Category = new Category(
            deleted_category_sql_object['rows'][0].name,
            deleted_category_sql_object['rows'][0].amount,
            deleted_category_sql_object['rows'][0].id,
            deleted_category_sql_object['rows'][0].parent_id,
            deleted_category_sql_object['rows'][0].budget_id

        )

        // send response
        return deleted_category

    }

} 

module.exports = CategoryService