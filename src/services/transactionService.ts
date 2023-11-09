import { CategoryService } from "./categoryService.js";
import { Transaction } from "../models/1.4/transaction.js";
import { pool } from "../configs/queries.js";
import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
// setting up text helper for error messages
const ETH = new ErrorTextHelper();

interface pgError extends Error {
    code: string;
}

interface resTransaction {
    id: number;
    name: string;
    amount: number;
    create_date: Date;
    category_id: number;
    note: string;
}

export class TransactionService {
    static async getTransactions(): Promise<Array<Transaction>> {
        // get Transactions in database
        let data = await pool
            .query("SELECT * FROM transaction ORDER BY id ASC")
            .catch((err: pgError) => {
                if (err.code === "42P01") {
                    // 42P01 is when table name is unkown
                    let errorMessage = ETH.get(
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
            return new Transaction(
                resTransaction.name,
                resTransaction.amount,
                resTransaction.create_date,
                resTransaction.id,
                resTransaction.category_id,
                resTransaction.note
            );
        });

        return transactions;
    }

    static async getTransactionById(id: number): Promise<Transaction> {
        // get Transaction in database
        let data: { rows: Array<resTransaction>; rowCount: number } = await pool
            .query("SELECT * FROM transaction WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (data.rowCount === 0) {
            throw new CustomError(
                ETH.get("TRANSACTION.READ.ERROR.INVALIDID"),
                404
            );
        }

        // init transaction as Transaction object
        let transaction_in_array = data.rows.map(
            (resTransaction: resTransaction) => {
                return new Transaction(
                    resTransaction.name,
                    resTransaction.amount,
                    resTransaction.create_date,
                    resTransaction.id,
                    resTransaction.category_id,
                    resTransaction.note
                );
            }
        );

        return transaction_in_array[0];
    }

    static async createTransaction(
        name: string,
        amount: number,
        createDate: Date,
        categoryId: number,
        note: string | undefined = undefined
    ): Promise<Transaction> {
        await CategoryService.exists(categoryId).catch((err: Error) => {
            throw err;
        });

        // create transaction
        let data_trans: { rows: Array<resTransaction>; rowCount: number } =
            await pool
                .query(
                    "INSERT INTO transaction (name, amount, create_date, category_id, note) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                    [name, amount, createDate, categoryId, note]
                )
                .catch((err: Error) => {
                    throw new CustomError(err.message, 400, false);
                });

        if (data_trans.rowCount === 0) {
            throw new CustomError(
                ETH.get("TRANSACTION.CREATE.ERROR.NOROWCREATED"),
                400
            );
        }
        if (data_trans.rowCount >= 2) {
            throw new CustomError(
                ETH.get("TRANSACTION.CREATE.ERROR.MORETHANONEROWCREATED"),
                400
            );
        }

        return new Transaction(
            data_trans.rows[0].name,
            data_trans.rows[0].amount,
            data_trans.rows[0].create_date,
            data_trans.rows[0].id,
            data_trans.rows[0].category_id,
            data_trans.rows[0].note
        );
    }

    static async deleteTransaction(delete_id: number): Promise<Transaction> {
        // delete transaction in db
        const deleted_transaction_sql_object: {
            rows: Array<resTransaction>;
            rowCount: number;
        } = await pool
            .query("DELETE FROM transaction WHERE id = $1 RETURNING *", [
                delete_id,
            ])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (deleted_transaction_sql_object.rowCount === 0) {
            throw new CustomError(
                ETH.get("TRANSACTION.READ.ERROR.INVALIDID"),
                404
            );
        }

        return new Transaction(
            deleted_transaction_sql_object["rows"][0].name,
            deleted_transaction_sql_object["rows"][0].amount,
            deleted_transaction_sql_object["rows"][0].create_date,
            deleted_transaction_sql_object["rows"][0].id,
            deleted_transaction_sql_object["rows"][0].category_id,
            deleted_transaction_sql_object["rows"][0].note
        );
    }

    static async updateTransaction(
        id: number,
        name: string | undefined,
        amount: number | undefined,
        createDate: Date | undefined,
        categoryId: number | undefined,
        note: string | undefined
    ): Promise<Transaction> {
        if (!name && !amount && !createDate && !categoryId && !note) {
            throw new CustomError(
                ETH.get("TRANSACTION.UPDATE.ERROR.NOINPUT"),
                400
            );
        }

        let pre_updated_trans_response: {
            rows: Array<resTransaction>;
            rowCount: number;
        } = await pool
            .query("SELECT * FROM transaction WHERE id = $1", [id])
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        if (pre_updated_trans_response.rowCount === 0) {
            throw new CustomError(
                ETH.get("TRANSACTION.READ.ERROR.INVALIDID"),
                404
            );
        }

        const pre_updated_trans = pre_updated_trans_response["rows"][0];
        // setting previous values, if no new is given.
        name = name ? name : pre_updated_trans.name;
        amount = amount ? amount : pre_updated_trans.amount;
        createDate = createDate ? createDate : pre_updated_trans.create_date;
        categoryId = categoryId ? categoryId : pre_updated_trans.category_id;
        note = note ? note : pre_updated_trans.note;

        // verify category_id
        await CategoryService.exists(categoryId).catch((err: Error) => {
            throw err;
        });
        // update transaction
        let updated_trans: {
            rows: Array<resTransaction>;
            rowCount: number;
        } = await pool
            .query(
                "UPDATE transaction SET name = $2, amount = $3, create_date = $4, category_id = $5, note = $6 WHERE id = $1 RETURNING *",
                [id, name, amount, createDate, categoryId, note]
            )
            .catch((err: Error) => {
                throw new CustomError(err.message, 400, false);
            });

        // init transaction object
        return new Transaction(
            updated_trans.rows[0].name,
            updated_trans.rows[0].amount,
            updated_trans.rows[0].create_date,
            updated_trans.rows[0].id,
            updated_trans.rows[0].category_id,
            updated_trans.rows[0].note
        );
    }
}
