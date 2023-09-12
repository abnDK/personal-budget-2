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
            console.log("x", levelOneTree);
            levelOneTree.forEach(row => {
                //this.toKeep.forEach(row => {
                if (frozen) {
                    row.dom_element_ref = this.budgetRowsDomElement.appendChild(row.renderFrozen());
                }
                else {
                    row.dom_element_ref = this.budgetRowsDomElement.appendChild(row.renderEditable());
                }
                console.log("&&&&&&&&&&&&&");
                console.log("&&&&&&&&&&&&&");
                console.log(this);
                console.log(row);
                console.log("&&&&&&&&&&&&&");
                console.log("&&&&&&&&&&&&&");
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
        this.root = BuildTree(rows, 'parent_id');
        this.sum = 0;
        this.budgetRowsDomElement = budgetRowsDomElement;
        this.editable = false; // make a setter, than when this is changed to true, will render all frozen rows as editable/input type
        // # 36: Is this need anymore or should it be run automatically somewhere else?
        //this.renderCategories();
    }
    get editable() {
        return this._editable;
    }
    set editable(state) {
        if (state) {
            this.renderEditableAll();
        }
        else {
            this.renderFrozenAll();
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
