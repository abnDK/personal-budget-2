import { VerifyJsonWebKeyInput } from "crypto";

// BUDGET INTERFACES
interface baseBudget {
    id: number;
    name: string;
    createDate: Date;
}

interface dbBudget extends baseBudget {
    categories?: dbCategory[] | undefined;

    parseVersionBudget(): _VersionBudget; // if no categories, null is returned (not nescessary as BudgetService return null if no categories match  budgetId)
}

interface _Budget extends baseBudget {
    root: _Category;
}

interface _VersionBudget extends baseBudget {
    root: _VersionCategory;

    flattenBudget(filterDate?: Date): _Budget; // returns flattened budget by filterDate. If no nodes besides root is available, null is returned
}

// CATEGORY INTERFACES
interface baseCategory {
    id?: number;
    name: string;
    amount: number;
    endOfLife: boolean;
    budgetId: number;
    date: Date;
}

interface dbCategory extends baseCategory {
    prevId?: number | null;
    nextId?: number | null;
    parentId?: number | null;
    childrenIds?: number[] | null;
}

interface _Category extends baseCategory {
    parent?: _Category | null;
    children?: _Category[] | null;

    // getParent(): _Category | null; // returns parent
    // makeChild(child: _Category): _Category; // add child to node and sets .parent of child to this node

    // end of life
    // kill(): void;
    // isDead(): boolean;
}

interface _VersionCategory extends baseCategory {
    parent?: _VersionCategory | null;
    children?: _VersionCategory[] | null;
    prev?: _VersionCategory | null;
    next?: _VersionCategory | null;

    addNewVersion(newVersion: _VersionCategory): _VersionCategory; //
    latestVersion(filterDate?: Date): _VersionCategory | undefined; // if no next, return this
    firstVersion(): _VersionCategory; // if no first, return this

    getParent(): _VersionCategory | undefined; // returns parent of the first version of a node (as this is where the parent will be referenced)
    makeChild(child: _VersionCategory): _VersionCategory; // add child to this and sets .parent to child

    // end of life
    kill(): void;
    isDead(): boolean;
}

// SERVICE INTERFACES
interface _BudgetService {
    budgets: { [key: string]: dbBudget }; // mock a database
    categoryService: _CategoryService;

    // Public
    getBudget(id: number): dbBudget; // return dbBudget if match on id and if any categories

    // Private
    getCategories(budgetId?: number): dbCategory[] | undefined; // used internally by getBudget to get categories by budgetId
}

interface _CategoryService {
    categories: dbCategory[]; // mock a database
    getCategories(budgetId?: number): dbCategory[] | undefined; // returns dbCategories in array. if no categories error is thrown (i.e. if budgetId is provided and no returns in db)
}

// FACTORIES

