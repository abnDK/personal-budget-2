"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CategoryRow {
    constructor(name, amount, id, parent_id, budget_id) {
        this.removeDomElement = () => {
            // why is this moved to the constructor?!
            this.dom_element_ref.remove(this.dom_element_ref);
        };
        this.name = name;
        this.amount = amount;
        this.id = id;
        this.parent_id = parent_id;
        this.budget_id = budget_id;
        this.level = NaN;
        this.children = [];
        this.to_be_deleted = false;
        this.dom_element_ref = undefined;
    }
    get element() {
        return this.renderFrozen();
    }
    get editableElement() {
        return this.renderEditable();
    }
    get dom_element_ref() {
        // return dom element
        return this._dom_element_ref;
    }
    set dom_element_ref(new_ref) {
        this._dom_element_ref = new_ref;
    }
    replaceDomElementRef(new_ref) {
        this.dom_element_ref.replaceWith(new_ref);
        this.dom_element_ref = new_ref;
    }
    renderFrozen() {
        this.frozen = true;
        return createBudgetRow(this);
    }
    renderEditable() {
        this.frozen = false;
        return createEditableBudgetRow(this);
    }
    readValuesFromDomElement() {
        if (this.dom_element_ref == undefined) {
            throw new Error('Object == undefined. Cannot extract values.');
        }
        if (this.frozen) {
            // extract values from frozen element
            const name = this.dom_element_ref.querySelector('.category-name').innerText;
            const amount = Number(this.dom_element_ref.querySelector('.category-amount').innerText);
            this.name = name;
            this.amount = amount;
        }
        else {
            // extract values from editable element
            const name = this.dom_element_ref.querySelector('.category-name').value;
            const amount = Number(this.dom_element_ref.querySelector('.category-amount').value);
            this.name = name;
            this.amount = amount;
        }
    }
    syncNameAmountParentIdWithDB() {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedCategoryRow = yield updateCategoryNameAmountRequest(this);
        });
    }
}
const LevelClassMap = new Map([
    ["1", 'category-parent'],
    ["2", 'category-child'],
    ["3", 'category-grandchild'],
    ['category-parent', '1'],
    ['category-child', '2'],
    ['category-grandchild', '3']
]);
class Budget {
    constructor(rows, budgetRowsDomElement) {
        this.rowsByLevel = (rootLevel = 0) => {
            return this.rows.filter(row => row.level >= rootLevel);
        };
        //// DOM INTERACTIONS \\\\
        this.initRenderBudget = () => {
            // inital rendering of budget when dom content has loaded.
            this.renderCategories(true);
        };
        this.fetchDataFromDOM = () => {
            console.log('called fetchDataFromDOM');
            for (let row of this.rows.filter(row => row.name != 'root')) {
                row.readValuesFromDomElement();
            }
        };
        this.renderEditableBudget = () => {
            this.clearBudget();
            this.renderCategories(false);
        };
        this.renderFrozenBudget = () => {
            this.clearBudget();
            this.renderCategories(true);
        };
        this.clearBudget = () => {
            for (const DOMChild of Array.from(this.budgetRowsDomElement.children)) {
                DOMChild.remove(DOMChild);
            }
        };
        //// BUDGET MANIPULATION \\\\
        this.deleteCategoryRows = () => __awaiter(this, void 0, void 0, function* () {
            console.log('waiting for some code to delete rows');
            for (const deletableRow of this.toDelete) {
                yield this.handleTransactionCategoryForeignKeyConstraint(deletableRow.id, deletableRow.parent_id);
                yield this.handleCategoryParentIdForeignKeyConstraint(deletableRow.id, deletableRow.parent_id);
                yield this.deleteCategoryFromDB(deletableRow.id);
            }
            // either remove deletable rows from budget object, or make sure they will be filtered out
        });
        this.updateCategoryRows = () => __awaiter(this, void 0, void 0, function* () {
            console.log('updateCategoryRows called');
            // get potentially updated parentIds
            const categoriesParentIds = yield this.query.getCategoriesParentIds(this.root.budget_id);
            console.log(`ids and parentIds: ${categoriesParentIds}`);
            console.log(categoriesParentIds);
            // write parentIds to CategoryRows
            for (const { id, parentId } of categoriesParentIds) {
                this.rowById(id).parent_id = parentId;
            }
            console.log(`this.toDelete: ${this.toDelete}`);
            // remove rows in this.toDelete
            /*
            for (const categoryRow of this.toDelete) {
    
                console.log('running through rows for deletion')
                console.log(`Next row: ${categoryRow}`)
                
                this.removeById(categoryRow.id)
    
                console.log(`Rows after deletion: ${this.toDelete}`)
    
            }
            */
            // alternative way of filtering out toDelete rows: run BuildTree only with .toKeep?
            this.root = BuildTree(this.toKeep);
            // rebuild tree with new parent_ids
            // // this is done everytime reading this.rows
            // calculate sums
            this.calculateBudgetSums();
            // update amount and value in db
            console.log('waiting for some code to update rows');
        });
        this.calculateBudgetSums = () => {
            console.log('waiting for some code to calculate budget sums');
            let sum = NaN;
            console.log(`The total sum is: ${sum}`);
        };
        this.rowById = (id) => {
            return this.rows.filter(row => row.id == id)[0];
        };
        this.removeById = (categoryId, root = this.root) => {
            // Finds category and removes.
            // If category has children, the children will be lifted 1 generation
            for (const child of root.children) {
                console.log(`Looking for ${categoryId} in row: ${child}`);
                if (child.id == categoryId) {
                    console.log(`Found row with to be deleted id: ${categoryId} = ${child}`);
                    root.children = [...root.children.filter(child => child.id != categoryId), ...child.children];
                    console.log(`Row have been deleted from root: ${this.root}`);
                    return;
                }
                this.removeById(categoryId, root);
            }
            console.log('No nodes deleted in this run...');
        };
        //// DB QUERYING \\\\
        this.handleTransactionCategoryForeignKeyConstraint = (oldCategoryId, newCategoryId) => __awaiter(this, void 0, void 0, function* () {
            console.log('handling transaction category foreign key constraint');
            const transactionsWithCategoryId = yield this.query.getTransactionsByCategoryId(oldCategoryId);
            for (const transaction of transactionsWithCategoryId) {
                yield this.query.updateCategoryIdOfTransaction(transaction.id, newCategoryId);
            }
        });
        this.handleCategoryParentIdForeignKeyConstraint = (categoryIdToBeDeleted, newParentId) => __awaiter(this, void 0, void 0, function* () {
            console.log('handling category parent_id foreign key constraint');
            const childrenOfDeletedCategory = yield this.query.getCategoryChildren(categoryIdToBeDeleted);
            for (const categoryChild of childrenOfDeletedCategory) {
                yield this.query.updateCategoryParentId(categoryChild.id, newParentId);
            }
        });
        this.deleteCategoryFromDB = (categoryId) => __awaiter(this, void 0, void 0, function* () {
            console.log('deleting category from db');
            yield this.query.deleteCategory(categoryId);
        });
        //// OLD - CONSIDER DELETE \\\\ 
        this.syncDB = () => {
            // write amounts to db
            // get parent_id's from db
            // maybe render elements?
            for (const row of this.toKeep) {
                row.syncNameAmountParentIdWithDB();
            }
        };
        this.addRow = (row) => {
            this.rows.push(row);
        };
        this.rowById = (id) => {
            return this.rows.filter(row => row.id == id)[0];
        };
        this.rowsByParentId = (parent_id) => {
            return this.rows.filter(row => row.parent_id == parent_id);
        };
        this.parseCategoryArray = (categories) => {
            const categoryRowsTree = BuildTree(categories, 'parent_id');
            const categoryRowsTreeAsArray = dfsTree(categoryRowsTree);
            this.rows = categoryRowsTreeAsArray.map(category => {
                let categoryRow = new CategoryRow(category['name'], category['amount'], category['id'], category['parent_id'], category['level'], category['budget_id'], category['children']);
                return categoryRow;
            });
            return this.rows;
        };
        // # 36: when this is run - filter out root.
        this.renderCategories = (frozen = true) => {
            /* Only for initial population of category rows to the budget */
            // Array.from(this.root.children).forEach(child=>child.remove(child)); // remove all children from budget-rows root node. Should not be necessary on initial population though
            // test "rootLevel" filter on rows:
            const levelOneTree = this.rowsByLevel(1);
            levelOneTree.forEach(row => {
                //this.toKeep.forEach(row => {
                if (frozen) {
                    row.dom_element_ref = this.budgetRowsDomElement.appendChild(row.renderFrozen());
                }
                else {
                    row.dom_element_ref = this.budgetRowsDomElement.appendChild(row.renderEditable());
                }
            });
        };
        this.removeDeletable = () => {
            console.log('called removeDeletable');
            for (const row of this.toDelete) {
                console.log("NOW DELETING: ", row);
                console.log('before delete: ', this.rows);
                // removing row in BUDGET object
                this.removeById(row.id);
                console.log('after delete: ', this.rows);
                // removing row in DOM
                row.dom_element_ref.remove(row.dom_element_ref);
            }
        };
        this.removeById = (id) => {
            // # 36: After change to .root tree as main datastructure,
            // this needs to be refactored in order to search for and 
            // delete a specific CategoryRow object.
            const removeCategoryRow = (root, id) => {
                for (const childIndex in root) {
                    removeCategoryRow(root[childIndex].children, id);
                    if (root[childIndex].id == id) {
                        return root.splice(Number(childIndex), 1);
                    }
                }
            };
            removeCategoryRow(this.root.children, id);
            //this.rows = this.rows.filter(row => row.id != id)
        };
        /* DOM ELEMENTS */
        this.clearDOM = () => {
            console.log('clearDOMthis: ', this);
            console.log('clearDOMrows: ', this.rows);
            // clears dom
            for (const row of this.rows.filter(row => row.name != 'root')) {
                console.log('clearDOMrow: ', row);
                row.removeDomElement();
            }
            // renderfrozen all + render editable all: clear dom, first.
        };
        this.renderFrozenAll = () => {
            // this.clearDOM(); THIS ONE NEEDS TO BE FIXED...
            this.renderCategories(true);
        };
        this.renderEditableAll = () => {
            // this.clearDOM();
            this.renderCategories(false);
        };
        this.syncFromDomElementToObject = () => {
            for (let row of this.rows.filter(row => row.name != 'root')) {
                row.readValuesFromDomElement();
            }
        };
        /* CALCULATE SUMS */ // #36: remake all of these, so they work with N levels of the tree. Total sum can be written to root-element
        this.calcSums = () => {
            this.calcBudgetSumsOfChildren();
            this.calcBudgetSumsOfParents();
            this.calcBudgetTotalSum();
        };
        this.calcBudgetSumsOfChildrenMap = () => {
            const childrenSumsMap = new Map();
            for (const grandChild of this.grandChildren) {
                if (childrenSumsMap.has(grandChild.parent_id)) {
                    let prevVal = childrenSumsMap.get(grandChild.parent_id);
                    childrenSumsMap.set(grandChild.parent_id, prevVal += grandChild.amount);
                }
                else {
                    childrenSumsMap.set(grandChild.parent_id, grandChild.amount);
                }
            }
            return childrenSumsMap;
        };
        this.calcBudgetSumsOfChildren = () => {
            const childrenSumMap = this.calcBudgetSumsOfChildrenMap();
            for (const [id, amount] of childrenSumMap) {
                this.rowById(id).amount = amount;
            }
        };
        this.calcBudgetSumsOfParentsMap = () => {
            const parentsSumsMap = new Map();
            for (const child of this.children) {
                if (parentsSumsMap.has(child.parent_id)) {
                    let prevVal = parentsSumsMap.get(child.parent_id);
                    parentsSumsMap.set(child.parent_id, prevVal += child.amount);
                }
                else {
                    parentsSumsMap.set(child.parent_id, child.amount);
                }
            }
            return parentsSumsMap;
        };
        this.calcBudgetSumsOfParents = () => {
            const parentsSumMap = this.calcBudgetSumsOfParentsMap();
            for (const [id, amount] of parentsSumMap) {
                try {
                    this.rowById(id).amount = amount;
                }
                catch (err) {
                    console.log("rows: ", this.rows);
                    console.log('root: ', this.root);
                    throw `could not recognize id: ${id}`;
                }
            }
        };
        this.calcBudgetTotalSum = () => {
            let budgetTotalSum = 0;
            for (let parent of this.parents) {
                budgetTotalSum += parent.amount;
            }
            this.sum = budgetTotalSum;
        };
        // # 36: just set rows directly..
        this.root = BuildTree(rows);
        this.budgetRowsDomElement = budgetRowsDomElement;
        this.query = new BudgetQueryService();
        this.initRenderBudget();
        // # 36: Is this need anymore or should it be run automatically somewhere else?
        //this.renderCategories();
    }
    ///// GETTERS AND SETTERS \\\\\
    get editable() {
        return this._editable;
    }
    set editable(state) {
        if (state) {
            this.renderEditableBudget();
        }
        else {
            /*
            Freezing the budget in DOM consists of multiple steps
            1. fetching data from dom to budget object
            2. deleting any rows marked for deletion
            3. updating existing rows with values (while calculating sums as well)
            4. writing everything to the dom after db and budget object has been updated
            */
            // FETCHING DATA FROM DOM
            this.fetchDataFromDOM();
            console.log('After fetching data from DOM: ', this.rows);
            console.log('Status: SUCCESS');
            // DELETING ROWS
            this.deleteCategoryRows()
                .then(() => {
                console.log('After deleting categories in object and db: ', this.rows);
                console.log('Status: AWAITING');
                // UPDATING EXISTING ROWS
                return this.updateCategoryRows();
            })
                .then(() => {
                console.log('After updating categories with name, amount and parent_ids: ', this.rows);
                console.log('Status: AWAITING');
                // RENDER TO DOM
                this.renderFrozenBudget();
            })
                .finally(() => {
                console.log('After rendering budget to the DOM: ', this.rows);
                console.log('Status: SUCCESS');
            });
        }
        this._editable = state;
    }
    // # 36: Reads this.root which is a tree. Should return the parsed array DFS. 
    get rows() {
        return dfsTree(this.root);
    }
    set root(newRoot) {
        this._root = newRoot;
    }
    get root() {
        return this._root;
    }
    get toKeep() {
        return this.rows.filter(row => !row.to_be_deleted);
    }
    get toDelete() {
        return this.rows.filter(row => row.to_be_deleted);
    }
    get loners() {
        // return elements closest to the root and not having any children
        const parentIdsOfChildren = Array.from(new Set(this.children.map(child => child.parent_id)));
        return this.parents.filter(row => !parentIdsOfChildren.includes(row.id));
    }
    get parents() {
        return this.rows.filter(row => !row.to_be_deleted && row.level === Number(LevelClassMap.get('category-parent')));
    }
    get children() {
        return this.rows.filter(row => !row.to_be_deleted && row.level === Number(LevelClassMap.get('category-child')));
    }
    get grandChildren() {
        return this.rows.filter(row => !row.to_be_deleted && row.level === Number(LevelClassMap.get('category-grandchild')));
    }
}
