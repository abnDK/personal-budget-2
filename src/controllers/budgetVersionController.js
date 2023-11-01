var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
// FACTORIES
var createDbBudget = function (id, name, createDate) {
    return {
        id: id,
        name: name,
        createDate: createDate,
        categories: undefined,
        parseVersionBudget: function () {
            var _a, _b, _c;
            var root = [];
            var baseCategories = (_a = this.categories) === null || _a === void 0 ? void 0 : _a.filter(function (cat) { return !cat.parentId && !cat.prevId; });
            if (!baseCategories) {
                throw new Error("Cannot parse versionBudget, when categories is empty!");
            }
            var visited = [];
            var toVisit = __spreadArray([], baseCategories, true);
            var _loop_1 = function (category) {
                var versionCategory = createVersionCategory({
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
                var children = (_b = this_1.categories) === null || _b === void 0 ? void 0 : _b.filter(function (potentialChildCategory) {
                    return potentialChildCategory.parentId === category.id;
                });
                if (children && children.length > 0) {
                    // if any children ids, add the dbCategory with child id to toVisit
                    for (var _d = 0, children_1 = children; _d < children_1.length; _d++) {
                        var child = children_1[_d];
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
                    var next = (_c = this_1.categories) === null || _c === void 0 ? void 0 : _c.filter(function (cat) { return cat.id === category.nextId; });
                    (next === null || next === void 0 ? void 0 : next.length) === 1 ? toVisit.push(next[0]) : false;
                }
                // if VersionCategory in visited has an id matching the current dbCategory parentId, add current versionCategory to parent and vice versa
                var parent_1 = visited.filter(function (versionCat) { return versionCat.id === category.parentId; });
                parent_1.length === 1
                    ? parent_1[0].makeChild(versionCategory)
                    : false;
                // if VersionCategory in visisted has an id matching the current category prev.id, make current versionCategory a new version of the versionCategory in visited
                var prev = visited.filter(function (prevVersionCat) { return prevVersionCat.id === category.prevId; });
                prev.length === 1
                    ? prev[0].addNewVersion(versionCategory)
                    : false;
                visited.push(versionCategory); // might be better to shift() - DFS or BFS? - maybe not relevant
            };
            var this_1 = this;
            for (var _i = 0, toVisit_1 = toVisit; _i < toVisit_1.length; _i++) {
                var category = toVisit_1[_i];
                _loop_1(category);
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
var createDbCategory = function (category) {
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
        kill: function () {
            this.endOfLife = true;
        },
        isDead: function () {
            return this.endOfLife;
        },
    };
};
var createVersionCategory = function (category) {
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
        addNewVersion: function (newVersion) {
            // get latest version with some filterDate = newVersion.date
            // set as next of this.
            // if latest version has a next, set this as next on this (this will insert newVersion inbetween.)
            var latestVersion = this.firstVersion().latestVersion(newVersion.date);
            if (!latestVersion) {
                // if no version exists with date <= filterDate
                // we insert the new version as the first node
                // in the linked list, becoming the new first version.
                // The new version thus get the parent
                // of the first version and has it's
                // .next set to the previous first version
                var firstVersion = this.firstVersion();
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
        latestVersion: function (filterDate) {
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
            var returnValue = this.next
                ? filterDate
                    ? this.next.date <= filterDate
                        ? this.next.latestVersion(filterDate)
                        : this
                    : this.next.latestVersion()
                : this;
            // console.log("returning: ", returnValue);
            return returnValue;
        },
        firstVersion: function () {
            return this.prev ? this.prev.firstVersion() : this;
        },
        getParent: function () {
            // gets parent of the first version
            var firstVersion = this.firstVersion();
            return firstVersion.parent ? firstVersion.parent : undefined;
        },
        makeChild: function (child) {
            var _a;
            child.parent = this;
            this.children
                ? (_a = this.children) === null || _a === void 0 ? void 0 : _a.push(child)
                : (this.children = [child]);
            return child;
        },
        getChildren: function () {
            // only looks for children in this node and later versions. Does not look at previous versions children.
            var children = [];
            if (this.children) {
                children = __spreadArray(__spreadArray([], this.children, true), children, true);
            }
            if (this.next) {
                children = __spreadArray(__spreadArray([], this.next.getChildren(), true), children, true);
            }
            return children;
        },
        kill: function () {
            this.endOfLife = true;
        },
        isDead: function () {
            return this.endOfLife;
        },
    };
};
var createVersionBudget = function (budget) {
    return {
        id: budget.id,
        name: budget.name,
        createDate: budget.createDate,
        root: budget.root,
        flattenBudget: function (filterDate) {
            /**
             * tilføj alle non parent first versions fra root til tovisit
             * for hver cat i tovisit
             *      har du en senere version end filterdate? brug denne og placer i visited
             *      har du nogen børn inden filterdate? tilføj disse til tovisit
             *      hvis first version har et parent, placer denne på
             *
             *
             *
             */
            // console.log("flattenBudget called with filterDate: ", filterDate);
            var flatBudget = createBudget({
                id: this.id,
                name: this.name,
                createDate: this.createDate,
            });
            if (!this.root) {
                throw new Error("Cannot flatten a budget with no category nodes!");
            }
            var visited = [];
            var toVisit = filterDate
                ? this.root.filter(function (VerCat) { return VerCat.date <= filterDate; })
                : this.root;
            // console.log("Original toVisit: ", toVisit);
            // console.log("Original visited: ", visited);
            console.log("Name: ", this.name);
            console.log("Filtering date: ", filterDate);
            toVisit.map(function (cat) {
                var _a, _b;
                console.log("name: ", cat.name, "next.name: ", (_a = cat.next) === null || _a === void 0 ? void 0 : _a.name, "children: ", (_b = cat.children) === null || _b === void 0 ? void 0 : _b.map(function (cat) { return cat.name; }));
            });
            flatBudget.root = [];
            var _loop_2 = function (category) {
                // console.log("Acesssing toVisit 1 at the time");
                // console.log("Category: ", category.name);
                // console.log(
                //     "Category.date ",
                //     category.date,
                //     "Filtered out (",
                //     category.date > filterDate,
                //     ")"
                // );
                // console.log(
                //     "Category.next: ",
                //     category.next?.name,
                //     "Filtered out (",
                //     category.next?.date > filterDate,
                //     ")"
                // );
                // console.log(
                //     "Children: ",
                //     category
                //         .getChildren()
                //         .map((child) =>
                //             child.date > filterDate
                //                 ? `!-${child.name}`
                //                 : `${child.name}`
                //         )
                // );
                /**
                 * Gentænk denne:
                 * for hver node:
                 * - findes der en version inden filter date?
                 * - er den version død/levende?
                 * - hvilke børn har noden fra start til og med filterdate?
                 * - har den første version af noden en forælder?
                 *
                 * hvis noden findes og er levende, tilføj til visisted
                 * - hvis den ikke har en forælder (se first version), tilføj til root.
                 * - hvis den har en forælder, tilføj den til forælderen (find i visited)
                 *
                 * - hvis børn, så indstil børnenes parent id (eller tilføj et parentId) til id'et for den version af noden vi har her (latest version)
                 *
                 */
                var latestVersion = category.latestVersion(filterDate);
                console.log(category.name, " has latestVersion: ", latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.name);
                // latestVersion
                //     ? console.log("latestVersion.name", latestVersion.name)
                //     : false;
                // latestVersion
                //     ? console.log(
                //           "latestVersion.endOfLife ",
                //           latestVersion?.endOfLife
                //       )
                //     : false;
                // latestVersion
                //     ? console.log(
                //           "latestVersion.isDead() ",
                //           latestVersion?.isDead()
                //       )
                //     : false;
                if (latestVersion && !latestVersion.isDead()) {
                    var latestVersionAsCategory = createCategory({
                        id: latestVersion.id,
                        name: latestVersion.name,
                        amount: latestVersion.amount,
                        endOfLife: latestVersion.endOfLife,
                        budgetId: latestVersion.budgetId,
                        date: latestVersion.date,
                    });
                    visited.push(latestVersionAsCategory);
                    // console.log("parent: ", category.firstVersion().parent);
                    if (!category.firstVersion().parent) {
                        flatBudget.root.push(latestVersionAsCategory);
                    }
                    // console.log(latestVersionAsCategory.name);
                    // console.log(flatBudget.root);
                    var children = category
                        .firstVersion()
                        .getChildren()
                        .filter(function (child) { return child.date <= filterDate; });
                    // console.log("children: ", children);
                    for (var _a = 0, children_2 = children; _a < children_2.length; _a++) {
                        var child = children_2[_a];
                        var flatChild = child;
                        flatChild.flatParentId = latestVersionAsCategory.id;
                        toVisit.push(flatChild);
                    }
                    // console.log("toVisit after push(child) ", toVisit);
                    // console.log("visited: ", visited);
                    // console.log("category: ", category);
                    // console.log("latestVersion: ", latestVersion);
                    // console.log(
                    //     "latestVersionAsCategory",
                    //     latestVersionAsCategory
                    // );
                    if (category.flatParentId) {
                        // console.log(
                        //     "looking for parent for ",
                        //     latestVersionAsCategory.name
                        // );
                        // console.log("flatParentId: ", category.flatParentId);
                        var parent_2 = visited.filter(function (cat) { return cat.id === category.flatParentId; })[0];
                        // console.log("parent: ", parent);
                        // console.log("parent type: ", typeof parent);
                        parent_2.makeChild(latestVersionAsCategory);
                    }
                    /* category.flatParentId
                        ? visited
                              .filter(
                                  (_cat) => _cat.id === category.flatParentId
                              )[0]
                              .makeChild(latestVersionAsCategory)
                        : false; */
                }
            };
            for (var _i = 0, toVisit_2 = toVisit; _i < toVisit_2.length; _i++) {
                var category = toVisit_2[_i];
                _loop_2(category);
            }
            return flatBudget;
        },
    };
};
var createCategory = function (category) {
    return {
        id: category.id,
        name: category.name,
        amount: category.amount,
        endOfLife: category.endOfLife,
        budgetId: category.budgetId,
        date: category.date,
        makeChild: function (child) {
            child.parent = this;
            if (!this.children) {
                this.children = [child];
            }
            else {
                this.children.push(child);
            }
        },
        kill: function () {
            this.endOfLife = true;
        },
        isDead: function () {
            return this.endOfLife;
        },
    };
};
var createBudget = function (budget) {
    return {
        id: budget.id,
        name: budget.name,
        createDate: budget.createDate,
        root: [],
        getCategoryById: function (id) {
            throw new Error("Not implemented yet!");
        },
    };
};
/// TESTING THE CODE ///
var TEST_DATA_BUDGETS = {
    "1": createDbBudget(1, "budget1", new Date(2023, 1, 1)),
    "2": createDbBudget(2, "budget2", new Date(2023, 1, 1)),
    "3": createDbBudget(3, "budget3", new Date(2023, 1, 1)),
    "4": createDbBudget(4, "budget4", new Date(2023, 1, 1)),
    "5": createDbBudget(5, "budget5", new Date(2023, 1, 1)),
};
var TEST_DATA_CATEGORIES = [
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
var TEST_DATA_DATES = {
    date1: new Date(2023, 0, 31),
    date2: new Date(2023, 1, 28),
    date3: new Date(2023, 2, 31),
    date4: new Date(2023, 3, 30),
    date5: new Date(2023, 4, 31),
};
var mockCategoryService = {
    categories: TEST_DATA_CATEGORIES,
    getCategories: function (budgetId) {
        var categories = budgetId
            ? this.categories.filter(function (category) {
                return category.budgetId === budgetId;
            })
            : this.categories;
        if (!categories) {
            return undefined;
        }
        return categories;
    },
};
var mockBudgetService = {
    // 1-6 tests when we create categories back in time after newer categories have been made
    // See "Versioning budget.drawio" - page "Creating new version back in time".
    budgets: TEST_DATA_BUDGETS,
    categoryService: mockCategoryService,
    getBudget: function (id) {
        var budget = this.budgets[id.toString()]; // mock db call to table budget
        var categories = this.getCategories(id); // mock db call to table categories
        if (!categories)
            throw new Error("No categories match the provied budget id!");
        budget.categories = categories;
        return budget;
    },
    getCategories: function (budgetId) {
        return budgetId
            ? this.categoryService.getCategories(budgetId)
            : this.categoryService.getCategories();
    },
};
var root_3 = mockBudgetService
    .getBudget(3)
    .parseVersionBudget().root;
var root_4 = mockBudgetService
    .getBudget(4)
    .parseVersionBudget().root;
// TESTING CODE
var assertSomething = function (a, b) {
    a === b
        ? console.log("SUCCES: ".concat(a, " is equal to ").concat(b, ": ").concat(a === b))
        : console.log("ERROR: ".concat(a, " is equal to ").concat(b, ": ").concat(a === b));
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
assertSomething((_b = (_a = root_4[0].next) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.next.name, "A2");
assertSomething((_f = (_e = (_d = (_c = root_4[0].next) === null || _c === void 0 ? void 0 : _c.next) === null || _d === void 0 ? void 0 : _d.next) === null || _e === void 0 ? void 0 : _e.prev) === null || _f === void 0 ? void 0 : _f.prev.children[0].next.name, "a3B2");
assertSomething((_g = root_4[0].next.children[0].next) === null || _g === void 0 ? void 0 : _g.getParent().name, "A3");
assertSomething(root_4[0].next.children[0].next.isDead(), false);
assertSomething((_h = root_3[0].next.next.next) === null || _h === void 0 ? void 0 : _h.firstVersion().name, "A1");
// ASSERTING BUDGET 3 FLATTENED
// ASSERTING BUDGET 4 FLATTENED
// ASSERTING BUDGET 5 FLATTENED
console.log("BUDGET 5 - no date - versionBudget");
assertSomething(mockBudgetService.getBudget(5).parseVersionBudget().root[0].getChildren()
    .length, 0);
assertSomething(mockBudgetService.getBudget(5).parseVersionBudget().root[1].getChildren()
    .length, 1);
var budget_5_flat_date1 = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date1"]); // this date somehow encounters an error - no data is found before this date?
// TRY CONSOLE LOGGING CATEGORIES AVAILABLE...
var budget_5_flat_date2 = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date2"]);
var budget_5_flat_date3 = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date3"]);
var budget_5_flat_date4 = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date4"]);
var budget_5_flat_date5 = mockBudgetService
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
(_j = mockBudgetService.getBudget(5).categories) === null || _j === void 0 ? void 0 : _j.push(createDbCategory({
    id: 8,
    name: "A3",
    amount: 0,
    endOfLife: false,
    budgetId: 5,
    date: new Date(2023, 1, 28),
    prevId: 1,
    nextId: 4,
}));
// Update A1 and A2
var budget_5_categories_pre = mockBudgetService.getBudget(5).categories;
console.log("Before insert of A3 in budget_5_categories: ", budget_5_categories_pre);
budget_5_categories_pre
    ? (budget_5_categories_pre.filter(function (cat) { return cat.name === "A1"; })[0].nextId = 8)
    : false;
budget_5_categories_pre
    ? (budget_5_categories_pre.filter(function (cat) { return cat.name === "A2"; })[0].prevId = 8)
    : false;
var budget_5_categories_post = mockBudgetService.getBudget(5).categories;
TEST_DATA_CATEGORIES.push(createDbCategory({
    id: 8,
    name: "A3",
    amount: 0,
    endOfLife: false,
    budgetId: 5,
    date: new Date(2023, 1, 25),
    prevId: 1,
    nextId: 4,
}));
console.log("After insert of A3 in budget_5_categories", mockBudgetService.getBudget(5).categories);
var budget_5_flat_date2_post_a3_insert = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date2"]);
// test all 5 dates of budget 5 - update with A3 before testing for date 4. A2 should still show, but also test that A3 has been injected between A1 and A2.
// when A3 inserted: Test budget 5 for date 2. Shoyld be Budget > Root > A3, B1 as children. C1 as child of B1
console.log("BUDGET 5, date 2 flat - post insert");
assertSomething(budget_5_flat_date2_post_a3_insert.root[0].name, "A3"); // post A3 insert
assertSomething(budget_5_flat_date2_post_a3_insert.root[1].name, "B1"); // post A3 insert
assertSomething(budget_5_flat_date2_post_a3_insert.root[1].children[0].name, "C1"); // post A3 insert
var budget_5_flat_date5_post_a3_insert = mockBudgetService
    .getBudget(5)
    .parseVersionBudget()
    .flattenBudget(TEST_DATA_DATES["date5"]);
assertSomething(budget_5_flat_date5_post_a3_insert.root[0].name, "B2");
console.log(budget_5_flat_date5_post_a3_insert);
