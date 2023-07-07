"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
var category_1 = require("../models/1.3/category");
var transaction_1 = require("../models/1.3/transaction");
var Test_period_1 = require("../test/Test_period");
var TransactionService = /** @class */ (function () {
    function TransactionService() {
    }
    TransactionService.getMockdata = function () {
        var mockData = new Array();
        /**
         * Testdata covers 3 months
         * month 1: 2 transactions with category A, 1 transaction without category
         * month 2: 2 transactions with category A, 1 transactions with category B, 1 transaction without category
         * month 3: 1 transactions with category B
         */
        // CATEGORIES
        var cat_a = new category_1.Category("A", 10);
        var cat_b = new category_1.Category("B", 20);
        // MONTH 1, A      
        var trans_month1_a_1 = new transaction_1.Transaction(1, "trans_month1_a_1", 1, Test_period_1.Test_period.month_1.primo);
        trans_month1_a_1.category = cat_a;
        mockData.push(trans_month1_a_1);
        var trans_month1_a_2 = new transaction_1.Transaction(2, "trans_month1_a_2", 2, Test_period_1.Test_period.month_1.ultimo);
        trans_month1_a_2.category = cat_a;
        mockData.push(trans_month1_a_2);
        // MONTH 1, None
        var trans_month1_none_1 = new transaction_1.Transaction(1, "trans_month1_none_1", 1, Test_period_1.Test_period.month_1.medio);
        mockData.push(trans_month1_none_1);
        // MONTH 2, A
        var trans_month2_a_1 = new transaction_1.Transaction(3, "trans_month2_a_1", 3, Test_period_1.Test_period.month_2.primo);
        trans_month2_a_1.category = cat_a;
        mockData.push(trans_month2_a_1);
        var trans_month2_a_2 = new transaction_1.Transaction(4, "trans_month2_a_2", 4, Test_period_1.Test_period.month_2.ultimo);
        trans_month2_a_2.category = cat_a;
        mockData.push(trans_month2_a_2);
        // MONTH 2, B
        var trans_month2_b_1 = new transaction_1.Transaction(5, "trans_month2_b_1", 5, Test_period_1.Test_period.month_2.primo);
        trans_month2_b_1.category = cat_b;
        mockData.push(trans_month2_b_1);
        // MONTH 2, None
        var trans_month2_none_1 = new transaction_1.Transaction(1, "trans_month2_none_1", 1, Test_period_1.Test_period.month_2.medio);
        mockData.push(trans_month2_none_1);
        // MONTH 3, B
        var trans_month3_b_1 = new transaction_1.Transaction(7, "trans_month3_b_1", 7, Test_period_1.Test_period.month_3.primo);
        trans_month3_b_1.category = cat_b;
        mockData.push(trans_month3_b_1);
        return mockData;
    };
    TransactionService.getTransactions = function (startDate, endDate, category) {
        // get Transactions in database
        // build array of transactions
        var data = this.getMockdata();
        // filter transactions
        if (startDate) {
            data = data.filter(function (trans) { return trans.date >= startDate; });
            if (endDate) {
                data = data.filter(function (trans) { return trans.date <= endDate; });
                if (startDate > endDate) {
                    throw new RangeError('endDate cannot be before startDate');
                }
            }
        }
        if (category) {
            data = data.filter(function (trans) { return trans.category !== undefined; });
            data = data.filter(function (trans) { return trans.category.name == category.name; });
        }
        return data;
    };
    return TransactionService;
}());
exports.TransactionService = TransactionService;
