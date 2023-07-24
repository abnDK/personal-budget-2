import { Category } from "../models/1.3/category";
import { Transaction } from "../models/1.3/transaction";
import { Mock_data } from "../test/Mock_data";
const pool = require('../configs/queries')

class TransactionService {
    // service will get models/dataclasses
    // service will call db service
    // service will return array of class type xyz

    // service will be called by router (API)
    // i.e. GET request goes through transactionService which in turn calls the databaseService, that gets the data. transactionService then packs the data in i.e. an array and returns to route as response.

    


    /**
     *  FIGURE OUT HOW TO PORT THIS INTO A (REQ, RES) KINDA FUNCTION FOR USE WITH ROUTER.
     */
    static async getTransactions(startDate?: Date, endDate?: Date, category?: Category): Promise<Array<Transaction>> {
        // get Transactions in database
        let data = await pool.query('SELECT * FROM transaction ORDER BY id ASC')
        
        // build array of transactions
        let transactions = data.rows.map(res => new Transaction(parseInt(res.id), res.name, res.amount, res.date))

        // filter transactions
        if (startDate) {
            transactions = transactions.filter(trans => trans.date >= startDate)
            
            if (endDate) {
                transactions = transactions.filter(trans => trans.date <= endDate)
                if (startDate > endDate) {throw new RangeError('endDate cannot be before startDate')}
            }

        }

        if (category) {

            transactions = transactions.filter(trans => trans.category !== undefined)
            
            transactions = transactions.filter(trans => trans.category.name == category.name)
        }
        
        return transactions;
    }

    static async getTransactionById(id): Promise<Transaction> {
        // get Transaction in database
        let data = await pool.query('SELECT * FROM transaction WHERE id = $1', [id])


        // init transaction as Transaction object
        let transaction_in_array = data.rows.map(res => new Transaction(parseInt(res.id), res.name, res.amount, res.date))
        let transaction = transaction_in_array[0]

        // if transaction unknown / id not known
        if (transaction == undefined) {
            throw new Error('Id not known')
        }

        return transaction
    }

    static async createTransaction(name: string, amount: number, date: Date, category_id?: number): Promise<Transaction> {
        
        let category;

        // if no category_id; set to undefined
        if (!category_id) {
            category_id = undefined
        } else {
            // if category_id; check validity
            // TODO: Use categoryService when API is done
            let data_category = await pool.query('SELECT * FROM category WHERE id = $1', [category_id])
            if (!data_category.rows.length) {
                throw new Error('category_id unknown - please provide valid id instead')
            } else if (data_category.rows.length > 1) {
                throw new Error('More than one category with same id should not be possible...')
            } else {
                category = new Category(data_category.rows[0].name, data_category.rows[0].amount)
            }
        }

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

module.exports = TransactionService