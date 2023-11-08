export class Category {
    constructor(name, amount, endOfLife, createDate, id = undefined, budgetId = undefined, prevId = undefined, nextId = undefined, parentId = undefined, childrenIds = undefined) {
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
    kill() {
        throw new Error("not implemented");
    }
    isDead() {
        throw new Error("not implemented");
    }
}
export class VersionCategory {
    constructor(name, amount, endOfLife, createDate, id = undefined, budgetId = undefined, parent = undefined, children = undefined, prev = undefined, next = undefined) {
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
    kill() {
        throw new Error("not implemented");
    }
    isDead() {
        throw new Error("not implemented");
    }
    addNewVersion(newVersion) {
        throw new Error("not implemented");
    }
    latestVersion(filterDate) {
        throw new Error("not implemented");
    }
    firstVersion() {
        throw new Error("not implemented");
    }
    getParent() {
        throw new Error("not implemented");
    }
    makeChild(child) {
        throw new Error("not implemented");
    }
    getChildren() {
        throw new Error("not implemented");
    }
}
export class FlatCategory {
    constructor(name, amount, endOfLife, createDate, id, budgetId) {
        this.name = name;
        this.amount = amount;
        this.endOfLife = endOfLife;
        this.createDate = createDate;
        this.id = id;
        this.budgetId = budgetId;
    }
    makeChild(child) {
        throw new Error("Not implemneted");
    }
    kill() {
        throw new Error("not implemented");
    }
    isDead() {
        throw new Error("not implemented");
    }
}
