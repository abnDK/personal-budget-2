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
    root: _Category[];

    getCategoryById(id: number): _Category;
}

interface _VersionBudget extends baseBudget {
    root: _VersionCategory[];

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

    // end of life
    kill(): void;
    isDead(): boolean;
}

interface dbCategory extends baseCategory {
    prevId?: number | null;
    nextId?: number | null;
    parentId?: number | null;
    childrenIds?: number[] | null;
}

// in memory category, flat
interface _Category extends baseCategory {
    parent?: _Category | undefined;
    children?: _Category[] | undefined;

    // getParent(): _Category | null; // returns parent
    makeChild(child: _Category): _Category; // add child to node and sets .parent of child to this node
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
    getChildren(): _VersionCategory[]; // scans all versions and returns a list of all children. Returns empty list if no children.

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
            let root = [] as _VersionCategory[];

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

            for (let category of toVisit) {
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
                parent.length === 1
                    ? parent[0].makeChild(versionCategory)
                    : false;

                // if VersionCategory in visisted has an id matching the current category prev.id, make current versionCategory a new version of the versionCategory in visited
                const prev = visited.filter(
                    (prevVersionCat) => prevVersionCat.id === category.prevId
                );

                prev.length === 1
                    ? prev[0].addNewVersion(versionCategory)
                    : false;

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

const createDbCategory = (category: {
    id?: number;
    name: string;
    amount: number;
    endOfLife: boolean;
    budgetId: number;
    date: Date;
    prevId?: number;
    nextId?: number;
    parentId?: number;
    childrenIds?: number[];
}): dbCategory => {
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

        kill() {
            this.endOfLife = true;
        },
        isDead() {
            return this.endOfLife;
        },
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

            const latestVersion = this.firstVersion().latestVersion(
                newVersion.date
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
                firstVersion.parent = null;
                newVersion.next = firstVersion;
            } else {
                newVersion.prev = latestVersion;

                newVersion.next = latestVersion.next
                    ? latestVersion.next
                    : undefined;

                latestVersion.next = newVersion;
            }

            return newVersion;
        },
        latestVersion(filterDate?: Date): _VersionCategory | undefined {
            /* filterDate
                ? console.log(
                      "latestVersion called with filterDate: ",
                      filterDate,
                      "on object: ",
                      this
                  )
                : console.log(
                      "latestVersion called without filterDate on object: ",
                      this
                  ); */
            if (filterDate && this.date > filterDate) return undefined;

            let returnValue = this.next
                ? filterDate
                    ? this.next.date <= filterDate
                        ? this.next.latestVersion(filterDate)
                        : this
                    : this.next.latestVersion()
                : this;
            // console.log("returning: ", returnValue);
            return returnValue;
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
        getChildren(): _VersionCategory[] {
            // only looks for children in this node and later versions. Does not look at previous versions children.

            let children = [] as _VersionCategory[];

            if (this.children) {
                children = [...this.children, ...children];
            }

            if (this.next) {
                children = [...this.next.getChildren(), ...children];
            }

            return children;
        },
        kill() {
            this.endOfLife = true;
        },
        isDead(): boolean {
            return this.endOfLife;
        },
    };
};

const createVersionBudget = (budget: {
    id: number;
    name: string;
    createDate: Date;
    root: _VersionCategory[];
}): _VersionBudget => {
    return {
        id: budget.id,
        name: budget.name,
        createDate: budget.createDate,
        root: budget.root,
        flattenBudget(filterDate?: Date): _Budget {
            /**
             * function takes the versionized tree and "flattens"
             * it to the latestversion of nodes up until a
             * potential filterDate. I.e. a given month/year filter.
             * This means parsing the versionized tree, getting
             * the latest version of a category. Verify that
             * it is not dead and check if it has any children.
             * This returns the tree rendered at any given time
             * without any knowledge of previous versions of the
             * category and if the child is specificly a child
             * of the version of the parent category or sometime
             * previously.
             */

            const flatBudget: _Budget = createBudget({
                id: this.id,
                name: this.name,
                createDate: this.createDate,
            });

            if (!this.root) {
                throw new Error(
                    "Cannot flatten a budget with no category nodes!"
                );
            }

            // for parsing versionized tree/budget
            const visited: _Category[] = [];
            let toVisit: _VersionCategory[] & { flatParentId?: number } =
                filterDate
                    ? this.root.filter((VerCat) => VerCat.date <= filterDate)
                    : this.root;

            flatBudget.root = [] as _Category[];

            for (const category of toVisit) {
                const latestVersion: _VersionCategory | undefined =
                    category.latestVersion(filterDate);

                if (latestVersion && !latestVersion.isDead()) {
                    const latestVersionAsCategory: _Category = createCategory({
                        id: latestVersion.id,
                        name: latestVersion.name,
                        amount: latestVersion.amount,
                        endOfLife: latestVersion.endOfLife,
                        budgetId: latestVersion.budgetId,
                        date: latestVersion.date,
                    });

                    visited.push(latestVersionAsCategory);

                    // check if category is at the root level and add to root is true
                    if (!category.firstVersion().parent) {
                        flatBudget.root.push(latestVersionAsCategory);
                    }

                    // scan all versions of category up until filterdate
                    // for any children
                    const children = filterDate
                        ? category
                              .firstVersion()
                              .getChildren()
                              .filter((child) => child.date <= filterDate)
                        : category.firstVersion().getChildren();

                    for (let child of children) {
                        let flatChild: typeof child & {
                            flatParentId?: number;
                        } = child;

                        // if child is found, set an id for it's parent
                        // after categories has been flattened (child can be linked
                        // to some version between v.1 and latestVersion). Then
                        // we can find the parent in the visited array
                        // in the next iterations and match child to parent
                        // in the flattened version.
                        flatChild.flatParentId = latestVersionAsCategory.id;
                        toVisit.push(flatChild);
                    }

                    // if category previously has been identified as a child
                    // of a already visited parent category,
                    // we related them here as parent/child
                    if (category.flatParentId) {
                        const parent = visited.filter(
                            (cat) => cat.id === category.flatParentId
                        )[0];

                        parent.makeChild(latestVersionAsCategory);
                    }
                }
            }

            return flatBudget;
        },
    };
};

const createCategory = (category: {
    id?: number;
    name: string;
    amount: number;
    endOfLife: boolean;
    budgetId: number;
    date: Date;
}): _Category => {
    return {
        id: category.id,
        name: category.name,
        amount: category.amount,
        endOfLife: category.endOfLife,
        budgetId: category.budgetId,
        date: category.date,
        makeChild(child: _Category): _Category {
            child.parent = this;
            if (!this.children) {
                this.children = [child];
            } else {
                this.children.push(child);
            }
        },

        kill() {
            this.endOfLife = true;
        },
        isDead() {
            return this.endOfLife;
        },
    };
};

const createBudget = (budget: {
    id: number;
    name: string;
    createDate: Date;
    root?: _Category[];
}): _Budget => {
    return {
        id: budget.id,
        name: budget.name,
        createDate: budget.createDate,
        root: [],
        getCategoryById(id: number) {
            throw new Error("Not implemented yet!");
        },
    };
};

/// TESTING THE CODE ///

const TEST_DATA_BUDGETS = {
    "1": createDbBudget(1, "budget1", new Date(2023, 1, 1)),
    "2": createDbBudget(2, "budget2", new Date(2023, 1, 1)),
    "3": createDbBudget(3, "budget3", new Date(2023, 1, 1)),
    "4": createDbBudget(4, "budget4", new Date(2023, 1, 1)),
    "5": createDbBudget(5, "budget5", new Date(2023, 1, 1)),
};

const TEST_DATA_CATEGORIES = [
    // BUDGET ID 1
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
    // BUDGET ID 4
    createDbCategory({
        id: 1,
        name: "A1",
        amount: 0,
        endOfLife: false,
        budgetId: 4,
        date: new Date(2023, 0, 15),
        nextId: 3,
    }),
    createDbCategory({
        id: 2,
        name: "A2",
        amount: 0,
        endOfLife: false,
        budgetId: 4,
        date: new Date(2023, 1, 15),
        prevId: 4,
    }),
    createDbCategory({
        id: 3,
        name: "A3",
        amount: 0,
        endOfLife: false,
        budgetId: 4,
        date: new Date(2023, 0, 31),
        nextId: 4,
        prevId: 1,
    }),
    createDbCategory({
        id: 4,
        name: "A4",
        amount: 0,
        endOfLife: false,
        budgetId: 4,
        date: new Date(2023, 0, 31),
        nextId: 2,
        prevId: 3,
    }),
    createDbCategory({
        id: 5,
        name: "a3B1",
        amount: 0,
        endOfLife: false,
        budgetId: 4,
        date: new Date(2023, 0, 31),
        nextId: 6,
        parentId: 3,
    }),
    createDbCategory({
        id: 6,
        name: "a3B2",
        amount: 0,
        endOfLife: false,
        budgetId: 4,
        date: new Date(2023, 2, 1),
        prevId: 5,
    }),
    // BUDGET ID 5
    createDbCategory({
        id: 1,
        name: "A1",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 0, 15),
        nextId: 4,
    }),
    createDbCategory({
        id: 2,
        name: "B1",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 0, 20),
        nextId: 6,
    }),
    createDbCategory({
        id: 3,
        name: "C1",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 1, 10),
        nextId: 5,
        parentId: 2,
    }),
    createDbCategory({
        id: 4,
        name: "A2",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 2, 10),
        prevId: 1,
        nextId: 7,
    }),

    createDbCategory({
        id: 5,
        name: "C2",
        amount: 0,
        endOfLife: true,
        budgetId: 5,
        date: new Date(2023, 2, 15),
        prevId: 3,
    }),
    createDbCategory({
        id: 6,
        name: "B2",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 3, 15),
        prevId: 2,
    }),
    createDbCategory({
        id: 7,
        name: "A4",
        amount: 0,
        endOfLife: true,
        budgetId: 5,
        date: new Date(2023, 4, 15),
        prevId: 4,
    }),
];

