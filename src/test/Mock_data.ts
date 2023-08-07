import { Transaction } from "../models/1.3/transaction";
import { Category } from "../models/1.3/category";
import { Test_period } from "./Test_period";


export class Mock_data {
    mockTransactions: Array<Transaction>

    static getMockTransactions(): Array<Transaction> {
        let mockTransactions = new Array();

        /**
         * Testdata covers 3 months
         * month 1: 2 transactions with category A, 1 transaction without category
         * month 2: 2 transactions with category A, 1 transactions with category B, 1 transaction without category
         * month 3: 1 transactions with category B
         */

        // CATEGORIES
        let cat_a = new Category("A", 10);
        let cat_b = new Category("B", 20);

        
        // MONTH 1, A      
        let trans_month1_a_1 = new Transaction(1, "trans_month1_a_1", 1, Test_period.month_1.primo);
        trans_month1_a_1.category = cat_a;
        mockTransactions.push(trans_month1_a_1);

        let trans_month1_a_2 = new Transaction(2, "trans_month1_a_2", 2, Test_period.month_1.ultimo);
        trans_month1_a_2.category = cat_a;
        mockTransactions.push(trans_month1_a_2);

        // MONTH 1, None
        let trans_month1_none_1 = new Transaction(3, "trans_month1_none_1", 1, Test_period.month_1.medio);
        
        mockTransactions.push(trans_month1_none_1);


        // MONTH 2, A
        let trans_month2_a_1 = new Transaction(4, "trans_month2_a_1", 3, Test_period.month_2.primo);
        trans_month2_a_1.category = cat_a;
        mockTransactions.push(trans_month2_a_1);

        let trans_month2_a_2 = new Transaction(5, "trans_month2_a_2", 4, Test_period.month_2.ultimo);
        trans_month2_a_2.category = cat_a;
        mockTransactions.push(trans_month2_a_2);

        // MONTH 2, B
        let trans_month2_b_1 = new Transaction(6, "trans_month2_b_1", 5, Test_period.month_2.primo);
        trans_month2_b_1.category = cat_b;
        mockTransactions.push(trans_month2_b_1);



        // MONTH 2, None
        let trans_month2_none_1 = new Transaction(7, "trans_month2_none_1", 1, Test_period.month_2.medio);
        
        mockTransactions.push(trans_month2_none_1);

        // MONTH 3, B
        let trans_month3_b_1 = new Transaction(8, "trans_month3_b_1", 7, Test_period.month_3.primo);
        trans_month3_b_1.category = cat_b;
        mockTransactions.push(trans_month3_b_1);


        
        return mockTransactions;

    }
}