const createDbBudget = (
    id: number,
    name: string,
    createDate: Date
): dbBudget => {
    return {
        id: id,
        name: name,
        createDate: createDate,
        categories: undefined,
        parseVersionBudget(): _VersionBudget {
            const root = createVersionCategory({
                name: "root",
                amount: 0,
                endOfLife: false,
                budgetId: this.id,
                date: this.createDate,
            });

            const baseCategories = this.categories?.filter(
                (cat) => !cat.parentId && !cat.prevId
            );
            if (!baseCategories) {
                throw new Error(
                    "Cannot parse versionBudget, when categories is empty!"
                );
            }

            const visited: _VersionCategory[] = [];
            const toVisit: dbCategory[] = [...baseCategories];
            console.log(baseCategories);
            console.log(this.categories);
            for (let category of toVisit) {
                console.log("CATEGORY OF TOVISIT: ", category);
                const versionCategory = createVersionCategory({
                    id: category?.id,
                    name: category.name,
                    amount: category.amount,
                    endOfLife: category.endOfLife,
                    budgetId: category.budgetId,
                    date: category.date,
                });

                // if no parents or prev nodes, add this to the root element
                if (!category.parentId && !category.prevId) {
                    root.makeChild(versionCategory);
                }

                if (category.childrenIds) {
                    // if any children ids, add the dbCategory with child id to toVisit
                    for (let id of category.childrenIds) {
                        const child = this.categories?.filter(
                            (cat) => cat.id === id
                        );

                        child?.length === 1 ? toVisit.push(child[0]) : false;

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
                parent.length === 1
                    ? parent[0].makeChild(versionCategory)
                    : false;

                // if VersionCategory in visisted has an id matching the current category prev.id, make current versionCategory a new version of the versionCategory in visited
                const prev = visited.filter(
                    (prevVersionCat) => prevVersionCat.id === category.prevId
                );
                console.log("CURRENT CAT: ", category);
                console.log("PREV ID: ", category.prevId);
                console.log("IF PREV DBCATEGORY: ", prev[0]);
                prev.length === 1
                    ? prev[0].addNewVersion(versionCategory)
                    : false;

                console.log("AFTER MAKE NEW VERSION: ", prev[0]);
                visited.push(versionCategory); // might be better to shift() - DFS or BFS? - maybe not relevant
            }

            return createVersionBudget({
                id: this.id,
                name: this.name,
                createDate: this.createDate,
                root: root,
            }); // create versionBudget and add root to it
        },
    };
};

const createDbCategory = (category: dbCategory): dbCategory => {
    return {
        id: category.id,
        name: category.name,
        amount: category.amount,
        endOfLife: category.endOfLife,
        budgetId: category.budgetId,
        date: category.date,
        prevId: category.prevId,
        nextId: category.nextId,
        parentId: category.parentId,
        childrenIds: category.childrenIds,
    };
};

const createVersionCategory = (category: {
    id?: number;
    name: string;
    amount: number;
    endOfLife: boolean;
    budgetId: number;
    date: Date;
}): _VersionCategory => {
    return {
        id: category.id,
        name: category.name,
        amount: category.amount,
        endOfLife: category.endOfLife,
        budgetId: category.budgetId,
        date: category.date,
        /* prev: category.prev,
        next: category.next,
        parent: category.parent,
        children: category.children, */
        addNewVersion(newVersion): _VersionCategory {
            // get latest version with some filterDate = newVersion.date
            // set as next of this.
            // if latest version has a next, set this as next on this (this will insert newVersion inbetween.)

            console.log("MAKING NEW VERSION!");
            console.log("PREV: ", this);
            console.log("NEXT: ", newVersion);

            const latestVersion = this.firstVersion().latestVersion(
                newVersion.date
            );
            console.log("LATEST VERSION: ", latestVersion);
            if (!latestVersion) {
                // if no version exists with date <= filterDate
                // we insert the new version as the first node
                // in the linked list, becoming the new first version.
                // The new version thus get the parent
                // of the first version and has it's
                // .next set to the previous first version

                const firstVersion = this.firstVersion();
                newVersion.parent = firstVersion.parent;
                firstVersion.parent = null;
                newVersion.next = firstVersion;
            } else {
                newVersion.prev = latestVersion;

                newVersion.next = latestVersion.next
                    ? latestVersion.next
                    : undefined;

                latestVersion.next = newVersion;
            }

            console.log("AFTER NEW VERSION! (before return)");
            console.log("PREV: ", this);
            console.log("NEXT: ", newVersion);

            return newVersion;
        },
        latestVersion(filterDate?: Date): _VersionCategory | undefined {
            if (filterDate && this.date > filterDate) return undefined;

            return this.next
                ? filterDate
                    ? this.next.date <= filterDate
                        ? this.next.latestVersion(filterDate)
                        : this
                    : this.next.latestVersion()
                : this;
        },
        firstVersion(): _VersionCategory {
            return this.prev ? this.prev.firstVersion() : this;
        },
        getParent(): _VersionCategory | undefined {
            // gets parent of the first version
            const firstVersion = this.firstVersion();

            return firstVersion.parent ? firstVersion.parent : undefined;
        },
        makeChild(child): _VersionCategory {
            child.parent = this;
            this.children
                ? this.children?.push(child)
                : (this.children = [child]);
            return child;
        },
        kill() {
            this.endOfLife = true;
        },
        isDead() {
            return this.endOfLife;
        },
    };
};

const createVersionBudget = (budget: {
    id: number;
    name: string;
    createDate: Date;
    root: _VersionCategory;
}): _VersionBudget => {
    return {
        id: budget.id,
        name: budget.name,
        createDate: budget.createDate,
        root: budget.root,
        flattenBudget(filterDate?: Date): _Budget {
            throw new Error("Not implemented");
        },
    };
};

/// TESTING THE CODE ///

const mockCategoryService: _CategoryService = {
    // PERIOD 1 = january, PERIOD 2 = february
    categories: [
        // BUDGET ID 1
        /* createDbCategory({
            id: 0,
            name: "root",
            amount: 0,
            endOfLife: false,
            budgetId: 1,
            date: new Date(2023, 0, 1),
            nextId: 1,
        }), */
        createDbCategory({
            id: 1,
            name: "A1",
            amount: 0,
            endOfLife: false,
            budgetId: 1,
            date: new Date(2023, 0, 15),
            nextId: 2,
        }),
        createDbCategory({
            id: 2,
            name: "A2",
            amount: 0,
            endOfLife: false,
            budgetId: 1,
            date: new Date(2023, 1, 15),
            prevId: 1,
        }),
        // BUDGET ID 2
        /* createDbCategory({
            id: 0,
            name: "root",
            amount: 0,
            endOfLife: false,
            budgetId: 2,
            date: new Date(2023, 0, 1),
            nextId: 1,
        }), */
        createDbCategory({
            id: 1,
            name: "A1",
            amount: 0,
            endOfLife: false,
            budgetId: 2,
            date: new Date(2023, 0, 15),
            nextId: 3,
        }),
        createDbCategory({
            id: 2,
            name: "A2",
            amount: 0,
            endOfLife: false,
            budgetId: 2,
            date: new Date(2023, 1, 15),
            prevId: 3,
        }),
        createDbCategory({
            id: 3,
            name: "A3",
            amount: 0,
            endOfLife: false,
            budgetId: 2,
            date: new Date(2023, 0, 31),
            nextId: 2,
            prevId: 1,
        }),
        // BUDGET ID 3
        /* createDbCategory({
            id: 0,
            name: "root",
            amount: 0,
            endOfLife: false,
            budgetId: 3,
            date: new Date(2023, 0, 1),
            nextId: 1,
        }), */
        createDbCategory({
            id: 1,
            name: "A1",
            amount: 0,
            endOfLife: false,
            budgetId: 3,
            date: new Date(2023, 0, 15),
            nextId: 3,
        }),
        createDbCategory({
            id: 2,
            name: "A2",
            amount: 0,
            endOfLife: false,
            budgetId: 3,
            date: new Date(2023, 1, 15),
            prevId: 4,
        }),
        createDbCategory({
            id: 3,
            name: "A3",
            amount: 0,
            endOfLife: false,
            budgetId: 3,
            date: new Date(2023, 0, 31),
            nextId: 4,
            prevId: 1,
        }),
        createDbCategory({
            id: 4,
            name: "A4",
            amount: 0,
            endOfLife: false,
            budgetId: 3,
            date: new Date(2023, 0, 31),
            nextId: 2,
            prevId: 3,
        }),
    ],

    getCategories(budgetId?: number): dbCategory[] | undefined {
        const categories = budgetId
            ? this.categories.filter((category) => {
                  return category.budgetId === budgetId;
              })
            : this.categories;

        if (!categories) {
            return undefined;
        }

        return categories;
    },
};

const mockBudgetService: _BudgetService = {
    // 1-6 tests when we create categories back in time after newer categories have been made
    // See "Versioning budget.drawio" - page "Creating new version back in time".
    budgets: {
        "1": createDbBudget(1, "budget1", new Date(2023, 1, 1)),
        "2": createDbBudget(2, "budget2", new Date(2023, 1, 1)),
        "3": createDbBudget(3, "budget3", new Date(2023, 1, 1)),
    },
    categoryService: mockCategoryService,

    getBudget(id: number): dbBudget {
        const budget: dbBudget = this.budgets[id.toString()]; // mock db call to table budget
        const categories = this.getCategories(id); // mock db call to table categories

        if (!categories)
            throw new Error("No categories match the provied budget id!");

        budget.categories = categories;

        return budget;
    },

    getCategories(budgetId?: number): dbCategory[] | undefined {
        return budgetId
            ? this.categoryService.getCategories(budgetId)
            : this.categoryService.getCategories();
    },
};

// console.log(mockBudgetService.getBudget(1));
// console.log(mockBudgetService.getBudget(2));
// console.log(mockBudgetService.getBudget(3));
const root = mockBudgetService.getBudget(3).parseVersionBudget().root;

const childrenOfRoot = root.children;
console.log("ROOT: ", root);
console.log("CHILDREN: ", childrenOfRoot);
console.log("VERSIONS OF CHILD 1: ", childrenOfRoot[0]);

console.log("A1 ", childrenOfRoot[0]);
console.log("A2 ", childrenOfRoot[0].next?.next?.next);
console.log("A3 ", childrenOfRoot[0].next);
console.log("A4 ", childrenOfRoot[0].next.next);
