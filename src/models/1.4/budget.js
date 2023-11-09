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
        return createVersionBudget({
            id: this.id,
            name: this.name,
            createDate: this.createDate,
            root: root,
        });
    }
}
export class VersionBudget {
    constructor(id, name, createDate, ownerName) {
        this.root = undefined;
        this.id = id;
        this.name = name;
        this.createDate = createDate;
        this.ownerName = ownerName;
    }
    flattenBudget(filterDate) {
        throw new Error("not implemented");
    }
}
export class FlatBudget {
    constructor(name, createDate, ownerName) {
        throw new Error("not implemented..");
    }
    getCategoryById(id) {
        throw new Error("not implemented..");
    }
}
