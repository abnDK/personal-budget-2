export class Budget {
    constructor(name, date_start, date_end, id) {
        this.name = name;
        this.date_start = date_start;
        this.date_end = date_end;
        this.id = id;
    }
    // for assertions of instances type.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
    get [Symbol.toStringTag]() {
        return 'Budget';
    }
}
