export interface ICategory {
    name: string;
    amount: number;
    endOfLife: boolean;
    create_date: Date;
    id?: number | undefined;
    budgetId?: number | undefined;
    prevId?: number | undefined;
    nextId?: number | undefined;
    parentId?: number | undefined;
    childrenIds?: number | undefined;

    // end of life
    kill(): void;
    isDead(): boolean;
}
