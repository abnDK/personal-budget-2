// REWRITE FROM TRANSACTION TO CATEGORY
// DONE?

import { Budget } from "../models/1.3/budget";
import { Transaction } from "../models/1.3/transaction";
const pool = require('../configs/queries')

class BudgetService {
    
    static async getBudgets(): Promise<Array<Budget>> {
        // get Budgets in database
        let data = await pool.query('SELECT * FROM budget ORDER BY id ASC')
        
        // make budgets array
        let budgets = data.rows.map(res => new Budget(res.name, res.start_date, res.end_date, parseInt(res.id)))

        return budgets;
    }

    static async getBudgetById(id): Promise<Budget> {
        // get Budget in database
        let data = await pool.query('SELECT * FROM budget WHERE id = $1', [id])


        // init budget as Budget object
        let budget_in_array = data.rows.map(res => new Budget(res.name, res.start_date, res.end_date, parseInt(res.id)))
        let budget = budget_in_array[0]

        // if budget unknown / id not known
        if (budget == undefined) {
            throw new Error('Id not known')
        }

        return budget
    }

    static async createTransaction(name: string, amount: number, date: Date, category_id?: number): Promise<Transaction> {
        // TODO
        let category;


        // create transaction
        let data_trans = await pool.query('INSERT INTO transaction (name, amount, date, category_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, amount, date, category_id]);

        // verify only 1 transaction has been created and returned from db
        if (!data_trans.rows.length) {
            throw new Error('no new transaction has been created, for some reason?')
        } else if (data_trans.rows.length > 1) {
            console.log(data_trans.rows)
            throw new Error('more than one transaction has been created in db. Something is not right...')
        }

        // init transaction object
        let transaction = new Transaction(data_trans.rows[0].id, data_trans.rows[0].name, data_trans.rows[0].amount, data_trans.rows[0].date)
        transaction.category = category;

        // return transaction object
        return transaction


    }

    static async deleteTransaction(delete_id): Promise<Transaction> {
        // TODO

        // parse id
        const id : number = parseInt(delete_id);

        // query db
        const to_be_deleted_transaction_sql_object : Object = await pool.query('SELECT * FROM transaction WHERE id = $1', [id])

        
        // verify id only equals 1 transaction 
        if (to_be_deleted_transaction_sql_object['rows'].length === 0) {
            throw new Error('id unknown')
        }
        if (to_be_deleted_transaction_sql_object['rows'].length > 1) {
            throw new Error('Multiple rows to be deleted - id should be unique')
        }

        // delete transaction in db
        const deleted_transaction_sql_object : Object = await pool.query('DELETE FROM transaction WHERE id = $1 RETURNING *', [id])

        // create Transaction object
        const deleted_transaction : Transaction = new Transaction(
            deleted_transaction_sql_object['rows'][0].id,
            deleted_transaction_sql_object['rows'][0].name,
            deleted_transaction_sql_object['rows'][0].amount,
            deleted_transaction_sql_object['rows'][0].date
        )

        // send response
        return deleted_transaction

    }

} 

module.exports = BudgetService