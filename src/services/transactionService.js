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
const CategoryService = require('./categoryService');
const transaction_1 = require("../models/1.3/transaction");
const pool = require('../configs/queries');
class TransactionService {
    static getTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            // get Transactions in database
            let data = yield pool.query('SELECT * FROM transaction ORDER BY id ASC');
            // build array of transactions
            let transactions = data.rows.map((resTransaction) => {
                let date = resTransaction.date ? new Date(resTransaction.date) : new Date();
                return new transaction_1.Transaction(resTransaction.id, resTransaction.name, resTransaction.amount, date, resTransaction.category_id);
            });
            return transactions;
        });
    }
    static getTransactionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // get Transaction in database
            let data = yield pool.query('SELECT * FROM transaction WHERE id = $1', [id]);
            // init transaction as Transaction object
            let transaction_in_array = data.rows.map((resTransaction) => {
                let date = resTransaction.date ? new Date(resTransaction.date) : new Date();
                return new transaction_1.Transaction(resTransaction.id, resTransaction.name, resTransaction.amount, date, resTransaction.category_id);
            });
            let transaction = transaction_in_array[0];
            // if transaction unknown / id not known
            if (transaction == undefined) {
                throw new Error('Id not known');
            }
            return transaction;
        });
    }
    static createTransaction(name, amount, date, category_id, recipient, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            let category;
            // if no category_id; set to undefined
            if (!category_id) {
                category_id = undefined;
            }
            else {
                // if category_id; check validity
                category = yield CategoryService.getCategoryById(category_id);
            }
            // create transaction
            let data_trans = yield pool.query('INSERT INTO transaction (name, amount, date, category_id, recipient, comment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [name, amount, date, category_id, recipient, comment]);
            // verify only 1 transaction has been created and returned from db
            if (!data_trans.rows.length) {
                throw new Error('no new transaction has been created, for some reason?');
            }
            else if (data_trans.rows.length > 1) {
                console.log(data_trans.rows);
                throw new Error('more than one transaction has been created in db. Something is not right...');
            }
            // init transaction object
            let transaction = new transaction_1.Transaction(data_trans.rows[0].id, data_trans.rows[0].name, data_trans.rows[0].amount, data_trans.rows[0].date, data_trans.rows[0].category_id);
            // return transaction object
            return transaction;
        });
    }
    static deleteTransaction(delete_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // parse id
            const id = parseInt(delete_id);
            // query db
            const to_be_deleted_transaction_sql_object = yield pool.query('SELECT * FROM transaction WHERE id = $1', [id]);
            // verify id only equals 1 transaction 
            if (to_be_deleted_transaction_sql_object['rows'].length === 0) {
                throw new Error('id unknown');
            }
            if (to_be_deleted_transaction_sql_object['rows'].length > 1) {
                throw new Error('Multiple rows to be deleted - id should be unique');
            }
            // delete transaction in db
            const deleted_transaction_sql_object = yield pool.query('DELETE FROM transaction WHERE id = $1 RETURNING *', [id]);
            // create Transaction object
            const deleted_transaction = new transaction_1.Transaction(deleted_transaction_sql_object['rows'][0].id, deleted_transaction_sql_object['rows'][0].name, deleted_transaction_sql_object['rows'][0].amount, deleted_transaction_sql_object['rows'][0].date);
            // send response
            return deleted_transaction;
        });
    }
    static updateTransaction(id, name, amount, date, category_id, recipient, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            // update transaction
            let updated_trans = yield pool.query('UPDATE transaction SET name = $2, amount = $3, date = $4, category_id = $5, recipient = $6, comment = $7 WHERE id = $1 RETURNING *', [id, name, amount, date, category_id, recipient, comment]);
            // verify only 1 transaction has been returned and returned from db
            if (!updated_trans.rows.length) {
                throw new Error('no new transaction has been created, for some reason?');
            }
            else if (updated_trans.rows.length > 1) {
                console.log(updated_trans.rows);
                throw new Error('more than one transaction has been created in db. Something is not right...');
            }
            // init transaction object
            let transaction = new transaction_1.Transaction(updated_trans.rows[0].id, updated_trans.rows[0].name, updated_trans.rows[0].amount, updated_trans.rows[0].date, updated_trans.rows[0].category_id);
            // return transaction object
            return transaction;
        });
    }
}
module.exports = TransactionService;
