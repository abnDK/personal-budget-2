/// TYPES ///

type _oldBudget = {
    id: number;
    name: string;
    root: _Category;
    // nodes
    getRoot(filterDate?: Date): _Category; // return _Category root only with children with date < filterDate

    // values
    calcSum(): number; // return sum of all children
};

interface baseBudget {
    id: number;
    name: string;
    createDate: Date;
}

interface dbBudget extends baseBudget {
    categories: dbCategory[];

    parseVersionBudget(): _VersionBudget | null; // if no categories, null is returned
}

interface _Budget extends baseBudget {
    root: _Category;
}

interface _VersionBudget extends baseBudget {
    root: _VersionCategory

    flattenBudget(filterDate: Date): _Budget | null; // returns flattened budget by filterDate. If no nodes besides root is available, null is returned

}

interface baseCategory {
    id: number;
    name: string;
    amount: number;
    endOfLife: boolean;
    budgetId: number;
    date: Date;
}

interface dbCategory extends baseCategory {
    prevId?: number;
    nextId?: number;
    parentId?: number;
    childrenIds?: number[];
}

interface _Category extends baseCategory {
    parent?: _Category;
    children?: _Category[];

    getParent(): _Category | null; // returns parent
    makeChild(child: _Category): _Category; // add child to node and sets .parent of child to this node

    // end of life
    kill(): void;
    isDead(): boolean;
}


interface _VersionCategory extends baseCategory {
    parent?: _VersionCategory;
    children?: _VersionCategory[];
    prev?: _VersionCategory;
    next?: _VersionCategory;    

    addNewVersion(newVersion: _Category): _Category;
    latestVersion(filterDate: Date): _Category | null;
    firstVersion(): _Category;

    getParent(): _VersionCategory | null; // returns parent of the first version of a node (is this is where the parent will be referenced)
    makeChild(child: _VersionCategory): _VersionCategory; // add child to latest version node and sets .parent of child to latest version node
    
    nextVersion(): _VersionCategory | null; // returns .next object if any    
    prevVersion(): _VersionCategory | null; // returns .prev object if any

    // end of life
    kill(): void;
    isDead(): boolean;
}






type _oldCategory = {
    id: number;
    name: string;
    amount: number;
    endOfLife: boolean;
    budgetId: number;
    date: Date;
    prev?: _Category;
    next?: _Category;
    parent?: _Category;
    children?: _Category[];

    // versions
    addNewVersion(newCat: _Category): _Category; // returns new _Category with this set as prev. This.next is set to returned _Category.
    latestVersion(filterDate?: Date): _Category | null; // get the latest version of this node. Returns this if no next version and no filterDate. If this.date > filterDate, return null.
    nextVersion(): _Category | null; // get the next version of this node, if any
    prevVersion(): _Category | null; // get the previous version of this node, if any

    // parent / child
    getParent(): _Category | null; // get the parent category of the first version of this node. If no, this is level 0 category
    makeChild(child: _Category): _Category; // return _Category with this as parent

    // end of life
    kill(): boolean; // sets endOfLife boolean to true on the latest version of this node
    isDead(filterDate?: Date | undefined): boolean; // checks if endOfLife boolean is true or false of the latest version of this node
};

interface dbCategory {
    // as _Category but with id's to emulate data coming from db
    // and can work as foundation for parser, that converts to _Category
    // and when tree is made with _Category and all versions,
    // this can be filtered and returned as a "flat" tree filtered by date.ˇ
}

type _CategoryParser = {
    parseData(data: Array<_Category>): _Budget; // returns budget with _Category as root of tree.
};

// simulate the service layer connection to db and getting data for us
type _CategoryService = {
    _budgets: { [id: string]: Array<_Category> };
    budgets(id: string): Array<_Category>;
    getData(budgetId: string): Promise<Array<dbCategory>>; // reads all rows from db and returns in array of objects
    parseVersionBudget(): // builds tree with all versions of categories etc. in type _Category
    parseFlatBudget(filterDate: Date): // filters version budget into budget with no history of category nodes. Only the latest version that is not filtered by filterDate
};