const TEST_DATA_DATES = {
    date1: new Date(2023, 0, 31),
    date2: new Date(2023, 1, 28),
    date3: new Date(2023, 2, 31),
    date4: new Date(2023, 3, 30),
    date5: new Date(2023, 4, 31),
};

const mockCategoryService: _CategoryService = {
    categories: TEST_DATA_CATEGORIES,

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
    budgets: TEST_DATA_BUDGETS,
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
/*
const root_3: _VersionCategory = mockBudgetService
    .getBudget(3)
    .parseVersionBudget().root;

const root_4: _VersionCategory = mockBudgetService
    .getBudget(4)
    .parseVersionBudget().root;

// TESTING CODE
const assertSomething = (a: any, b: any) => {
    a === b
        ? console.log(`SUCCES: ${a} is equal to ${b}: ${a === b}`)
        : console.log(`ERROR: ${a} is equal to ${b}: ${a === b}`);
};

// ASSERTING BUDGET 3 VERSIONING BUDGET
console.log("BUDGET 3");
// assertSomething(root_3.name, "root");
assertSomething(root_3[0].name, "A1");
assertSomething(root_3[0].next.name, "A3");
assertSomething(root_3[0].next.next.name, "A4");
assertSomething(root_3[0].next.next.next.name, "A2");

// ASSERTING BUDGET 4 VERSIONING BUDGET
console.log("BUDGET 4");
assertSomething(root_4[0].name, "A1");
assertSomething(root_4[0].next.children[0].name, "a3B1");
assertSomething(root_4[0].next.children[0].next.name, "a3B2");
assertSomething(root_4[0].next?.next?.next.name, "A2");
assertSomething(
    root_4[0].next?.next?.next?.prev?.prev.children[0].next.name,
    "a3B2"
);
assertSomething(root_4[0].next.children[0].next?.getParent().name, "A3");
assertSomething(root_4[0].next.children[0].next.isDead(), false);
assertSomething(root_3[0].next.next.next?.firstVersion().name, "A1");

// ASSERTING BUDGET 3 FLATTENED

// ASSERTING BUDGET 4 FLATTENED

// ASSERTING BUDGET 5 FLATTENED

console.log("BUDGET 5 - no date - versionBudget");

assertSomething(
    mockBudgetService.getBudget(5).parseVersionBudget().root[0].getChildren()
        .length,
    0
);
assertSomething(
    mockBudgetService.getBudget(5).parseVersionBudget().root[1].getChildren()
        .length,
    1
);

const budget_5_flat_date1: _Category[] = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date1"]); // this date somehow encounters an error - no data is found before this date?
// TRY CONSOLE LOGGING CATEGORIES AVAILABLE...
const budget_5_flat_date2: _Category[] = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date2"]);

const budget_5_flat_date3: _Category[] = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date3"]);

const budget_5_flat_date4: _Category[] = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date4"]);

const budget_5_flat_date5: _Category[] = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date5"]);

console.log("BUDGET 5, date 1 flat");

assertSomething(budget_5_flat_date1.root[0].name, "A1");
assertSomething(budget_5_flat_date1.root[0].parent, undefined);
assertSomething(budget_5_flat_date1.root[1].name, "B1");
console.log("BUDGET 5, date 2 flat - pre insert");

assertSomething(budget_5_flat_date2.root[0].name, "A1"); // pre A3 insert
assertSomething(budget_5_flat_date2.root[1].name, "B1"); // pre A3 insert
assertSomething(budget_5_flat_date2.root[1].children[0].name, "C1"); // pre A3 insert

assertSomething(budget_5_flat_date3.root[0].name, "A2");
assertSomething(budget_5_flat_date3.root[1].name, "B1");
console.log(budget_5_flat_date3.root);
// console.log(budget_5_flat_date3.root[1]?.children[0]);
assertSomething(budget_5_flat_date3.root[1].children ? true : false, false);

assertSomething(budget_5_flat_date4.root[0].name, "A2");
assertSomething(budget_5_flat_date4.root[1].name, "B2");

assertSomething(budget_5_flat_date5.root.length, 0);

// insert A3 here
// INSERT A3
mockBudgetService.getBudget(5).categories?.push(
    createDbCategory({
        id: 8,
        name: "A3",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 1, 28),
        prevId: 1,
        nextId: 4,
    })
);

// Update A1 and A2

const budget_5_categories_pre = mockBudgetService.getBudget(5).categories;
console.log(
    "Before insert of A3 in budget_5_categories: ",
    budget_5_categories_pre
);

budget_5_categories_pre
    ? (budget_5_categories_pre.filter((cat) => cat.name === "A1")[0].nextId = 8)
    : false;
budget_5_categories_pre
    ? (budget_5_categories_pre.filter((cat) => cat.name === "A2")[0].prevId = 8)
    : false;

const budget_5_categories_post = mockBudgetService.getBudget(5).categories;
TEST_DATA_CATEGORIES.push(
    createDbCategory({
        id: 8,
        name: "A3",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 1, 25),
        prevId: 1,
        nextId: 4,
    })
);
console.log(
    "After insert of A3 in budget_5_categories",
    mockBudgetService.getBudget(5).categories
);
const budget_5_flat_date2_post_a3_insert: _Category[] = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date2"]);

// test all 5 dates of budget 5 - update with A3 before testing for date 4. A2 should still show, but also test that A3 has been injected between A1 and A2.
// when A3 inserted: Test budget 5 for date 2. Shoyld be Budget > Root > A3, B1 as children. C1 as child of B1
console.log("BUDGET 5, date 2 flat - post insert");

assertSomething(budget_5_flat_date2_post_a3_insert.root[0].name, "A3"); // post A3 insert
assertSomething(budget_5_flat_date2_post_a3_insert.root[1].name, "B1"); // post A3 insert
assertSomething(
    budget_5_flat_date2_post_a3_insert.root[1].children[0].name,
    "C1"
); // post A3 insert

const budget_5_flat_date5_post_a3_insert: _Category[] = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date5"]);

assertSomething(budget_5_flat_date5_post_a3_insert.root[0].name, "B2");

const budget_5_flat_date4_post_a3_insert: _Category[] = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date4"]);

assertSomething(budget_5_flat_date4_post_a3_insert.root[0].name, "A2");
assertSomething(budget_5_flat_date4_post_a3_insert.root[1].name, "B2");
console.log(budget_5_flat_date4_post_a3_insert);

const budget_5_flat_no_filterDate_post_a3_insert: _Category[] =
    mockBudgetService.getBudget(5).parseVersionBudget().flattenBudget();

assertSomething(budget_5_flat_no_filterDate_post_a3_insert.root.length, 1);
assertSomething(budget_5_flat_no_filterDate_post_a3_insert.root[0].name, "B2");
*/
