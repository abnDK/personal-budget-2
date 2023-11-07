import { Category, VersionCategory, FlatCategory } from "./category";
import { createBudgetRow } from "../../static/logic/budgetDOMTools";

interface IBaseBudget {
    id?: number | undefined;
    name: string;
    createDate: Date;
    ownerName: string;
}

export interface IBudget extends IBaseBudget {
    categories?: Category[] | undefined;

    parseVersionBudget(): VersionBudget; // if no categories, null is returned (not nescessary as BudgetService return null if no categories match  budgetId)
}

export interface IVersionBudget extends IBaseBudget {
    root?: VersionCategory[] | undefined;

    flattenBudget(filterDate?: Date): FlatBudget; // returns flattened budget by filterDate. If no nodes besides root is available, null is returned
}

export interface IFlatBudget extends IBaseBudget {
    root: Category[] | undefined;

    getCategoryById(id: number): FlatCategory;
}

export class Budget implements IBudget {
    id: number | undefined;
    name: string;
    createDate: Date;
    ownerName: string;
    categories?: Category[] | undefined;

    constructor(
        name: string,
        createDate: Date,
        ownerName: string,
        id: number | undefined = undefined
    ) {
        this.id = id;
        this.name = name;
        this.createDate = createDate;
        this.ownerName = ownerName;
    }

    parseVersionBudget(): VersionBudget {
        throw new Error("not implemented");
    }
}

export class VersionBudget implements IVersionBudget {
    id: number | undefined;
    name: string;
    createDate: Date;
    ownerName: string;
    root: VersionCategory[] | undefined = undefined;

    constructor(
        id: number | undefined,
        name: string,
        createDate: Date,
        ownerName: string
    ) {
        this.id = id;
        this.name = name;
        this.createDate = createDate;
        this.ownerName = ownerName;
    }

    flattenBudget(filterDate?: Date | undefined): FlatBudget {
        throw new Error("not implemented");
    }
}


export class FlatBudget implements IFlatBudget {
    id: number | undefined;
    name: string;
    createDate: Date;
    ownerName: string;
    root: 


    constructor()
    throw new Error('not implemented..')
}