/// TESTING THE CODE ///

const _CategoryFactory = (
    id: number,
    name: string,
    amount: number,
    endOfLife: boolean = false,
    budgetId: number,
    date: Date = new Date(),
    prev?: _Category,
    next?: _Category,
    parent?: _Category,
    children?: _Category[]
): _Category => {
    let tCat: _Category = {
        id: id,
        name: name,
        amount: amount,
        endOfLife: endOfLife,
        budgetId: budgetId,
        date: date,
        addNewVersion(newCat: _Category): _Category {
            newCat.budgetId = this.budgetId;
            if (newCat.date < this.date)
                throw new Error(
                    "Date of new version has to be equal or later than it's previous version"
                );
            this.next = newCat;
            newCat.prev = this;
            return newCat;
        },
        latestVersion(filterDate?: Date | undefined): _Category | null {
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
        nextVersion(): _Category | null {
            if (this.next) return this.next;
            return null;
        },
        prevVersion(): _Category | null {
            if (this.prev) return this.prev;
            return null;
        },
        getParent(): _Category | null {
            if (this.parent) return this.parent;
            return null;
        },
        makeChild(child: _Category): _Category {
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
                // if no filterDate, latestVersion will always return a _Category (if no .next, it return itself)
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

let testCatA = _CategoryFactory(
    1,
    "testCatA",
    5,
    false,
    1,
    new Date(2000, 5, 1)
);
let testCatAA1 = _CategoryFactory(
    1,
    "testCatAA1",
    5,
    false,
    1,
    new Date(2010, 5, 1)
);
let testCatAA2 = _CategoryFactory(
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

const mockCategoryService: _CategoryService = {
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
     * the tree returned does not reveal previous versions, but only the
     * latest versions with a date <= filterdate.
     *
     * When this functions, we should write some tests on the methods of _CategoryService
     * 
     * 
     * STATES OF CATEGORY
     * 
     * read from db: dbCategory (id's of neighbours)
     * parsed into versioning budget: _CategoryVersion (object ref of neighbours, next/prev..)
     * flattened budget: _Category (object ref of neighbours, but no next/prev, only parent/child)
     *      - same format as UI uses today
     * 
     * 
     * 
     */

    _budgets: {
        "1": [
            // a parent and a child in 2 versions.
            _CategoryFactory(1, "testCatA", 5, false, 1, new Date(2000, 5, 1)),
            _CategoryFactory(2, "testCatAA1", 5, false, 1, new Date(2010, 5, 1)),
            _CategoryFactory(3, "testCatAA2", 5, false, 1, new Date(2020, 5, 1)),
        ],
        "2": [
            // a parent and a child in 2 versions. Latest child is dead.
            _CategoryFactory(1, "testCatA", 5, false, 1, new Date(2000, 5, 1)),
            _CategoryFactory(2, "testCatAA1", 5, false, 1, new Date(2010, 5, 1)),
            _CategoryFactory(3, "testCatAA2", 5, true, 1, new Date(2020, 5, 1)),
        ],
        "3": [
            // a grandparent, a parent in 2 versions (latest is dead) and a child.
            // verify that child is now a child of the grandparent
            _CategoryFactory(1, "testCatA", 5, false, 1, new Date(2000, 5, 1)),
            _CategoryFactory(2, "testCatAA1", 5, false, 1, new Date(2010, 5, 1)),
            _CategoryFactory(3, "testCatAA2", 5, true, 1, new Date(2020, 5, 1)),
            _CategoryFactory(4, "testCatAAA", 5, false, 1, new Date(2015, 5, 1)),
        ],
    },
    budgets(id: string) {
        return this._budgets[id];
    },

    getData(budgetId: string): Promise<Array<_Category>> {
        return new Promise((resolve, onReject) => {
            resolve(this.budgets[budgetId]);
        });
    },
};

mockCategoryService
    .getData("1")
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
