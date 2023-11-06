export class Transaction {
    constructor(id, name, amount, date, category_id, recipient, comment) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.date = date;
        this.category_id = category_id;
        this.recipient = recipient;
        this.comment = comment;
    }
    // for assertions of instances type.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
    get [Symbol.toStringTag]() {
        return "Transaction";
    }
}
