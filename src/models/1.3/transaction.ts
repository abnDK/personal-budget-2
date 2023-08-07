import { Category } from "./category";

export class Transaction {
    id: number;
    name: string;
    amount: number;
    date: Date;
    category_id: number | undefined;
    recipient: string | undefined;
    comment: string | undefined;

    constructor(id: number, name: string, amount: number, date: Date, category_id?: number | undefined, recipient?: string | undefined, comment?: string | undefined) {
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
        return 'Transaction';
    }
}