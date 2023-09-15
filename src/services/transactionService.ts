const CategoryService = require('./categoryService')
import { Transaction } from "../models/1.3/transaction";
const pool = require('../configs/queries')

interface resTransaction {
    id: number,
    name: string,
    amount: number,
    category_id: number,
    date: Date
}

class TransactionService {
    

    static async getTransactions(): Promise<Array<Transaction>> {
        // get Transactions in database
        let data = await pool.query('SELECT * FROM transaction ORDER BY id ASC')
        // build array of transactions
        let transactions = data.rows.map((resTransaction: resTransaction) => {
          
            let date: Date = resTransaction.date ? new Date(resTransaction.date) : new Date();

            return new Transaction(resTransaction.id, resTransaction.name, resTransaction.amount, date, resTransaction.category_id)
        })

        return transactions;
    }

    static async getTransactionById(id: number): Promise<Transaction> {
        // get Transaction in database
        let data = await pool.query('SELECT * FROM transaction WHERE id = $1', [id])


        // init transaction as Transaction object
        let transaction_in_array = data.rows.map((resTransaction: resTransaction) => {
            let date: Date = resTransaction.date ? new Date(resTransaction.date) : new Date();
            
            return new Transaction(resTransaction.id, resTransaction.name, resTransaction.amount, date, resTransaction.category_id)

        })
            
        let transaction = transaction_in_array[0]

        // if transaction unknown / id not known
        if (transaction == undefined) {
            throw new Error('Id not known')
        }

        return transaction
    }

    static async createTransaction(name: string, amount: number, date: Date, category_id?: number, recipient?: string, comment?: string): Promise<Transaction> {

        let category;

        // if no category_id; set to undefined
        if (!category_id) {
            category_id = undefined
        } else {
            // if category_id; check validity
            category = await CategoryService.getCategoryById(category_id)

            
        }

        // create transaction
        let data_trans = await pool.query('INSERT INTO transaction (name, amount, date, category_id, recipient, comment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [name, amount, date, category_id, recipient, comment]);

        // verify only 1 transaction has been created and returned from db
        if (!data_trans.rows.length) {
            throw new Error('no new transaction has been created, for some reason?')
        } else if (data_trans.rows.length > 1) {
            console.log(data_trans.rows)
            throw new Error('more than one transaction has been created in db. Something is not right...')
        }

        // init transaction object
        let transaction = new Transaction(data_trans.rows[0].id, data_trans.rows[0].name, data_trans.rows[0].amount, data_trans.rows[0].date, data_trans.rows[0].category_id)

        // return transaction object
        return transaction


    }

    static async deleteTransaction(delete_id: string): Promise<Transaction> {
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

    static async updateTransaction(id: number, name?: string, amount?: number, date?: Date, category_id?: number | null, recipient?: string, comment?: string): Promise<Transaction> {

        console.log('updateTransaction received these data: ', arguments)
        console.log('id: ', id)
        console.log('name: ', name)
        console.log('amount: ', amount)
        console.log('date: ', date)
        console.log('category_id: ', category_id)
        console.log('recipient: ', recipient)
        console.log('comment: ', comment)

        let pre_updated_trans_response = await pool.query('SELECT * FROM transaction WHERE id = $1', [id]);
        const pre_updated_trans = pre_updated_trans_response['rows'][0]
        // setting previous values, if no new is given.
        name = name ? name : pre_updated_trans.name;
        amount = amount ? amount : pre_updated_trans.amount;
        date = date ? date : pre_updated_trans.date;
        category_id = category_id ? category_id : null; //pre_updated_trans.category_id;
        recipient = recipient ? recipient : pre_updated_trans.recipient;
        comment = comment ? comment : pre_updated_trans.comment;
    
        
        // update transaction
        let updated_trans = await pool.query('UPDATE transaction SET name = $2, amount = $3, date = $4, category_id = $5, recipient = $6, comment = $7 WHERE id = $1 RETURNING *',
            [id, name, amount, date, category_id, recipient, comment]
         );

        // verify only 1 transaction has been returned and returned from db
        if (!updated_trans.rows.length) {
            throw new Error('no new transaction has been created, for some reason?')
        } else if (updated_trans.rows.length > 1) {
            console.log(updated_trans.rows)
            throw new Error('more than one transaction has been created in db. Something is not right...')
        }

        // init transaction object
        let transaction = new Transaction(
            updated_trans.rows[0].id, 
            updated_trans.rows[0].name, 
            updated_trans.rows[0].amount, 
            updated_trans.rows[0].date, 
            updated_trans.rows[0].category_id
        )

        console.log('Transaction service returning: ', transaction)

        // return transaction object
        return transaction


    }

} 

module.exports = TransactionService