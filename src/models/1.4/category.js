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
        this.endOfLife = true;
    }
    isDead() {
        return this.endOfLife;
    }
    addNewVersion(newVersion) {
        // get latest version with some filterDate = newVersion.date
        // set as next of this.
        // if latest version has a next, set this as next on this (this will insert newVersion inbetween.)
        const latestVersion = this.firstVersion().latestVersion(newVersion.createDate);
        if (!latestVersion) {
            // if no version exists with date <= filterDate
            // we insert the new version as the first node
            // in the linked list, becoming the new first version.
            // The new version thus get the parent
            // of the first version and has it's
            // .next set to the previous first version
            const firstVersion = this.firstVersion();
            newVersion.parent = firstVersion.parent;
            firstVersion.parent = undefined;
            newVersion.next = firstVersion;
        }
        else {
            newVersion.prev = latestVersion;
            newVersion.next = latestVersion.next // refactor to: latestVersion?.next ?? undefined
                ? latestVersion.next
                : undefined;
            latestVersion.next = newVersion;
        }
        return newVersion;
    }
    latestVersion(filterDate) {
        if (filterDate && this.createDate > filterDate)
            return undefined;
        let returnValue = this.next // refactor: could we just return here?
            ? filterDate
                ? this.next.createDate <= filterDate
                    ? this.next.latestVersion(filterDate)
                    : this
                : this.next.latestVersion()
            : this;
        // console.log("returning: ", returnValue);
        return returnValue;
    }
    firstVersion() {
        return this.prev ? this.prev.firstVersion() : this;
    }
    getParent() {
        var _a;
        // gets parent of the first version
        const firstVersion = this.firstVersion();
        return (_a = firstVersion === null || firstVersion === void 0 ? void 0 : firstVersion.parent) !== null && _a !== void 0 ? _a : undefined;
    }
    makeChild(child) {
        var _a;
        // child.parent = this; // to remove, as this creates circular ref when sent as json response
        this.children ? (_a = this.children) === null || _a === void 0 ? void 0 : _a.push(child) : (this.children = [child]);
        return child;
    }
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
        //child.parent = this; // to remove, as this creates circular ref when sent as json response
        if (!this.children) {
            this.children = [child];
        }
        else {
            this.children.push(child);
        }
    }
    kill() {
        this.endOfLife = true;
    }
    isDead() {
        return this.endOfLife;
    }
}
