import { Category, VersionCategory, FlatCategory } from "./category.js";

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
    root: FlatCategory[] | undefined;

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
        let root = [] as VersionCategory[];

        const baseCategories = this.categories?.filter(
            (cat) => !cat.parentId && !cat.prevId
        );
        if (!baseCategories) {
            throw new Error(
                "Cannot parse versionBudget, when categories is empty!"
            );
        }

        const visited: VersionCategory[] = [];
        const toVisit: Category[] = [...baseCategories];

        for (let category of toVisit) {
            const versionCategory = new VersionCategory(
                category.name,
                category.amount,
                category.endOfLife,
                category.createDate,
                category.id,
                category.budgetId
                // DO WE INPUT PARENT/CHILDREN HERE???????? WE CHECK FOR IT IN NEXT LINE!
            );

            // if no parents or prev nodes, add this to the root element
            if (!category.parentId && !category.prevId) {
                root.push(versionCategory);
            }

            const children = this.categories?.filter(
                (potentialChildCategory) =>
                    potentialChildCategory.parentId === category.id
            );
            if (children && children.length > 0) {
                // if any children ids, add the dbCategory with child id to toVisit
                for (let child of children) {
                    toVisit.push(child);

                    // dont think it's nescessary to create child as version cat when we
                    // also do it later when looking for a visisted note with
                    // parent id matching the id of the current category being matched
                    // and here add it as a VersionCategory.

                    /* const childVersionCategory = createVersionCategory({
                                id: child?.id,
                                name: child.name,
                                amount: child.amount,
                                endOfLife: child.endOfLife,
                                budgetId: child.budgetId,
                                date: child.date,
                            });

                            versionCategory.makeChild(childVersionCategory); */
                }
            }

            if (category.nextId) {
                // if nextId matches dbCategory in this.categoris, add to toVisit
                const next = this.categories?.filter(
                    (cat) => cat.id === category.nextId
                );
                next?.length === 1 ? toVisit.push(next[0]) : false;
            }

            // if VersionCategory in visited has an id matching the current dbCategory parentId, add current versionCategory to parent and vice versa
            const parent = visited.filter(
                (versionCat) => versionCat.id === category.parentId
            );
            parent.length === 1 ? parent[0].makeChild(versionCategory) : false;

            // if VersionCategory in visisted has an id matching the current category prev.id, make current versionCategory a new version of the versionCategory in visited
            const prev = visited.filter(
                (prevVersionCat) => prevVersionCat.id === category.prevId
            );

            prev.length === 1 ? prev[0].addNewVersion(versionCategory) : false;

            visited.push(versionCategory); // might be better to shift() - DFS or BFS? - maybe not relevant
        }

        return new VersionBudget(
            this.id,
            this.name,
            this.createDate,
            "abnDK",
            root
        );
    }
}

export class VersionBudget implements IVersionBudget {
    id: number | undefined;
    name: string;
    createDate: Date;
    ownerName: string;
    root: VersionCategory[] | undefined;

    constructor(
        id: number | undefined,
        name: string,
        createDate: Date,
        ownerName: string,
        root: VersionCategory[] | undefined = undefined
    ) {
        this.id = id;
        this.name = name;
        this.createDate = createDate;
        this.ownerName = ownerName;
        this.root = root;
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
    root: FlatCategory[] | undefined;

    constructor(name: string, createDate: Date, ownerName: string) {
        throw new Error("not implemented..");
    }

    getCategoryById(id: number): FlatCategory {
        throw new Error("not implemented..");
    }
}
