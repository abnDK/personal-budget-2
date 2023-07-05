"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TEST LIBRARIES
//const chai = require('chai');
var assert = require('chai').assert;
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
    it('.getTransactions() returns array of transactions', function () {
        var Transactions = transactionService_1.TransactionService.getTransactions();
        assert.typeOf(Transactions, 'Array', 'getTransactions returns an array');
        Transactions.forEach(function (trans) {
            console.log(trans);
            assert.typeOf(trans, 'Transaction', 'element of array is type Transaction');
        });
    });
    it('.getTransactions(startDate=month_1, endDate=month_1) returns 2 transactions with date in month 1', function () {
        // first and last day of a month:
        // https://stackoverflow.com/questions/222309/calculate-last-day-of-month
        var startDate = new Date(2020, 0, 1, 1);
        var endDate = new Date(2020, 1, 0, 1);
        var Transactions = transactionService_1.TransactionService.getTransactions(startDate, endDate);
        console.log(Transactions);
    });
});
