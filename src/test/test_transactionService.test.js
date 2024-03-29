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
// TEST LIBRARIES
//const chai = require('chai');
const { assert } = require('chai');
const Test_period_1 = require("./Test_period");
// CLASSES UNDER TEST
const TransactionService = require("../services/transactionService");
const category_1 = require("../models/1.3/category");
describe('transactionService', () => {
    describe('.getTransactions()', () => {
        it('Returns array of transactions', () => __awaiter(void 0, void 0, void 0, function* () {
            // ARRANGE
            // ACT
            const transactions = yield TransactionService.getTransactions();
            // VERIFY
            assert.isArray(transactions);
            transactions.forEach(trans => {
                assert.typeOf(trans, 'Transaction', 'element of array is type Transaction');
            });
        }));
        describe('startDate=month_1.primo and endDate=month_1.ultimo', () => {
            it('returns only transactions with date in month 1', () => {
                // ARRANGE
                // ACT
                const transactions = TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_1.ultimo);
                // VERIFY
                transactions.forEach(trans => assert.isTrue(trans.date >= Test_period_1.Test_period.month_1.primo, `${trans.name} - ${trans.date} greater than or equal to first day of month 1`));
                transactions.forEach(trans => assert.isTrue(trans.date <= Test_period_1.Test_period.month_1.ultimo, `${trans.name} - ${trans.date} less than or equal to last day of month 1`));
            });
        });
        describe('startDate=month_1.primo and endDate=month_2.ultimo', () => {
            it('returns only transactions with date in month 1 or 2', () => {
                // ARRANGE
                // ACT
                const transactions = TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_2.ultimo);
                // VERIFY
                transactions.forEach(trans => assert.isTrue(trans.date >= Test_period_1.Test_period.month_1.primo, `${trans.name} - ${trans.date} greater than or equal to first day of month 1`));
                transactions.forEach(trans => assert.isTrue(trans.date <= Test_period_1.Test_period.month_2.ultimo, `${trans.name} - ${trans.date} less than or equal to last day of month 1`));
            });
        });
        describe('startDate=month_1.primo and endDate=month_3.ultimo', () => {
            it('returns only transactions with date in month 1, 2 or 3', () => {
                // ARRANGE
                // ACT
                const transactions = TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_3.ultimo);
                // VERIFY
                transactions.forEach(trans => assert.isTrue(trans.date >= Test_period_1.Test_period.month_1.primo, `${trans.name} - ${trans.date} greater than or equal to first day of month 1`));
                transactions.forEach(trans => assert.isTrue(trans.date <= Test_period_1.Test_period.month_3.ultimo, `${trans.name} - ${trans.date} less than or equal to last day of month 1`));
            });
        });
        describe('startDate=month_1.primo, endDate=month_1.ultimo, category="a"', () => {
            it('returns only transactions with category A', () => {
                // ARRANGE
                let cat_a = new category_1.Category('A', 1);
                // ACT
                const transactions = TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_1.ultimo, cat_a);
                // VERIFY
                transactions.forEach(trans => assert.equal(trans.category.name, cat_a.name, `${trans}: transaction category correct ("${cat_a.name}")`));
            });
        });
        describe('startDate=month_1.primo, endDate=month_2.ultimo, category="a"', () => {
            it('returns only transactions with category A', () => {
                // ARRANGE
                let cat_a = new category_1.Category('A', 1);
                // ACT
                const transactions = TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_2.ultimo, cat_a);
                // VERIFY
                transactions.forEach(trans => assert.equal(trans.category.name, cat_a.name, `${trans}: transaction category correct ("${cat_a.name}")`));
            });
        });
        describe('startDate=month_1.ultimo, endDate=month_1.primo', () => {
            it('throws RangeError as endDate cannot be before startDate', () => {
                // ARRANGE
                const getTransactions = TransactionService.getTransactions;
                // ACT
                const getTransactionsWithInvalidDateInput = getTransactions.bind(TransactionService, Test_period_1.Test_period.month_1.ultimo, Test_period_1.Test_period.month_1.primo);
                // VERIFY
                assert.throws(getTransactionsWithInvalidDateInput, RangeError);
            });
        });
    });
    describe('.getTransactionsById()', () => {
        describe('no id', () => {
            it('throws error', () => {
                throw new Error('not implemented yet');
            });
        });
        describe('invalid id', () => {
            it('throws error', () => {
                throw new Error('not implemented yet');
            });
        });
        describe('valid id', () => {
            it('returns transaction object', () => {
                throw new Error('not implemented yet');
            });
            it('return correct transaction', () => {
                throw new Error('not implemented yet');
            });
        });
    });
    describe('.createTransaction()', () => {
        describe('valid params', () => {
            it('creates transaction', () => {
                throw new Error('not implemented yet');
            });
            it('returns created transaction with id', () => {
                throw new Error('not implemented yet');
            });
        });
        describe('invalid params', () => {
            describe('missing name', () => {
                it('throws error', () => {
                    throw new Error('not implemented yet');
                });
            });
            describe('missing amount', () => {
                it('throws error', () => {
                    throw new Error('not implemented yet');
                });
            });
            describe('missing date', () => {
                it('throws error', () => {
                    throw new Error('not implemented yet');
                });
            });
        });
    });
    describe('.deleteTransaction()', () => {
        describe('valid id', () => {
            it('deletes transaction from db', () => {
                throw new Error('not implemented yet');
            });
            it('returns message with id of deleted transaction', () => {
                throw new Error('not implemented yet');
            });
        });
        describe('invalid id', () => {
            it('throws error', () => {
                throw new Error('not implemented yet');
            });
            it('no transactions deleted', () => {
                throw new Error('not implemented yet');
            });
        });
        describe('missing id', () => {
            it('throws error', () => {
                throw new Error('not implemented yet');
            });
            it('no transactions deleted', () => {
                throw new Error('not implemented yet');
            });
        });
    });
});
