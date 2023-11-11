// DONT USE - USE CLASSES INSTEAD!
//import { IBudget, IVersionBudget } from "../models/1.4/budget";
export const BudgetFactory = (id, name, createDate, ownerName) => {
    return {
        id: id,
        name: name,
        createDate: createDate,
        ownerName: ownerName,
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
const VersionBudgetFactory = (budget) => {
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
const FlatBudgetFactory = (budget) => {
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
