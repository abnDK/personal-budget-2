"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
// FACTORIES
const createDbBudget = (id, name, createDate) => {
    return {
        id: id,
        name: name,
        createDate: createDate,
        categories: undefined,
        parseVersionBudget() {
            var _a, _b, _c;
            const root = createVersionCategory({
                name: "root",
                amount: 0,
                endOfLife: false,
                budgetId: this.id,
                date: this.createDate,
            });
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
                    root.makeChild(versionCategory);
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
            if (filterDate && this.date > filterDate)
                return undefined;
            return this.next
                ? filterDate
                    ? this.next.date <= filterDate
                        ? this.next.latestVersion(filterDate)
                        : this
                    : this.next.latestVersion()
                : this;
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
        isDead(filterDate) {
            const latestVersion = filterDate
                ? this.latestVersion(filterDate)
                : this.latestVersion();
            if (!latestVersion) {
                throw new Error("Cannot verify endOfLife with filterDate before any of the category versions!");
            }
            return latestVersion.endOfLife;
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
            var _a;
            const flatBudget = createBudget({
                id: this.id,
                name: this.name,
                createDate: this.createDate,
            });
            if (!this.root.children) {
                throw new Error("Cannot flatten a budget with no category nodes!");
            }
            const visited = [];
            let toVisit = this.root.children;
            flatBudget.root = [];
            for (const category of toVisit) {
                if (!category.isDead(filterDate)) {
                    const latestVersion = category.latestVersion(filterDate);
                    if (!latestVersion)
                        throw new Error("No category with date before filterDate!");
                    const latestVersionAsCategory = createCategory({
                        id: latestVersion.id,
                        name: latestVersion.name,
                        amount: latestVersion.amount,
                        endOfLife: latestVersion.endOfLife,
                        budgetId: latestVersion.budgetId,
                        date: latestVersion.date,
                    });
                    visited.push(latestVersionAsCategory);
                    // first version of category has no parent it belongs to the root
                    if (!category.firstVersion().parent) {
                        flatBudget.root.push(latestVersionAsCategory);
                    }
                    // children / parent
                    const potentialChildren = category
                        .firstVersion()
                        .getChildren();
                    for (let child of potentialChildren) {
                        child.parent
                            ? (child.parent.id = latestVersion.id)
                            : false; // this sets the parent.id for future iterations to match the category node already parsed. This means, that all other fields on child.parent cannot be trusted.
                        toVisit.push(child);
                    }
                    if ((_a = category.parent) === null || _a === void 0 ? void 0 : _a.id) {
                        visited
                            .filter((cat) => { var _a; return cat.id === ((_a = category.parent) === null || _a === void 0 ? void 0 : _a.id); })[0]
                            .makeChild(latestVersionAsCategory);
                    }
                    visited.push(latestVersionAsCategory);
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
        kill() {
            this.endOfLife = true;
        },
        isDead() {
            return this.endOfLife;
        },
    };
};
const createBudget = (budget) => { };
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
        nextId: 2,
    }),
    createDbCategory({
        id: 2,
        name: "A2",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 0, 20),
        prevId: 1,
        nextId: 4,
    }),
    createDbCategory({
        id: 3,
        name: "A3",
        amount: 0,
        endOfLife: true,
        budgetId: 4,
        date: new Date(2023, 1, 20),
        prevId: 4,
    }),
    createDbCategory({
        id: 4,
        name: "A4",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 0, 31),
        nextId: 3,
        prevId: 2,
    }),
    createDbCategory({
        id: 5,
        name: "B1",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 0, 31),
        nextId: 6,
    }),
    createDbCategory({
        id: 6,
        name: "B2",
        amount: 0,
        endOfLife: false,
        budgetId: 5,
        date: new Date(2023, 2, 1),
        prevId: 5,
    }),
];
const mockCategoryService = {
    // PERIOD 1 = january, PERIOD 2 = february
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
const root_3 = mockBudgetService
    .getBudget(3)
    .parseVersionBudget().root;
const root_4 = mockBudgetService
    .getBudget(4)
    .parseVersionBudget().root;
// TESTING CODE
const assertSomething = (a, b) => {
    a === b
        ? console.log(`SUCCES: ${a} is equal to ${b}: ${a === b}`)
        : console.log(`ERROR: ${a} is equal to ${b}: ${a === b}`);
};
// ASSERTING BUDGET 3 VERSIONING BUDGET
assertSomething(root_3.name, "root");
assertSomething(root_3.children[0].name, "A1");
assertSomething(root_3.children[0].next.name, "A3");
assertSomething(root_3.children[0].next.next.name, "A4");
assertSomething(root_3.children[0].next.next.next.name, "A2");
// ASSERTING BUDGET 4 VERSIONING BUDGET
assertSomething(root_4.children[0].name, "A1");
console.log(root_4.children[0]);
assertSomething(root_4.children[0].next.children[0].name, "a3B1");
assertSomething(root_4.children[0].next.children[0].next.name, "a3B2");
assertSomething((_b = (_a = root_4.children[0].next) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.next.name, "A2");
assertSomething((_f = (_e = (_d = (_c = root_4.children[0].next) === null || _c === void 0 ? void 0 : _c.next) === null || _d === void 0 ? void 0 : _d.next) === null || _e === void 0 ? void 0 : _e.prev) === null || _f === void 0 ? void 0 : _f.prev.children[0].next.name, "a3B2");
assertSomething((_g = root_4.children[0].next.children[0].next) === null || _g === void 0 ? void 0 : _g.getParent().name, "A3");
assertSomething(root_4.children[0].next.children[0].next.isDead(), false);
assertSomething((_h = root_3.children[0].next.next.next) === null || _h === void 0 ? void 0 : _h.firstVersion().name, "A1");
// ASSERTING BUDGET 3 FLATTENED
// ASSERTING BUDGET 4 FLATTENED
// ASSERTING BUDGET 5 FLATTENED
const root_5_flat = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget().root;
assertSomething(root_5_flat.children[0].next.name, "B2");
