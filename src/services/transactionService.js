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
const CategoryService = require("./categoryService");
const transaction_1 = require("../models/1.3/transaction");
const pool = require("../configs/queries");
const CustomError = require("../utils/errors/CustomError");
const ErrorTextHelper = require("../utils/errors/Texthelper/textHelper");
class TransactionService {
    static getTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            // get Transactions in database
            let data = yield pool
                .query("SELECT * FROM transaction ORDER BY id ASC")
                .catch((err) => {
                if (err.code === "42P01") {
                    // 42P01 is when table name is unkown
                    let errorMessage = ErrorTextHelper.get("TRANSACTION.READ.ERROR.INVALIDTABLENAME").split("<");
                    // splitting to add the tablename to errormessage
                    errorMessage[1] = err.message.split('"')[1];
                    const error = new CustomError(`${errorMessage.join()}`, //err.message.replace("relation", "table"),
                    500, false);
                    throw error;
                }
                else {
                    throw new CustomError(err.message, 400);
                }
            });
            // build array of transactions
            let transactions = data.rows.map((resTransaction) => {
                let date = resTransaction.date
                    ? new Date(resTransaction.date)
                    : new Date();
                return new transaction_1.Transaction(resTransaction.id, resTransaction.name, resTransaction.amount, date, resTransaction.category_id);
            });
            return transactions;
        });
    }
    static getTransactionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // get Transaction in database
            let data = yield pool
                .query("SELECT * FROM transaction WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (data.rowCount === 0) {
                throw new CustomError(ErrorTextHelper.get("TRANSACTION.READ.ERROR.INVALIDID"), 404);
            }
            // init transaction as Transaction object
            let transaction_in_array = data.rows.map((resTransaction) => {
                let date = resTransaction.date
                    ? new Date(resTransaction.date)
                    : new Date();
                return new transaction_1.Transaction(resTransaction.id, resTransaction.name, resTransaction.amount, date, resTransaction.category_id);
            });
            let transaction = transaction_in_array[0];
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
                // verify category_id if given
                yield CategoryService.exists(category_id).catch((err) => {
                    throw err;
                });
            }
            // create transaction
            let data_trans = yield pool
                .query("INSERT INTO transaction (name, amount, date, category_id, recipient, comment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [name, amount, date, category_id, recipient, comment])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (data_trans.rowCount === 0) {
                throw new CustomError(ErrorTextHelper.get("TRANSACTION.CREATE.ERROR.NOROWCREATED"), 400);
            }
            if (data_trans.rowCount !== 1) {
                throw new CustomError(ErrorTextHelper.get("TRANSACTION.CREATE.ERROR.MORETHANONEROWCREATED"), 400);
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
            const to_be_deleted_transaction_sql_object = yield pool
                .query("SELECT * FROM transaction WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            // verify id only equals 1 transaction
            if (to_be_deleted_transaction_sql_object["rows"].length === 0) {
                throw new CustomError(ErrorTextHelper.get("TRANSACTION.READ.ERROR.INVALIDID"), 404);
            }
            // delete transaction in db
            const deleted_transaction_sql_object = yield pool
                .query("DELETE FROM transaction WHERE id = $1 RETURNING *", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            // create Transaction object
            const deleted_transaction = new transaction_1.Transaction(deleted_transaction_sql_object["rows"][0].id, deleted_transaction_sql_object["rows"][0].name, deleted_transaction_sql_object["rows"][0].amount, deleted_transaction_sql_object["rows"][0].date);
            // send response
            return deleted_transaction;
        });
    }
    static updateTransaction(id, name, amount, date, category_id, recipient, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            let pre_updated_trans_response = yield pool
                .query("SELECT * FROM transaction WHERE id = $1", [id])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            if (pre_updated_trans_response.rowCount === 0) {
                throw new CustomError(ErrorTextHelper.get("TRANSACTION.READ.ERROR.INVALIDID"), 404);
            }
            // verify category_id
            yield CategoryService.exists(category_id).catch((err) => {
                throw err;
            });
            const pre_updated_trans = pre_updated_trans_response["rows"][0];
            // setting previous values, if no new is given.
            name = name ? name : pre_updated_trans.name;
            amount = amount ? amount : pre_updated_trans.amount;
            date = date ? date : pre_updated_trans.date;
            category_id = category_id ? category_id : null; //pre_updated_trans.category_id; // WHY ARE WE SETTING TO NULL ?
            recipient = recipient ? recipient : pre_updated_trans.recipient;
            comment = comment ? comment : pre_updated_trans.comment;
            // update transaction
            let updated_trans = yield pool
                .query("UPDATE transaction SET name = $2, amount = $3, date = $4, category_id = $5, recipient = $6, comment = $7 WHERE id = $1 RETURNING *", [id, name, amount, date, category_id, recipient, comment])
                .catch((err) => {
                throw new CustomError(err.message, 400, false);
            });
            // init transaction object
            let transaction = new transaction_1.Transaction(updated_trans.rows[0].id, updated_trans.rows[0].name, updated_trans.rows[0].amount, updated_trans.rows[0].date, updated_trans.rows[0].category_id);
            // return transaction object
            return transaction;
        });
    }
}
module.exports = TransactionService;
