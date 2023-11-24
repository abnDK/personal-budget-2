"use strict";
// FACTORIES
const createDbBudget = (id, name, createDate) => {
    return {
        id: id,
        name: name,
        createDate: createDate,
        categories: undefined,
        parseVersionBudget() {
            var _a, _b, _c;
            let root = [];
            const baseCategories = (_a = this.categories) === null || _a === void 0 ? void 0 : _a.filter((cat) => !cat.parentId && !cat.prevId);
            if (!baseCategories) {
                throw new Error("Cannot parse versionBudget, when categories is empty!");
            }
            const visited = [];
            const toVisit = [...baseCategories];
            for (let category of toVisit) {
                const versionCategory = createVersionCategory({
                    id: category === null || category === void 0 ? void 0 : category.id,
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
                const children = (_b = this.categories) === null || _b === void 0 ? void 0 : _b.filter((potentialChildCategory) => potentialChildCategory.parentId === category.id);
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
                    const next = (_c = this.categories) === null || _c === void 0 ? void 0 : _c.filter((cat) => cat.id === category.nextId);
                    (next === null || next === void 0 ? void 0 : next.length) === 1 ? toVisit.push(next[0]) : false;
                }
                // if VersionCategory in visited has an id matching the current dbCategory parentId, add current versionCategory to parent and vice versa
                const parent = visited.filter((versionCat) => versionCat.id === category.parentId);
                parent.length === 1
                    ? parent[0].makeChild(versionCategory)
                    : false;
                // if VersionCategory in visisted has an id matching the current category prev.id, make current versionCategory a new version of the versionCategory in visited
                const prev = visited.filter((prevVersionCat) => prevVersionCat.id === category.prevId);
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
const createDbCategory = (category) => {
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
const createVersionCategory = (category) => {
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
        addNewVersion(newVersion) {
            // get latest version with some filterDate = newVersion.date
            // set as next of this.
            // if latest version has a next, set this as next on this (this will insert newVersion inbetween.)
            const latestVersion = this.firstVersion().latestVersion(newVersion.date);
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
            }
            else {
                newVersion.prev = latestVersion;
                newVersion.next = latestVersion.next
                    ? latestVersion.next
                    : undefined;
                latestVersion.next = newVersion;
            }
            return newVersion;
        },
        latestVersion(filterDate) {
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
            if (filterDate && this.date > filterDate)
                return undefined;
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
        firstVersion() {
            return this.prev ? this.prev.firstVersion() : this;
        },
        getParent() {
            // gets parent of the first version
            const firstVersion = this.firstVersion();
            return firstVersion.parent ? firstVersion.parent : undefined;
        },
        makeChild(child) {
            var _a;
            child.parent = this;
            this.children
                ? (_a = this.children) === null || _a === void 0 ? void 0 : _a.push(child)
                : (this.children = [child]);
            return child;
        },
        getChildren() {
            // only looks for children in this node and later versions. Does not look at previous versions children.
            let children = [];
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
        isDead() {
            return this.endOfLife;
        },
    };
};
const createVersionBudget = (budget) => {
    return {
        id: budget.id,
        name: budget.name,
        createDate: budget.createDate,
        root: budget.root,
        flattenBudget(filterDate) {
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
            const flatBudget = createBudget({
                id: this.id,
                name: this.name,
                createDate: this.createDate,
            });
            if (!this.root) {
                throw new Error("Cannot flatten a budget with no category nodes!");
            }
            // for parsing versionized tree/budget
            const visited = [];
            let toVisit = filterDate
                ? this.root.filter((VerCat) => VerCat.date <= filterDate)
                : this.root;
            flatBudget.root = [];
            for (const category of toVisit) {
                const latestVersion = category.latestVersion(filterDate);
                if (latestVersion && !latestVersion.isDead()) {
                    const latestVersionAsCategory = createCategory({
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
                        let flatChild = child;
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
                        const parent = visited.filter((cat) => cat.id === category.flatParentId)[0];
                        parent.makeChild(latestVersionAsCategory);
                    }
                }
            }
            return flatBudget;
        },
    };
};
const createCategory = (category) => {
    return {
        id: category.id,
        name: category.name,
        amount: category.amount,
        endOfLife: category.endOfLife,
        budgetId: category.budgetId,
        date: category.date,
        makeChild(child) {
            child.parent = this;
            if (!this.children) {
                this.children = [child];
            }
            else {
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
const createBudget = (budget) => {
    return {
        id: budget.id,
        name: budget.name,
        createDate: budget.createDate,
        root: [],
        getCategoryById(id) {
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
const mockCategoryService = {
    categories: TEST_DATA_CATEGORIES,
    getCategories(budgetId) {
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
const mockBudgetService = {
    // 1-6 tests when we create categories back in time after newer categories have been made
    // See "Versioning budget.drawio" - page "Creating new version back in time".
    budgets: TEST_DATA_BUDGETS,
    categoryService: mockCategoryService,
    getBudget(id) {
        const budget = this.budgets[id.toString()]; // mock db call to table budget
        const categories = this.getCategories(id); // mock db call to table categories
        if (!categories)
            throw new Error("No categories match the provied budget id!");
        budget.categories = categories;
        return budget;
    },
    getCategories(budgetId) {
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
