"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TEST LIBRARIES
//const chai = require('chai');
var assert = require('chai').assert;
var Test_period_1 = require("./Test_period");
// CLASSES UNDER TEST
var transactionService_1 = require("../services/transactionService");
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
            var transactions = transactionService_1.TransactionService.getTransactions();
            assert.isArray(transactions);
            transactions.forEach(function (trans) {
                console.log(trans);
                assert.typeOf(trans, 'Transaction', 'element of array is type Transaction');
            });
        });
        describe('startDate=month_1 and endDate=month_1', function () {
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
        describe('startDate=month_1 and endDate=month_2', function () {
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
        describe('startDate=month_1 and endDate=month_3', function () {
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
        describe('startDate=month_1, endDate=month_1, category="a"', function () {
            it('returns 2 transactions', function () {
                // ARRANGE
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_1.ultimo);
                // VERIFY
                assert.lengthOf(transactions, 2, '2 transactions returned');
            });
            it('returns only transactions with category A', function () {
                // ARRANGE
                // ACT
                var transactions = transactionService_1.TransactionService.getTransactions(Test_period_1.Test_period.month_1.primo, Test_period_1.Test_period.month_1.ultimo);
                // VERIFY
                transactions.forEach(function (trans) { return assert.equal(trans.category.name, 'a', "".concat(trans, ": transaction category correct (\"a\")")); });
            });
        });
    });
});
