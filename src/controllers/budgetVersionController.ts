/// TYPES ///

type tBudget = {
    id: number;
    name: string;
    root: tCategory;
    // nodes
    getRoot(filterDate?: Date): tCategory; // return tCategory root only with children with date < filterDate

    // values
    calcSum(): number; // return sum of all children
};

type tCategory = {
    id: number;
    name: string;
    amount: number;
    endOfLife: boolean;
    budgetId: number;
    date: Date;
    prev?: tCategory;
    next?: tCategory;
    parent?: tCategory;
    children?: tCategory[];

    // versions
    addNewVersion(newCat: tCategory): tCategory; // returns new tCategory with this set as prev. This.next is set to returned tCategory.
    latestVersion(filterDate?: Date): tCategory | null; // get the latest version of this node. Returns this if no next version and no filterDate. If this.date > filterDate, return null.
    nextVersion(): tCategory | null; // get the next version of this node, if any
    prevVersion(): tCategory | null; // get the previous version of this node, if any

    // parent / child
    getParent(): tCategory | null; // get the parent category of the first version of this node. If no, this is level 0 category
    makeChild(child: tCategory): tCategory; // return tCategory with this as parent

    // end of life
    kill(): boolean; // sets endOfLife boolean to true on the latest version of this node
    isDead(filterDate?: Date | undefined): boolean; // checks if endOfLife boolean is true or false of the latest version of this node
};

type tCategoryParser = {
    parseData(data: Array<tCategory>): tBudget; // returns budget with tCategory as root of tree.
};

// simulate the service layer connection to db and getting data for us
type tCategoryService = {
    _budgets: { [id: string]: Array<tCategory> };
    budgets(id: string): Array<tCategory>;
    getData(budgetId: string): Promise<Array<tCategory>>; // reads all rows from db and returns in array of objects
};

/// TESTING THE CODE ///

const CategoryFactory = (
    id: number,
    name: string,
    amount: number,
    endOfLife: boolean = false,
    budgetId: number,
    date: Date = new Date(),
    prev?: tCategory,
    next?: tCategory,
    parent?: tCategory,
    children?: tCategory[]
): tCategory => {
    let tCat: tCategory = {
        id: id,
        name: name,
        amount: amount,
        endOfLife: endOfLife,
        budgetId: budgetId,
        date: date,
        addNewVersion(newCat: tCategory): tCategory {
            newCat.budgetId = this.budgetId;
            if (newCat.date < this.date)
                throw new Error(
                    "Date of new version has to be equal or later than it's previous version"
                );
            this.next = newCat;
            newCat.prev = this;
            return newCat;
        },
        latestVersion(filterDate?: Date | undefined): tCategory | null {
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
        nextVersion(): tCategory | null {
            if (this.next) return this.next;
            return null;
        },
        prevVersion(): tCategory | null {
            if (this.prev) return this.prev;
            return null;
        },
        getParent(): tCategory | null {
            if (this.parent) return this.parent;
            return null;
        },
        makeChild(child: tCategory): tCategory {
            child.parent = this;
            if (!this.children) this.children = [];
            this.children.push(child);
            return child;
        },
        kill(): boolean {
            this.endOfLife = true;
            return this.endOfLife;
        },
        isDead(filterDate?: Date | undefined): boolean {
            // this was originally supposed to look for latest version
            // and return true if anywhere in the future, endOfLife
            // was set to true. But this does not work as budgets in
            // the past suddenly will miss nodes, if a later version
            // is killed. So isDead will have to work with some kind
            // of filterDate as we do with latestVersion().

            if (filterDate) {
                console.log(
                    "returning endOfLife with a filterDate: ",
                    filterDate
                );

                const latestVersion = this.latestVersion(filterDate);

                if (!latestVersion)
                    throw new Error(
                        "Neither this or any possible next versions has a date before filterdate!"
                    );

                console.log(
                    "... and the latest version was: ",
                    latestVersion?.name,
                    " with date: ",
                    latestVersion?.date
                );

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

let testCatA = CategoryFactory(
    1,
    "testCatA",
    5,
    false,
    1,
    new Date(2000, 5, 1)
);
let testCatAA1 = CategoryFactory(
    1,
    "testCatAA1",
    5,
    false,
    1,
    new Date(2010, 5, 1)
);
let testCatAA2 = CategoryFactory(
    1,
    "testCatAA2",
    5,
    false,
    1,
    new Date(2020, 5, 1)
);

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

const mockCategoryService: tCategoryService = {
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
    budgets(id: string) {
        return this._budgets[id];
    },

    getData(budgetId: string): Promise<Array<tCategory>> {
        return new Promise((resolve, onReject) => {
            resolve(this.budgets[budgetId]);
        });
    },
};

mockCategoryService
    .getData("1")
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
