export interface ITransaction {
    id?: number | number;
    name: string;
    amount: number;
    create_date: Date;
    category_id: number | undefined;
    note?: string | undefined;
}
