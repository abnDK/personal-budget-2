// mock db for testing services when updating / migrating db tables
import { ICategory } from "../models/1.4/category";
import { IBudget } from "../models/1.4/budget";
import { ITransaction } from "../models/1.4/transaction";
export const mockDB = {
    budgets: [{}],
    categories: [],
    transactions: [],
};
