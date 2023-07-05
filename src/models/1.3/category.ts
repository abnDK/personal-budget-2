export class Category {
    name: string;
    amount: number;
    parent_id: any;
    budget_id: any;



    constructor(name: string, amount: number, parent_id?: number, budget_id?: number) {
        this.name = name;
        this.amount = amount;
        this.parent_id = parent_id;
        this.budget_id = budget_id;

    }

    // for assertions of instances type.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
    get [Symbol.toStringTag]() {
        return 'Category';
    }
}