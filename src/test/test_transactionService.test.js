"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TEST LIBRARIES
//const chai = require('chai');
var assert = require('chai').assert;
var Test_period_1 = require("./Test_period");
// CLASSES UNDER TEST
var transactionService_1 = require("../services/transactionService");
var category_1 = require("../models/1.3/category");
// const chaiHttp = require('chai-http');
// const chaiSorted = require('chai-sorted');
// const chai_sorted = require('chai-sorted');
// const { query } = require('express');
// chai.use(chaiHttp);
// chai.use(chai_sorted);
// const { pool } = require('../db'); // in medium article on test, this would have been "const { client } = require(./poolClient)"
// const { Post } = require('../Model/Post');
describe('transactionService', function () {
    describe('.getTransactions()', function () {
        it('Returns array of transactions', function () {
            // ARRANGE
            // ACT
            var transactions = transactionService_1.TransactionService.getTransactions();
            // VERIFY
            assert.isArray(transactions);
            transactions.forEach(function (trans) {
                assert.typeOf(trans, 'Transaction', 'element of array is type Transaction');
            });
        });
        it('Returns 8 transactions', function () {
            // ARRANGE
            // ACT
            var transactions = transactionService_1.TransactionService.getTransactions();
            // VERIFY
            assert.lengthOf(transactions, 8, '8 transactions returned');
        });
        describe('startDate=month_1.primo and endDate=month_1.ultimo', function () {
            it('returns 3 transactions', function () {
                // ARRANGE
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_1.ultimo);
                // VERIFY
                assert.lengthOf(transactions, 3, '3 transactions returned');
            });
            it('returns only transactions with date in month 1', function () {
                // ARRANGE
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_1.ultimo);
                // VERIFY
                transactions.forEach(function (trans) { return assert.isTrue(trans.date >= Test_period_1.Test_period.month_1.primo, "".concat(trans.name, " - ").concat(trans.date, " greater than or equal to first day of month 1")); });
                transactions.forEach(function (trans) { return assert.isTrue(trans.date <= Test_period_1.Test_period.month_1.ultimo, "".concat(trans.name, " - ").concat(trans.date, " less than or equal to last day of month 1")); });
            });
        });
        describe('startDate=month_1.primo and endDate=month_2.ultimo', function () {
            it('returns 7 transactions', function () {
                // ARRANGE
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_2.ultimo);
                // VERIFY
                assert.lengthOf(transactions, 7, '7 transactions returned');
            });
            it('returns only transactions with date in month 1 or 2', function () {
                // ARRANGE
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_2.ultimo);
                // VERIFY
                transactions.forEach(function (trans) { return assert.isTrue(trans.date >= Test_period_1.Test_period.month_1.primo, "".concat(trans.name, " - ").concat(trans.date, " greater than or equal to first day of month 1")); });
                transactions.forEach(function (trans) { return assert.isTrue(trans.date <= Test_period_1.Test_period.month_2.ultimo, "".concat(trans.name, " - ").concat(trans.date, " less than or equal to last day of month 1")); });
            });
        });
        describe('startDate=month_1.primo and endDate=month_3.ultimo', function () {
            it('returns 8 transactions', function () {
                // ARRANGE
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_3.ultimo);
                // VERIFY
                assert.lengthOf(transactions, 8, '8 transactions returned');
            });
            it('returns only transactions with date in month 1, 2 or 3', function () {
                // ARRANGE
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_3.ultimo);
                // VERIFY
                transactions.forEach(function (trans) { return assert.isTrue(trans.date >= Test_period_1.Test_period.month_1.primo, "".concat(trans.name, " - ").concat(trans.date, " greater than or equal to first day of month 1")); });
                transactions.forEach(function (trans) { return assert.isTrue(trans.date <= Test_period_1.Test_period.month_3.ultimo, "".concat(trans.name, " - ").concat(trans.date, " less than or equal to last day of month 1")); });
            });
        });
        describe('startDate=month_4.primo, endDate=month_4.ultimo', function () {
            it('returns empty array', function () {
                // ARRANGE
                var startDate = Test_period_1.Test_period.month_4.primo;
                var endDate = Test_period_1.Test_period.month_4.ultimo;
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(startDate, endDate);
                // VERIFY
                assert.lengthOf(transactions, 0, '0 transactions returned');
            });
        });
        describe('startDate=month_1.primo, endDate=month_1.ultimo, category="a"', function () {
            it('returns 2 transactions', function () {
                // ARRANGE
                var cat_a = new category_1.Category('A', 1);
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_1.ultimo, cat_a);
                // VERIFY
                assert.lengthOf(transactions, 2, '2 transactions returned');
            });
            it('returns only transactions with category A', function () {
                // ARRANGE
                var cat_a = new category_1.Category('A', 1);
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_1.ultimo, cat_a);
                // VERIFY
                transactions.forEach(function (trans) { return assert.equal(trans.category.name, cat_a.name, "".concat(trans, ": transaction category correct (\"").concat(cat_a.name, "\")")); });
            });
        });
        describe('startDate=month_1.primo, endDate=month_2.ultimo, category="a"', function () {
            it('returns 4 transactions', function () {
                // ARRANGE
                var cat_a = new category_1.Category('A', 1);
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_2.ultimo, cat_a);
                // VERIFY
                assert.lengthOf(transactions, 4, '4 transactions returned');
            });
            it('returns only transactions with category A', function () {
                // ARRANGE
                var cat_a = new category_1.Category('A', 1);
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_2.ultimo, cat_a);
                // VERIFY
                transactions.forEach(function (trans) { return assert.equal(trans.category.name, cat_a.name, "".concat(trans, ": transaction category correct (\"").concat(cat_a.name, "\")")); });
            });
        });
        describe('startDate=month_3.primo, endDate=month_3.ultimo, category="a"', function () {
            it('returns empty array', function () {
                // ARRANGE
                var cat_a = new category_1.Category('A', 1);
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_3.primo, Test_period_1.Test_period.month_3.ultimo, cat_a);
                // VERIFY
                assert.lengthOf(transactions, 0, 'empty array returned');
            });
        });
        /**
         * if only endDate given, filter is everything before end date // can only do if using interface as a way of defining function with named parameters. Let's do it later.
         * if only startDate given, filter is everthing efter start data // can only do if using interface as a way of defining function with named parameters. Let's do it later.
         * if endDate is before startDate, error is thrown
         *
         * make sure to have boundary value elements to test against
         */
        describe('startDate=month_1.ultimo, endDate=month_1.primo', function () {
            it('throws RangeError as endDate cannot be before startDate', function () {
                // ARRANGE
                var getTransactions = transactionService_1.TransactionService.getTransactions;
                // ACT
                var getTransactionsWithInvalidDateInput = getTransactions.bind(transactionService_1.TransactionService, Test_period_1.Test_period.month_1.ultimo, Test_period_1.Test_period.month_1.primo);
                // VERIFY
                assert.throws(getTransactionsWithInvalidDateInput, RangeError);
            });
        });
    });
});
