export interface ITransaction {
    id?: number | undefined;
    name: string;
    amount: number;
    createDate: Date;
    categoryId: number | undefined;
    note?: string | undefined;
}

export class Transaction implements ITransaction {
    id: number | undefined;
    name: string;
    amount: number;
    createDate: Date;
    categoryId: number | undefined;
    note: string | undefined;

    constructor(
        name: string,
        amount: number,
        createDate: Date,
        id: number | undefined = undefined,
        categegoryId: number | undefined = undefined,
        note: string | undefined = undefined
    ) {
        (this.name = name),
            (this.amount = amount),
            (this.createDate = createDate),
            (this.id = id),
            (this.categoryId = categegoryId),
            (this.note = note);
    }
}
