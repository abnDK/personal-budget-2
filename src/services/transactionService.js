"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
var category_1 = require("../models/1.3/category");
var transaction_1 = require("../models/1.3/transaction");
var TransactionService = /** @class */ (function () {
    function TransactionService() {
    }
    TransactionService.getMockdata = function () {
        var mockData = new Array();
        /**
         * Testdata covers 3 months
         * month 1: 2 transactions with category A
         * month 2: 2 transactions with category A, 2 transactions with category B
         * month 3: 2 transactions with category B
         */
        // CATEGORIES
        var cat_a = new category_1.Category("a", 10);
        var cat_b = new category_1.Category("b", 20);
        // MONTHS
        var month_1_primo = new Date(2020, 0, 1, 1); // set to day one of month 0 ('january') at 1 o'clock (1) - as time is UTC, it will be set 1 hour earlier, we need to compensate
        var month_1_ultimo = new Date(2020, 0, 31, 1);
        var month_2_primo = new Date(2020, 1, 1, 1);
        var month_2_ultimo = new Date(2020, 1, 28, 1);
        var month_3_primo = new Date(2020, 2, 1, 1);
        var month_3_ultimo = new Date(2020, 2, 31, 2); // for some reasen we need to compensate by 2 hours in march?!
        // MONTH 1, A      
        var trans_month1_a_1 = new transaction_1.Transaction(1, "trans_month1_a_1", 1, month_1_primo);
        trans_month1_a_1.category = cat_a;
        mockData.push(trans_month1_a_1);
        var trans_month1_a_2 = new transaction_1.Transaction(2, "trans_month1_a_2", 2, month_1_ultimo);
        trans_month1_a_2.category = cat_a;
        mockData.push(trans_month1_a_2);
        // MONTH 2, A
        var trans_month2_a_1 = new transaction_1.Transaction(3, "trans_month2_a_1", 3, month_2_primo);
        trans_month2_a_1.category = cat_a;
        mockData.push(trans_month2_a_1);
        var trans_month2_a_2 = new transaction_1.Transaction(4, "trans_month2_a_2", 4, month_2_ultimo);
        trans_month2_a_2.category = cat_a;
        mockData.push(trans_month2_a_2);
        // MONTH 2, B
        var trans_month2_b_1 = new transaction_1.Transaction(5, "trans_month2_b_1", 5, month_2_primo);
        trans_month2_b_1.category = cat_b;
        mockData.push(trans_month2_b_1);
        var trans_month2_b_2 = new transaction_1.Transaction(6, "trans_month2_b_2", 6, month_2_ultimo);
        trans_month2_b_2.category = cat_b;
        mockData.push(trans_month2_b_2);
        // MONTH 3, B
        var trans_month3_b_1 = new transaction_1.Transaction(7, "trans_month3_b_1", 7, month_3_primo);
        trans_month3_b_1.category = cat_b;
        mockData.push(trans_month3_b_1);
        var trans_month3_b_2 = new transaction_1.Transaction(8, "trans_month3_b_2", 8, month_3_ultimo);
        trans_month3_b_2.category = cat_b;
        mockData.push(trans_month3_b_2);
        return mockData;
    };
    TransactionService.getTransactions = function (startDate, endDate, category) {
        // get Transactions in database
        // build array of transactions
        var mockData = this.getMockdata();
        return mockData;
    };
    return TransactionService;
}());
exports.TransactionService = TransactionService;
