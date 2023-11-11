export class Transaction {
    constructor(name, amount, createDate, id = undefined, categegoryId = undefined, note = undefined) {
        (this.name = name),
            (this.amount = amount),
            (this.createDate = createDate),
            (this.id = id),
            (this.categoryId = categegoryId),
            (this.note = note);
    }
}
