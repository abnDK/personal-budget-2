import { Category, VersionCategory, FlatCategory } from "./category.js";
export class Budget {
    constructor(name, createDate, ownerName, id = undefined) {
        this.id = id;
        this.name = name;
        this.createDate = createDate;
        this.ownerName = ownerName;
    }
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
            const versionCategory = new VersionCategory(category.name, category.amount, category.endOfLife, category.createDate, category.id, category.budgetId
            // DO WE INPUT PARENT/CHILDREN HERE???????? WE CHECK FOR IT IN NEXT LINE!
            );
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
            parent.length === 1 ? parent[0].makeChild(versionCategory) : false;
            // if VersionCategory in visisted has an id matching the current category prev.id, make current versionCategory a new version of the versionCategory in visited
            const prev = visited.filter((prevVersionCat) => prevVersionCat.id === category.prevId);
            prev.length === 1 ? prev[0].addNewVersion(versionCategory) : false;
            visited.push(versionCategory); // might be better to shift() - DFS or BFS? - maybe not relevant
        }
        const versionBudget = new VersionBudget(this.id, this.name, this.createDate, "abnDK", root);
        versionBudget.categoriesAsList = visited;
        return versionBudget;
    }
}
export class VersionBudget {
    constructor(id, name, createDate, ownerName, root = undefined, categoriesAsList) {
        this.id = id;
        this.name = name;
        this.createDate = createDate;
        this.ownerName = ownerName;
        this.root = root;
        this.categoriesAsList = categoriesAsList;
    }
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
        var _a;
        const flatBudget = new FlatBudget(this.name, this.createDate, (_a = this === null || this === void 0 ? void 0 : this.ownerName) !== null && _a !== void 0 ? _a : "not implemented - go find a name");
        flatBudget.id = this === null || this === void 0 ? void 0 : this.id;
        if (!this.root) {
            throw new Error("Cannot flatten a budget with no category nodes!");
        }
        // for parsing versionized tree/budget
        const visited = [];
        let toVisit = filterDate
            ? this.root.filter((VerCat) => VerCat.createDate <= filterDate)
            : this.root;
        flatBudget.root = [];
        for (const category of toVisit) {
            const latestVersion = category.latestVersion(filterDate);
            if (latestVersion && !latestVersion.isDead()) {
                const latestVersionAsCategory = new FlatCategory(latestVersion.name, latestVersion.amount, latestVersion.endOfLife, latestVersion.createDate, latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.id, latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.budgetId);
                visited.push(latestVersionAsCategory);
                // check if category is the child of any of the other versionCategories. If not, category has no parents
                // and is thus at the root level.
                /* if (
                    !this?.categoriesAsList.some((verCat) =>
                        verCat.children?.some(
                            (childVerCat) =>
                                childVerCat.id === category.firstVersion().id
                        )
                    )
                ) {
                    flatBudget.root.push(latestVersionAsCategory);
                } */
                if (!category.firstVersion().parent) {
                    flatBudget.root.push(latestVersionAsCategory);
                }
                // scan all versions of category up until filterdate
                // for any children
                const children = filterDate
                    ? category
                        .firstVersion()
                        .getChildren()
                        .filter((child) => child.createDate <= filterDate)
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
                if (category === null || category === void 0 ? void 0 : category.flatParentId) {
                    const parent = visited.filter((cat) => cat.id === category.flatParentId)[0];
                    parent.makeChild(latestVersionAsCategory);
                }
            }
        }
        return flatBudget;
    }
}
export class FlatBudget {
    constructor(name, createDate, ownerName) {
        this.name = name;
        (this.createDate = createDate), (this.ownerName = ownerName);
    }
    getCategoryById(id) {
        throw new Error("not implemented..");
    }
}
