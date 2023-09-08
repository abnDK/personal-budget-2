import { Category } from "../models/1.3/category";
const pool = require('../configs/queries')

class CategoryService {
    
    static async getCategories(): Promise<Array<Category>> {
        // get Budgets in database
        let data = await pool.query('SELECT * FROM category ORDER BY id ASC')
        
        // make categories array
        let categories = data.rows.map((res: {name:string, amount:number, id:string, parent_id:string, budget_id:string}) => new Category(
                    res.name, 
                    res.amount, 
                    parseInt(res.id), 
                    parseInt(res.parent_id), 
                    parseInt(res.budget_id)
                )
            )


        return categories;
    }

    

    static async getCategoryById(id: number): Promise<Category> {
        // get Budget in database
        let data = await pool.query('SELECT * FROM category WHERE id = $1', [id])

        // init budget as Budget object
        let category_in_array = data.rows.map((res: {name:string, amount:number, id:string, parent_id:string, budget_id:string}) => new Category(
                    res.name, 
                    res.amount, 
                    parseInt(res.id), 
                    parseInt(res.parent_id), 
                    parseInt(res.budget_id)
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

    static async deleteCategory(delete_id: string): Promise<Category> {
        // TODO
        // - What to do if category fkeys to to_be_deleted category?
        // --- deleted children as well?
        // --- delete category and remove fkey rel on category (setting parent_id fkey to null will leave category with budget_id, this making it a primary category of the budget)
        // --- throw error, and delete parent category first (CURRENT CHOICE)

        // parse id
        const id : number = parseInt(delete_id);

        // query db - verify category exists, and only returns one unique row from db
        const to_be_deleted_category_sql_object : {rows: Array<{name:string, amount:number, id:number, parent_id:number, budget_id:number}>} = await pool.query('SELECT * FROM category WHERE id = $1', [id])

        
        // verify id only equals 1 category 
        if (to_be_deleted_category_sql_object['rows'].length === 0) {
            throw new Error('id unknown')
        }
        if (to_be_deleted_category_sql_object['rows'].length > 1) {
            throw new Error('Multiple rows to be deleted - id should be unique')
        }

        // delete category in db
        const deleted_category_sql_object : {rows: Array<{name:string, amount:number, id:number, parent_id:number, budget_id:number}>} = await pool.query('DELETE FROM category WHERE id = $1 RETURNING *', [id])

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

    static async updateCategory(id: number, name?: string, amount?: number, parent_id?: string, budget_id?: string): Promise<Category> {
        
        
        let previous_category = await pool.query('SELECT * FROM category WHERE id = $1', [id])
        previous_category = previous_category.rows[0]
        
        // update category
        let updated_category = await pool.query('UPDATE category SET name = $2, amount = $3, parent_id = $4, budget_id = $5 WHERE id = $1 RETURNING *',
            // we need to keep checking parent_id for truthy or falsy, as updating categories name and value will be sent with parent_id == null and keep previous parent_id
            [id, (name || previous_category.name), (amount || previous_category.amount), (parent_id || previous_category.parent_id), (budget_id || previous_category.budget_id)]
        
        );

        console.log(arguments)
        console.log((name || previous_category.name), (amount || previous_category.amount), (parent_id || previous_category.parent_id), (budget_id || previous_category.budget_id));
        console.log('PUT category before ', previous_category)
        console.log('PUT category after ', updated_category.rows[0])
        
        // verify only 1 category has been returned and returned from db
        if (!updated_category.rows.length) {
            throw new Error('no new category has been created, for some reason. Maybe id was unknown?' + ' id: ' + id)
        } else if (updated_category.rows.length > 1) {
            console.log(updated_category.rows)
            throw new Error('more than one category has been created in db. Something is not right...')
        }

        // init category object
        let category = new Category(
            updated_category.rows[0].name, 
            updated_category.rows[0].amount, 
            updated_category.rows[0].id, 
            updated_category.rows[0].parent_id, 
            updated_category.rows[0].budget_id
        )

        // return transaction object
        return category
        

    }

} 

module.exports = CategoryService