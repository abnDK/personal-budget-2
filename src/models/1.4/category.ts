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

    addNewVersion(newVersion: VersionCategory): VersionCategory; //
    latestVersion(filterDate?: Date): VersionCategory | undefined; // if no next, return this
    firstVersion(): VersionCategory; // if no first, return this

    getParent(): VersionCategory | undefined; // returns parent of the first version of a node (as this is where the parent will be referenced)
    makeChild(child: VersionCategory): VersionCategory; // add child to this and sets .parent to child
    getChildren(): VersionCategory[]; // scans all versions and returns a list of all children. Returns empty list if no children.
}

export interface IFlatCategory extends IBaseCategory {
    children?: FlatCategory[] | undefined;

    makeChild(child: FlatCategory): FlatCategory; // add child to node and sets .parent of child to this node
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
        this.endOfLife = true;
    }
    isDead(): boolean {
        return this.endOfLife;
    }

    addNewVersion(newVersion: VersionCategory): VersionCategory {
        // get latest version with some filterDate = newVersion.date
        // set as next of this.
        // if latest version has a next, set this as next on this (this will insert newVersion inbetween.)

        const latestVersion = this.firstVersion().latestVersion(
            newVersion.createDate
        );

        if (!latestVersion) {
            // if no version exists with date <= filterDate
            // we insert the new version as the first node
            // in the linked list, becoming the new first version.
            // The new version thus get the parent
            // of the first version and has it's
            // .next set to the previous first version

            const firstVersion = this.firstVersion();
            newVersion.parent = firstVersion.parent;
            firstVersion.parent = undefined;
            newVersion.next = firstVersion;
        } else {
            newVersion.prev = latestVersion;

            newVersion.next = latestVersion.next // refactor to: latestVersion?.next ?? undefined
                ? latestVersion.next
                : undefined;

            latestVersion.next = newVersion;
        }

        return newVersion;
    }

    latestVersion(filterDate?: Date | undefined): VersionCategory | undefined {
        if (filterDate && this.createDate > filterDate) return undefined;

        let returnValue = this.next // refactor: could we just return here?
            ? filterDate
                ? this.next.createDate <= filterDate
                    ? this.next.latestVersion(filterDate)
                    : this
                : this.next.latestVersion()
            : this;
        // console.log("returning: ", returnValue);
        return returnValue;
    }
    firstVersion(): VersionCategory {
        return this.prev ? this.prev.firstVersion() : this;
    }
    getParent(): VersionCategory | undefined {
        // gets parent of the first version
        const firstVersion = this.firstVersion();

        return firstVersion?.parent ?? undefined;
    }
    makeChild(child: VersionCategory): VersionCategory {
        child.parent = this; // to remove, as this creates circular ref when sent as json response
        this.children ? this.children?.push(child) : (this.children = [child]);
        return child;
    }
    getChildren(): VersionCategory[] {
        // only looks for children in this node and later versions. Does not look at previous versions children.

        let children = [] as VersionCategory[];

        if (this.children) {
            children = [...this.children, ...children];
        }

        if (this.next) {
            children = [...this.next.getChildren(), ...children];
        }

        return children;
    }
}

export class FlatCategory implements IFlatCategory {
    id: number | undefined;
    name: string;
    amount: number;
    endOfLife: boolean;
    createDate: Date;
    budgetId: number | undefined;
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

    makeChild(child: FlatCategory): FlatCategory {
        // we cannot add parent to the child, as this will create circular references when sending json response
        if (!this.children) {
            this.children = [child];
        } else {
            this.children.push(child);
        }

        return child;
    }

    kill(): void {
        this.endOfLife = true;
    }

    isDead(): boolean {
        return this.endOfLife;
    }
}
