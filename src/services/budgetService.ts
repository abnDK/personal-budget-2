import { toASCII } from "punycode";
import { Budget } from "../models/1.3/budget";
const pool = require('../configs/queries')

"use strict"

class BudgetService {
    
    static async getBudgets(): Promise<Array<Budget>> {
        // get Budgets in database
        let data = await pool.query('SELECT * FROM budget ORDER BY id ASC')
        
        // make budgets array
        let budgets = data.rows.map(function(res:any) {
            return new Budget(res.name, res.date_start, res.date_end, parseInt(res.id))
        })

        return budgets;
    }

    static async getBudgetById(id: number): Promise<Budget> {
        // get Budget in database
        let data = await pool.query('SELECT * FROM budget WHERE id = $1', [id])

        // init budget as Budget object
        let budget_in_array = data.rows.map(function(res:any) {
          return new Budget(res.name, res.date_start, res.date_end, parseInt(res.id)) 
        })
        
        let budget = budget_in_array[0]

        // if budget unknown / id not known
        if (budget == undefined) {
            throw new Error('Id not known')
        }

        return budget
    }

    static async createBudget(name: string, date_start: Date, date_end: Date): Promise<Budget> {

        // create budget
        let data_budget = await pool.query('INSERT INTO budget (name, date_start, date_end) VALUES ($1, $2, $3) RETURNING *', [name, date_start, date_end]);

        // verify only 1 budget has been created and returned from db
        if (!data_budget.rows.length) {
            throw new Error('no new budget has been created, for some reason?') // WILL THIS ERROR BE THROWN WHEN QUERING DB?
        } else if (data_budget.rows.length > 1) {
            console.log(data_budget.rows)
            throw new Error('more than one budget has been created in db. Something is not right...')
        }

        // init budget object
        let budget = new Budget(data_budget.rows[0].name, data_budget.rows[0].date_start, data_budget.rows[0].date_end, data_budget.rows[0].id)

        // return budget object
        return budget


    }

    static async deleteBudget(delete_id: string): Promise<Budget> {
        // TODO
        // - What to do if category fkeys to to_be_deleted budget?
        // --- deleted all
        // --- delete budget, and remove fkey rel on category
        // --- throw error, and delete category first (CURRENT CHOICE)

        // parse id
        const id : number = parseInt(delete_id);

        // query db
        const to_be_deleted_budget_sql_object : Object = await pool.query('SELECT * FROM budget WHERE id = $1', [id])

        
        // verify id only equals 1 budget 
        if (to_be_deleted_budget_sql_object['rows'].length === 0) {
            throw new Error('id unknown')
        }
        if (to_be_deleted_budget_sql_object['rows'].length > 1) {
            throw new Error('Multiple rows to be deleted - id should be unique')
        }

        // delete budget in db
        const deleted_budget_sql_object : Object = await pool.query('DELETE FROM budget WHERE id = $1 RETURNING *', [id])

        // create budget object
        const deleted_budget : Budget = new Budget(
            deleted_budget_sql_object['rows'][0].name,
            deleted_budget_sql_object['rows'][0].date_start,
            deleted_budget_sql_object['rows'][0].date_end,
            deleted_budget_sql_object['rows'][0].id

        )

        // send response
        return deleted_budget

    }

} 

module.exports = BudgetService