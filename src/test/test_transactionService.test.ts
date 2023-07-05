// TEST LIBRARIES
//const chai = require('chai');
const { assert } = require('chai');
import { Test_period } from "./Test_period"

// CLASSES UNDER TEST
import { TransactionService } from "../services/transactionService";


// const chaiHttp = require('chai-http');
// const chaiSorted = require('chai-sorted');
// const chai_sorted = require('chai-sorted');
// const { query } = require('express');
// chai.use(chaiHttp);
// chai.use(chai_sorted);
// const { pool } = require('../db'); // in medium article on test, this would have been "const { client } = require(./poolClient)"
// const { Post } = require('../Model/Post');

describe('transactionService', () => {
    it('.getTransactions() returns array of transactions', () => {
        const Transactions = TransactionService.getTransactions();
        assert.typeOf(Transactions, 'Array', 'getTransactions returns an array')
        Transactions.forEach(trans => {
            console.log(trans)
            assert.typeOf(trans, 'Transaction', 'element of array is type Transaction')
        })


    })

    it('.getTransactions(startDate=month_1, endDate=month_1) returns 2 transactions with date in month 1', () => {
        // first and last day of a month:
        // https://stackoverflow.com/questions/222309/calculate-last-day-of-month

        let startDate = Test_period.month_1.primo;
        let endDate = Test_period.month_1.ultimo;
        const Transactions = TransactionService.getTransactions(startDate, endDate);
        console.log(Transactions) // SHOULD ASSERT ONLY IN MONTH 1 TRANSACTIONS IS RETURNED

    })
})