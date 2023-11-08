interface IBaseCategory {
    id: number | undefined;
    name: string;
    amount: number;
    endOfLife: boolean;
    budgetId: number | undefined;
    createDate: Date;

    // end of life
    kill(): void;
    isDead(): boolean;
}

export interface ICategory extends IBaseCategory {
    prevId: number | undefined;
    nextId: number | undefined;
    parentId: number | undefined;
    childrenIds: number[] | undefined;
}

export interface IVersionCategory extends IBaseCategory {
    parent: VersionCategory | undefined;
    children: VersionCategory[] | undefined;
    prev: VersionCategory | undefined;
    next: VersionCategory | undefined;

    addNewVersion<T extends VersionCategory>(newVersion: T): T; //
    latestVersion<T extends VersionCategory>(filterDate?: Date): T | undefined; // if no next, return this
    firstVersion<T extends VersionCategory>(): T; // if no first, return this

    getParent<T extends VersionCategory>(): T | undefined; // returns parent of the first version of a node (as this is where the parent will be referenced)
    makeChild<T extends VersionCategory>(child: T): T; // add child to this and sets .parent to child
    getChildren<T extends VersionCategory>(): T[]; // scans all versions and returns a list of all children. Returns empty list if no children.
}

export interface IFlatCategory extends IBaseCategory {
    parent?: FlatCategory | undefined;
    children?: FlatCategory[] | undefined;

    makeChild<T extends FlatCategory>(child: T): T; // add child to node and sets .parent of child to this node
}

export class Category implements ICategory {
    id: number | undefined;
    name: string;
    amount: number;
    endOfLife: boolean;
    createDate: Date;
    budgetId: number | undefined;
    prevId: number | undefined;
    nextId: number | undefined;
    parentId: number | undefined;
    childrenIds: number[] | undefined;

    constructor(
        name: string,
        amount: number,
        endOfLife: boolean,
        createDate: Date,
        id: number | undefined = undefined,
        budgetId: number | undefined = undefined,
        prevId: number | undefined = undefined,
        nextId: number | undefined = undefined,
        parentId: number | undefined = undefined,
        childrenIds: number[] | undefined = undefined
    ) {
        this.name = name;
        this.amount = amount;
        this.endOfLife = endOfLife;
        this.createDate = createDate;
        this.id = id;
        this.budgetId = budgetId;
        this.prevId = prevId;
        this.nextId = nextId;
        this.parentId = parentId;
        this.childrenIds = childrenIds;
    }

    kill(): void {
        throw new Error("not implemented");
    }

    isDead(): boolean {
        throw new Error("not implemented");
    }
}

export class VersionCategory implements IVersionCategory {
    id: number | undefined;
    name: string;
    amount: number;
    endOfLife: boolean;
    createDate: Date;
    budgetId: number | undefined;
    parent: VersionCategory | undefined;
    children: VersionCategory[] | undefined;
    prev: VersionCategory | undefined;
    next: VersionCategory | undefined;

    constructor(
        name: string,
        amount: number,
        endOfLife: boolean,
        createDate: Date,
        id: number | undefined = undefined,
        budgetId: number | undefined = undefined,
        parent: VersionCategory | undefined = undefined,
        children: VersionCategory[] | undefined = undefined,
        prev: VersionCategory | undefined = undefined,
        next: VersionCategory | undefined = undefined
    ) {
        this.name = name;
        this.amount = amount;
        this.endOfLife = endOfLife;
        this.createDate = createDate;
        this.id = id;
        this.budgetId = budgetId;
        this.parent = parent;
        this.children = children;
        this.prev = prev;
        this.next = next;
    }

    kill(): void {
        throw new Error("not implemented");
    }

    isDead(): boolean {
        throw new Error("not implemented");
    }

    addNewVersion<T extends VersionCategory>(newVersion: T): T {
        throw new Error("not implemented");
    }

    latestVersion<T extends VersionCategory>(
        filterDate?: Date | undefined
    ): T | undefined {
        throw new Error("not implemented");
    }
    firstVersion<T extends VersionCategory>(): T {
        throw new Error("not implemented");
    }
    getParent<T extends VersionCategory>(): T | undefined {
        throw new Error("not implemented");
    }
    makeChild<T extends VersionCategory>(child: T): T {
        throw new Error("not implemented");
    }
    getChildren<T extends VersionCategory>(): T[] {
        throw new Error("not implemented");
    }
}

export class FlatCategory implements IFlatCategory {
    id: number | undefined;
    name: string;
    amount: number;
    endOfLife: boolean;
    createDate: Date;
    budgetId: number | undefined;
    parent: FlatCategory | undefined;
    children: FlatCategory[] | undefined;

    constructor(
        name: string,
        amount: number,
        endOfLife: boolean,
        createDate: Date,
        id: number | undefined,
        budgetId: number | undefined
    ) {
        this.name = name;
        this.amount = amount;
        this.endOfLife = endOfLife;
        this.createDate = createDate;
        this.id = id;
        this.budgetId = budgetId;
    }

    makeChild<T extends FlatCategory>(child: T): T {
        throw new Error("Not implemneted");
    }

    kill(): void {
        throw new Error("not implemented");
    }

    isDead(): boolean {
        throw new Error("not implemented");
    }
}
