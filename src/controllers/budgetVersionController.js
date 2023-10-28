"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
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
            console.log(baseCategories);
            console.log(this.categories);
            for (let category of toVisit) {
                console.log("CATEGORY OF TOVISIT: ", category);
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
                if (category.childrenIds) {
                    // if any children ids, add the dbCategory with child id to toVisit
                    for (let id of category.childrenIds) {
                        const child = (_b = this.categories) === null || _b === void 0 ? void 0 : _b.filter((cat) => cat.id === id);
                        (child === null || child === void 0 ? void 0 : child.length) === 1 ? toVisit.push(child[0]) : false;
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
            console.log("MAKING NEW VERSION!");
            console.log("PREV: ", this);
            console.log("NEXT: ", newVersion);
            const latestVersion = this.firstVersion().latestVersion(newVersion.date);
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
            }
            else {
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
            throw new Error("Not implemented");
        },
    };
};
/// TESTING THE CODE ///
const mockCategoryService = {
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
    budgets: {
        "1": createDbBudget(1, "budget1", new Date(2023, 1, 1)),
        "2": createDbBudget(2, "budget2", new Date(2023, 1, 1)),
        "3": createDbBudget(3, "budget3", new Date(2023, 1, 1)),
    },
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
// console.log(mockBudgetService.getBudget(1));
// console.log(mockBudgetService.getBudget(2));
// console.log(mockBudgetService.getBudget(3));
const root = mockBudgetService.getBudget(3).parseVersionBudget().root;
const childrenOfRoot = root.children;
console.log("ROOT: ", root);
console.log("CHILDREN: ", childrenOfRoot);
console.log("VERSIONS OF CHILD 1: ", childrenOfRoot[0]);
console.log('A1 ', childrenOfRoot[0]);
console.log('A2 ', (_b = (_a = childrenOfRoot[0].next) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.next);
console.log('A3 ', childrenOfRoot[0].next);
console.log('A4 ', childrenOfRoot[0].next.next);
