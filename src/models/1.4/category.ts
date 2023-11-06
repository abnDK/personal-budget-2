interface IBaseCategory {
    id?: number | undefined;
    name: string;
    amount: number;
    endOfLife: boolean;
    budgetId?: number;
    create_date: Date;

    // end of life
    kill(): void;
    isDead(): boolean;
}

export interface ICategory extends IBaseCategory {
    prevId?: number | undefined;
    nextId?: number | undefined;
    parentId?: number | undefined;
    childrenIds?: number | undefined;
}

export interface IVersionCategory extends IBaseCategory {
    parent?: IVersionCategory | undefined;
    children?: IVersionCategory[] | undefined;
    prev?: IVersionCategory | undefined;
    next?: IVersionCategory | undefined;

    addNewVersion<T extends IVersionCategory>(newVersion: T): T; //
    latestVersion<T extends IVersionCategory>(filterDate?: Date): T | undefined; // if no next, return this
    firstVersion<T extends IVersionCategory>(): T; // if no first, return this

    getParent<T extends IVersionCategory>(): T | undefined; // returns parent of the first version of a node (as this is where the parent will be referenced)
    makeChild<T extends IVersionCategory>(child: T): T; // add child to this and sets .parent to child
    getChildren<T extends IVersionCategory>(): T[]; // scans all versions and returns a list of all children. Returns empty list if no children.
}

export interface IFlatCategory extends IBaseCategory {
    parent?: IFlatCategory | undefined;
    children?: IFlatCategory[] | undefined;

    makeChild<T extends IFlatCategory>(child: T): T; // add child to node and sets .parent of child to this node
}
