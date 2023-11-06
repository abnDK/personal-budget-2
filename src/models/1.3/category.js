export class Category {
    constructor(name, amount, id, parent_id, budget_id) {
        this.name = name;
        this.amount = amount;
        this.id = id;
        this.parent_id = parent_id;
        this.budget_id = budget_id;
    }
    // for assertions of instances type.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
    get [Symbol.toStringTag]() {
        return 'Category';
    }
}
