export interface IBudget {
    id: number;
    name: string;
    createDate: Date;
    categories?: dbCategory[] | undefined;

    parseVersionBudget(): _VersionBudget; // if no categories, null is returned (not nescessary as BudgetService return null if no categories match  budgetId)
}

/* 
interface baseBudget {
    id: number;
    name: string;
    createDate: Date;
}

interface dbBudget extends baseBudget {
    categories?: dbCategory[] | undefined;

    parseVersionBudget(): _VersionBudget; // if no categories, null is returned (not nescessary as BudgetService return null if no categories match  budgetId)
}

export class Budget {
    id: number | undefined;
    name: string;
    date_start: Date;
    date_end: Date;

    constructor(name: string, date_start: Date, date_end: Date, id?: number) {
        this.name = name;
        this.date_start = date_start;
        this.date_end = date_end;
        this.id = id;
    }

    // for assertions of instances type.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
    get [Symbol.toStringTag]() {
        return "Budget";
    }
}
 */
