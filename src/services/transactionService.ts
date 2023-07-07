import { Category } from "../models/1.3/category";
import { Transaction } from "../models/1.3/transaction";
import { Test_period } from "../test/Test_period";

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
        mockData.push(trans_month1_a_1);

        let trans_month1_a_2 = new Transaction(2, "trans_month1_a_2", 2, Test_period.month_1.ultimo);
        trans_month1_a_2.category = cat_a;
        mockData.push(trans_month1_a_2);

        // MONTH 1, None
        let trans_month1_none_1 = new Transaction(1, "trans_month1_none_1", 1, Test_period.month_1.medio);
        
        mockData.push(trans_month1_none_1);


        // MONTH 2, A
        let trans_month2_a_1 = new Transaction(3, "trans_month2_a_1", 3, Test_period.month_2.primo);
        trans_month2_a_1.category = cat_a;
        mockData.push(trans_month2_a_1);

        let trans_month2_a_2 = new Transaction(4, "trans_month2_a_2", 4, Test_period.month_2.ultimo);
        trans_month2_a_2.category = cat_a;
        mockData.push(trans_month2_a_2);

        // MONTH 2, B
        let trans_month2_b_1 = new Transaction(5, "trans_month2_b_1", 5, Test_period.month_2.primo);
        trans_month2_b_1.category = cat_b;
        mockData.push(trans_month2_b_1);



        // MONTH 2, None
        let trans_month2_none_1 = new Transaction(1, "trans_month2_none_1", 1, Test_period.month_2.medio);
        
        mockData.push(trans_month2_none_1);

        // MONTH 3, B
        let trans_month3_b_1 = new Transaction(7, "trans_month3_b_1", 7, Test_period.month_3.primo);
        trans_month3_b_1.category = cat_b;
        mockData.push(trans_month3_b_1);


        
        return mockData;

    }

    static getTransactions(startDate?: Date, endDate?: Date, category?: Category): Array<Transaction> {
        // get Transactions in database

        // build array of transactions
        let data = this.getMockdata();

        // filter transactions
        if (startDate) {
            data = data.filter(trans => trans.date >= startDate)
            
            if (endDate) {
                data = data.filter(trans => trans.date <= endDate)
                if (startDate > endDate) {throw new RangeError('endDate cannot be before startDate')}
            }

        }

        

        if (category) {

            data = data.filter(trans => trans.category !== undefined)
            
            data = data.filter(trans => trans.category.name == category.name)
        }
        
        return data;
    }

}

