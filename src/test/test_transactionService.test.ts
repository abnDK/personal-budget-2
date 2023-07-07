// TEST LIBRARIES
//const chai = require('chai');
const { assert } = require('chai');
import { Test_period } from "./Test_period"

// CLASSES UNDER TEST
import { TransactionService } from "../services/transactionService";
import { Category } from "../models/1.3/category";


// const chaiHttp = require('chai-http');
// const chaiSorted = require('chai-sorted');
// const chai_sorted = require('chai-sorted');
// const { query } = require('express');
// chai.use(chaiHttp);
// chai.use(chai_sorted);
// const { pool } = require('../db'); // in medium article on test, this would have been "const { client } = require(./poolClient)"
// const { Post } = require('../Model/Post');

describe('transactionService', () => {
    describe('.getTransactions()', () => {
        it('Returns array of transactions', () => {
            // ARRANGE

            // ACT
            const transactions = TransactionService.getTransactions();
            
            // VERIFY
            assert.isArray(transactions)
            transactions.forEach(trans => {
                assert.typeOf(trans, 'Transaction', 'element of array is type Transaction')
            })


        })
        it('Returns 8 transactions', () => {
            // ARRANGE

            // ACT
            const transactions = TransactionService.getTransactions();

            // VERIFY
            assert.lengthOf(transactions, 8, '8 transactions returned')
            })


        })
        
        describe('startDate=month_1 and endDate=month_1', () => {
            it('returns 3 transactions', () => {
            // ARRANGE

            // ACT
            const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_1.ultimo);

            // VERIFY
            assert.lengthOf(transactions, 3, '3 transactions returned')

            })

            it('returns only transactions with date in month 1', () => {
                // ARRANGE

                // ACT
                const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_1.ultimo);

                // VERIFY
                transactions.forEach(trans => assert.isTrue(trans.date >= Test_period.month_1.primo, `${trans.name} - ${trans.date} greater than or equal to first day of month 1`))
                transactions.forEach(trans => assert.isTrue(trans.date <= Test_period.month_1.ultimo, `${trans.name} - ${trans.date} less than or equal to last day of month 1`))
            })
        })

        describe('startDate=month_1 and endDate=month_2', () => {
            it('returns 7 transactions', () => {
            // ARRANGE

            // ACT
            const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_2.ultimo);

            // VERIFY
            assert.lengthOf(transactions, 7, '7 transactions returned')

            })

            it('returns only transactions with date in month 1 or 2', () => {
                // ARRANGE

                // ACT
                const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_2.ultimo);

                // VERIFY

                transactions.forEach(trans => assert.isTrue(trans.date >= Test_period.month_1.primo, `${trans.name} - ${trans.date} greater than or equal to first day of month 1`))
                transactions.forEach(trans => assert.isTrue(trans.date <= Test_period.month_2.ultimo, `${trans.name} - ${trans.date} less than or equal to last day of month 1`))
            })
        })

        describe('startDate=month_1 and endDate=month_3', () => {
            it('returns 8 transactions', () => {
            // ARRANGE

            // ACT
            const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_3.ultimo);

            // VERIFY
            assert.lengthOf(transactions, 8, '8 transactions returned')

            })

            it('returns only transactions with date in month 1, 2 or 3', () => {
                // ARRANGE

                // ACT
                const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_3.ultimo);

                // VERIFY

                transactions.forEach(trans => assert.isTrue(trans.date >= Test_period.month_1.primo, `${trans.name} - ${trans.date} greater than or equal to first day of month 1`))
                transactions.forEach(trans => assert.isTrue(trans.date <= Test_period.month_3.ultimo, `${trans.name} - ${trans.date} less than or equal to last day of month 1`))
            })
        })

        describe('startDate=month_1, endDate=month_1, category="a"', () => {
            it('returns 2 transactions', () => {
                // ARRANGE
                let cat_a = new Category('A', 1)

                // ACT
                const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_1.ultimo, cat_a);

                // VERIFY
                assert.lengthOf(transactions, 2, '2 transactions returned')

            })

            it('returns only transactions with category A', () => {
                // ARRANGE
                let cat_a = new Category('A', 1)

                // ACT
                const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_1.ultimo, cat_a);

                // VERIFY
                transactions.forEach(trans => assert.equal(trans.category.name, cat_a.name, `${trans}: transaction category correct ("${cat_a.name}")`))
            })
        })
        describe('startDate=month_1, endDate=month_2, category="a"', () => {
            it('returns 4 transactions', () => {
                // ARRANGE
                let cat_a = new Category('A', 1)

                // ACT
                const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_2.ultimo, cat_a);

                // VERIFY
                assert.lengthOf(transactions, 4, '4 transactions returned')

            })

            it('returns only transactions with category A', () => {
                // ARRANGE
                let cat_a = new Category('A', 1)

                // ACT
                const transactions = TransactionService.getTransactions(Test_period.month_1.primo, Test_period.month_2.ultimo, cat_a);

                // VERIFY
                transactions.forEach(trans => assert.equal(trans.category.name, cat_a.name, `${trans}: transaction category correct ("${cat_a.name}")`))
            })
        })
        describe('startDate=month_3, endDate=month_3, category="a"', () => {
            it('returns empty array', () => {
                // ARRANGE
                let cat_a = new Category('A', 1)

                // ACT
                const transactions = TransactionService.getTransactions(Test_period.month_3.primo, Test_period.month_3.ultimo, cat_a);

                // VERIFY
                assert.lengthOf(transactions, 0, 'empty array returned')

            })

            
        })
    })
