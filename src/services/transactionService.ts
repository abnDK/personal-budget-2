const CategoryService = require("./categoryService");
import { Transaction } from "../models/1.3/transaction";
const pool = require("../configs/queries");
const CustomError = require("../utils/errors/CustomError");
const ErrorTextHelper = require("../utils/errors/Texthelper/textHelper");

interface pgError extends Error {
    code: string;
}

interface resTransaction {
    id: number;
    name: string;
    amount: number;
    category_id: number;
    date: Date;
}

class TransactionService {
    static async getTransactions(): Promise<Array<Transaction>> {
        // get Transactions in database
        let data = await pool
            .query("SELECT * FROM transaction ORDER BY id ASC")
            .catch((err: pgError) => {
                if (err.code === "42P01") {
                    // 42P01 is when table name is unkown
                    let errorMessage = ErrorTextHelper.get(
                        "TRANSACTION.READ.ERROR.INVALIDTABLENAME"
                    ).split("<");

                    // splitting to add the tablename to errormessage
                    errorMessage[1] = err.message.split('"')[1];
                    const error = new CustomError(
                        `${errorMessage.join()}`, //err.message.replace("relation", "table"),
                        500,
                        false
                    );
                    throw error;
                } else {
                    throw new CustomError(err.message, 400);
                }
            });

        // build array of transactions
        let transactions = data.rows.map((resTransaction: resTransaction) => {
            let date: Date = resTransaction.date
                ? new Date(resTransaction.date)
                : new Date();

            return new Transaction(
                resTransaction.id,
                resTransaction.name,
                resTransaction.amount,
                date,
                resTransaction.category_id
            );
        });

        return transactions;
    }

    static async getTransactionById(id: number): Promise<Transaction> {
        // get Transaction in database
        let data = await pool
            .query("SELECT * FROM transaction WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data.rowCount === 0) {
            throw new CustomError(
                ErrorTextHelper.get("TRANSACTION.READ.ERROR.INVALIDID"),
                404
            );
        }

        // init transaction as Transaction object
        let transaction_in_array = data.rows.map(
            (resTransaction: resTransaction) => {
                let date: Date = resTransaction.date
                    ? new Date(resTransaction.date)
                    : new Date();

                return new Transaction(
                    resTransaction.id,
                    resTransaction.name,
                    resTransaction.amount,
                    date,
                    resTransaction.category_id
                );
            }
        );

        let transaction = transaction_in_array[0];

        return transaction;
    }

    static async createTransaction(
        name: string,
        amount: number,
        date: Date,
        category_id?: number,
        recipient?: string,
        comment?: string
    ): Promise<Transaction> {
        let category;

        // if no category_id; set to undefined
        if (!category_id) {
            category_id = undefined;
        } else {
            // verify category_id if given
            await CategoryService.exists(category_id).catch((err: Error) => {
                throw err;
            });
        }

        // create transaction
        let data_trans = await pool
            .query(
                "INSERT INTO transaction (name, amount, date, category_id, recipient, comment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [name, amount, date, category_id, recipient, comment]
            )
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data_trans.rowCount === 0) {
            throw new CustomError(
                ErrorTextHelper.get("TRANSACTION.CREATE.ERROR.NOROWCREATED"),
                400
            );
        }
        if (data_trans.rowCount !== 1) {
            throw new CustomError(
                ErrorTextHelper.get(
                    "TRANSACTION.CREATE.ERROR.MORETHANONEROWCREATED"
                ),
                400
            );
        }

        // init transaction object
        let transaction = new Transaction(
            data_trans.rows[0].id,
            data_trans.rows[0].name,
            data_trans.rows[0].amount,
            data_trans.rows[0].date,
            data_trans.rows[0].category_id
        );

        // return transaction object
        return transaction;
    }

    static async deleteTransaction(delete_id: string): Promise<Transaction> {
        // parse id
        const id: number = parseInt(delete_id);

        // query db
        const to_be_deleted_transaction_sql_object: { rows: [] } = await pool
            .query("SELECT * FROM transaction WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // verify id only equals 1 transaction
        if (to_be_deleted_transaction_sql_object["rows"].length === 0) {
            throw new CustomError(
                ErrorTextHelper.get("TRANSACTION.READ.ERROR.INVALIDID"),
                404
            );
        }

        // delete transaction in db
        const deleted_transaction_sql_object: {
            rows: Array<{
                id: number;
                name: string;
                amount: number;
                date: Date;
            }>;
        } = await pool
            .query("DELETE FROM transaction WHERE id = $1 RETURNING *", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // create Transaction object
        const deleted_transaction: Transaction = new Transaction(
            deleted_transaction_sql_object["rows"][0].id,
            deleted_transaction_sql_object["rows"][0].name,
            deleted_transaction_sql_object["rows"][0].amount,
            deleted_transaction_sql_object["rows"][0].date
        );

        // send response
        return deleted_transaction;
    }

    static async updateTransaction(
        id: number,
        name?: string,
        amount?: number,
        date?: Date,
        category_id?: number | null,
        recipient?: string,
        comment?: string
    ): Promise<Transaction> {
        let pre_updated_trans_response = await pool
            .query("SELECT * FROM transaction WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (pre_updated_trans_response.rowCount === 0) {
            throw new CustomError(
                ErrorTextHelper.get("TRANSACTION.READ.ERROR.INVALIDID"),
                404
            );
        }

        // verify category_id
        await CategoryService.exists(category_id).catch((err: Error) => {
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
        let updated_trans = await pool
            .query(
                "UPDATE transaction SET name = $2, amount = $3, date = $4, category_id = $5, recipient = $6, comment = $7 WHERE id = $1 RETURNING *",
                [id, name, amount, date, category_id, recipient, comment]
            )
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // init transaction object
        let transaction = new Transaction(
            updated_trans.rows[0].id,
            updated_trans.rows[0].name,
            updated_trans.rows[0].amount,
            updated_trans.rows[0].date,
            updated_trans.rows[0].category_id
        );

        // return transaction object
        return transaction;
    }
}

module.exports = TransactionService;
