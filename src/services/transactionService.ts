import { Category } from "../models/1.3/category";
import { Transaction } from "../models/1.3/transaction";

export class TransactionService {
    // service will get models/dataclasses
    // service will call db service
    // service will return array of class type xyz


    // service will be called by router (API)
    // i.e. GET request goes through transactionService which in turn calls the databaseService, that gets the data. transactionService then packs the data in i.e. an array and returns to route as response.

    mockData: Array<Transaction>

    static getMockdata() {
        let mockData = new Array();

        /**
         * Testdata covers 3 months
         * month 1: 2 transactions with category A
         * month 2: 2 transactions with category A, 2 transactions with category B
         * month 3: 2 transactions with category B
         */

        // CATEGORIES
        let cat_a = new Category("a", 10);
        let cat_b = new Category("b", 20);

        // MONTHS
        let month_1_primo = new Date(2020, 0, 1, 1) // set to day one of month 0 ('january') at 1 o'clock (1) - as time is UTC, it will be set 1 hour earlier, we need to compensate
        let month_1_ultimo = new Date(2020, 0, 31, 1)
        let month_2_primo = new Date(2020, 1, 1, 1) 
        let month_2_ultimo = new Date(2020, 1, 28, 1)
        let month_3_primo = new Date(2020, 2, 1, 1) 
        let month_3_ultimo = new Date(2020, 2, 31, 2) // for some reasen we need to compensate by 2 hours in march?!

        // MONTH 1, A      
        let trans_month1_a_1 = new Transaction(1, "trans_month1_a_1", 1, month_1_primo);
        trans_month1_a_1.category = cat_a;
        mockData.push(trans_month1_a_1);

        let trans_month1_a_2 = new Transaction(2, "trans_month1_a_2", 2, month_1_ultimo);
        trans_month1_a_2.category = cat_a;
        mockData.push(trans_month1_a_2);

        // MONTH 2, A
        let trans_month2_a_1 = new Transaction(3, "trans_month2_a_1", 3, month_2_primo);
        trans_month2_a_1.category = cat_a;
        mockData.push(trans_month2_a_1);

        let trans_month2_a_2 = new Transaction(4, "trans_month2_a_2", 4, month_2_ultimo);
        trans_month2_a_2.category = cat_a;
        mockData.push(trans_month2_a_2);

        // MONTH 2, B
        let trans_month2_b_1 = new Transaction(5, "trans_month2_b_1", 5, month_2_primo);
        trans_month2_b_1.category = cat_b;
        mockData.push(trans_month2_b_1);

        let trans_month2_b_2 = new Transaction(6, "trans_month2_b_2", 6, month_2_ultimo);
        trans_month2_b_2.category = cat_b;
        mockData.push(trans_month2_b_2);

        // MONTH 3, B
        let trans_month3_b_1 = new Transaction(7, "trans_month3_b_1", 7, month_3_primo);
        trans_month3_b_1.category = cat_b;
        mockData.push(trans_month3_b_1);

        let trans_month3_b_2 = new Transaction(8, "trans_month3_b_2", 8, month_3_ultimo);
        trans_month3_b_2.category = cat_b;
        mockData.push(trans_month3_b_2);
        
        return mockData;

    }

    static getTransactions(startDate?: Date, endDate?: Date, category?: Category): Array<Transaction> {
        // get Transactions in database

        // build array of transactions
        let mockData = this.getMockdata();
        


        return mockData;
    }

}

