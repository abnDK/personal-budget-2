"use strict";
/// TYPES ///
/// TESTING THE CODE ///
const CategoryFactory = (id, name, amount, endOfLife = false, budgetId, date = new Date(), prev, next, parent, children) => {
    let tCat = {
        id: id,
        name: name,
        amount: amount,
        endOfLife: endOfLife,
        budgetId: budgetId,
        date: date,
        addNewVersion(newCat) {
            newCat.budgetId = this.budgetId;
            if (newCat.date < this.date)
                throw new Error("Date of new version has to be equal or later than it's previous version");
            this.next = newCat;
            newCat.prev = this;
            return newCat;
        },
        latestVersion(filterDate) {
            console.log("entered latestVersion..");
            if (filterDate) {
                console.log("with filterDate: ", filterDate);
                console.log("and this.date: ", this.date);
                if (this.date > filterDate) {
                    return null;
                }
                if (this.next && this.next.date <= filterDate) {
                    return this.next.latestVersion(filterDate);
                }
                return this;
            }
            if (this.next) {
                return this.next.latestVersion();
            }
            return this;
        },
        nextVersion() {
            if (this.next)
                return this.next;
            return null;
        },
        prevVersion() {
            if (this.prev)
                return this.prev;
            return null;
        },
        getParent() {
            if (this.parent)
                return this.parent;
            return null;
        },
        makeChild(child) {
            child.parent = this;
            if (!this.children)
                this.children = [];
            this.children.push(child);
            return child;
        },
        kill() {
            this.endOfLife = true;
            return this.endOfLife;
        },
        isDead(filterDate) {
            // this was originally supposed to look for latest version
            // and return true if anywhere in the future, endOfLife
            // was set to true. But this does not work as budgets in
            // the past suddenly will miss nodes, if a later version
            // is killed. So isDead will have to work with some kind
            // of filterDate as we do with latestVersion().
            if (filterDate) {
                console.log("returning endOfLife with a filterDate: ", filterDate);
                const latestVersion = this.latestVersion(filterDate);
                if (!latestVersion)
                    throw new Error("Neither this or any possible next versions has a date before filterdate!");
                console.log("... and the latest version was: ", latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.name, " with date: ", latestVersion === null || latestVersion === void 0 ? void 0 : latestVersion.date);
                return latestVersion.endOfLife;
            }
            const latestVersion = this.latestVersion();
            if (latestVersion) {
                console.log("returning endOfLife without a filterDate");
                // if no filterDate, latestVersion will always return a tCategory (if no .next, it return itself)
                return latestVersion.endOfLife;
            }
            return this.endOfLife; // will never be reached, but in order to satisfy return type
        },
    };
    prev ? (tCat.prev = prev) : false;
    next ? (tCat.next = next) : false;
    parent ? (tCat.parent = parent) : false;
    children ? (tCat.children = children) : false;
    return tCat;
};
let testCatA = CategoryFactory(1, "testCatA", 5, false, 1, new Date(2000, 5, 1));
let testCatAA1 = CategoryFactory(1, "testCatAA1", 5, false, 1, new Date(2010, 5, 1));
let testCatAA2 = CategoryFactory(1, "testCatAA2", 5, false, 1, new Date(2020, 5, 1));
testCatA.makeChild(testCatAA1);
// console.log(testCatAA1);
testCatAA1.addNewVersion(testCatAA2);
// console.log(testCatAA1);
// console.log(testCatAA2);
console.log(testCatAA1.latestVersion());
console.log(testCatAA1.latestVersion(new Date(2015, 1, 1)));
console.log(testCatAA1.isDead());
testCatAA2.kill();
console.log(testCatAA1.isDead());
console.log(testCatAA1.isDead(new Date(2015, 1, 1)));
// console.log(testCatA);
// console.log(testCatAA1);
const mockCategoryService = {
    /**
     * TODO:
     *
     * categories below has not been linked properly.
     * before returning them from the service,
     * we need to properly link them with .makeChild and .addNewVersion
     *
     * if CategoryService is to return the budgets with proper relationships
     * it might as well just return the budget with a root and
     * the tree structure.
     *
     * When this functions, we should write some tests on the methods of tCategoryService
     */
    _budgets: {
        "1": [
            // a parent and a child in 2 versions.
            CategoryFactory(1, "testCatA", 5, false, 1, new Date(2000, 5, 1)),
            CategoryFactory(2, "testCatAA1", 5, false, 1, new Date(2010, 5, 1)),
            CategoryFactory(3, "testCatAA2", 5, false, 1, new Date(2020, 5, 1)),
        ],
        "2": [
            // a parent and a child in 2 versions. Latest child is dead.
            CategoryFactory(1, "testCatA", 5, false, 1, new Date(2000, 5, 1)),
            CategoryFactory(2, "testCatAA1", 5, false, 1, new Date(2010, 5, 1)),
            CategoryFactory(3, "testCatAA2", 5, true, 1, new Date(2020, 5, 1)),
        ],
        "3": [
            // a grandparent, a parent in 2 versions (latest is dead) and a child.
            // verify that child is now a child of the grandparent
            CategoryFactory(1, "testCatA", 5, false, 1, new Date(2000, 5, 1)),
            CategoryFactory(2, "testCatAA1", 5, false, 1, new Date(2010, 5, 1)),
            CategoryFactory(3, "testCatAA2", 5, true, 1, new Date(2020, 5, 1)),
            CategoryFactory(4, "testCatAAA", 5, false, 1, new Date(2015, 5, 1)),
        ],
    },
    budgets(id) {
        return this._budgets[id];
    },
    getData(budgetId) {
        return new Promise((resolve, onReject) => {
            resolve(this.budgets[budgetId]);
        });
    },
};
mockCategoryService
    .getData("1")
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
