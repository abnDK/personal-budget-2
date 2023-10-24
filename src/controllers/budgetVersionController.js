/// TYPES ///
/// TESTING THE CODE ///
var CategoryFactory = function (id, name, amount, endOfLife, budgetId, date, prev, next, parent, children) {
    if (endOfLife === void 0) { endOfLife = false; }
    if (date === void 0) { date = new Date(); }
    var tCat = {
        id: id,
        name: name,
        amount: amount,
        endOfLife: endOfLife,
        budgetId: budgetId,
        date: date,
        addNewVersion: function (newCat) {
            newCat.budgetId = this.budgetId;
            if (newCat.date < this.date)
                throw new Error("Date of new version has to be equal or later than it's previous version");
            this.next = newCat;
            newCat.prev = this;
            return newCat;
        },
        latestVersion: function (filterDate) {
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
        nextVersion: function () {
            if (this.next)
                return this.next;
            return null;
        },
        prevVersion: function () {
            if (this.prev)
                return this.prev;
            return null;
        },
        getParent: function () {
            if (this.parent)
                return this.parent;
            return null;
        },
        makeChild: function (child) {
            child.parent = this;
            if (!this.children)
                this.children = [];
            this.children.push(child);
            return child;
        },
        kill: function () {
            this.endOfLife = true;
            return this.endOfLife;
        },
        isDead: function (filterDate) {
            // this was originally supposed to look for latest version
            // and return true if anywhere in the future, endOfLife
            // was set to true. But this does not work as budgets in
            // the past suddenly will miss nodes, if a later version
            // is killed. So isDead will have to work with some kind
            // of filterDate as we do with latestVersion().
            if (filterDate) {
                console.log("returning endOfLife with a filterDate: ", filterDate);
                var latestVersion_1 = this.latestVersion(filterDate);
                if (!latestVersion_1)
                    throw new Error("Neither this or any possible next versions has a date before filterdate!");
                console.log("... and the latest version was: ", latestVersion_1 === null || latestVersion_1 === void 0 ? void 0 : latestVersion_1.name, " with date: ", latestVersion_1 === null || latestVersion_1 === void 0 ? void 0 : latestVersion_1.date);
                return latestVersion_1.endOfLife;
            }
            var latestVersion = this.latestVersion();
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
var testCatA = CategoryFactory(1, "testCatA", 5, false, 1, new Date(2000, 5, 1));
var testCatAA1 = CategoryFactory(1, "testCatAA1", 5, false, 1, new Date(2010, 5, 1));
var testCatAA2 = CategoryFactory(1, "testCatAA2", 5, false, 1, new Date(2020, 5, 1));
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
var mockCategoryService = {
    budgets: {
        "1": [
            CategoryFactory(1, "testCatA", 5, false, 1, new Date(2000, 5, 1)),
            CategoryFactory(1, "testCatAA1", 5, false, 1, new Date(2010, 5, 1)),
            CategoryFactory(1, "testCatAA2", 5, false, 1, new Date(2020, 5, 1)),
        ],
    },
    getData: function (budgetId) {
        var _this = this;
        return new Promise(function (resolve, onReject) {
            resolve(_this.budgets[budgetId]);
        });
    },
};
mockCategoryService
    .getData("1")
    .then(function (data) { return console.log(data); })
    .catch(function (err) { return console.error(err); });
