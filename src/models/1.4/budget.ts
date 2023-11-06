import { ICategory, IVersionCategory } from "./category";

interface IBaseBudget {
    id?: number | number;
    name: string;
    createDate: Date;
}

export interface IBudget extends IBaseBudget {
    categories?: ICategory[] | undefined;

    parseVersionBudget(): IVersionBudget; // if no categories, null is returned (not nescessary as BudgetService return null if no categories match  budgetId)
}

export interface IVersionBudget extends IBaseBudget {
    root: IVersionCategory[];

    flattenBudget(filterDate?: Date): IFlatBudget; // returns flattened budget by filterDate. If no nodes besides root is available, null is returned
}

export interface IFlatBudget extends IBaseBudget {
    root: ICategory[];

    getCategoryById(id: number): ICategory;
}
