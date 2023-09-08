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
    constructor(name, amount, id, parent_id, level, budget_id, children) {
        this.removeDomElement = () => {
            this.dom_element_ref.remove(this.dom_element_ref);
        };
        this.name = name;
        this.amount = amount;
        this.id = id;
        this.parent_id = parent_id;
        this.level = level;
        this.budget_id = budget_id;
        this.children = children;
        this.to_be_deleted = false;
        this._dom_element_ref = undefined;
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
    constructor(rows, budgetRowsRoot) {
        this.syncDB = () => {
            // write amounts to db
            // get parent_id's from db
            // maybe render elements?
            console.log('rows before syncing: ', this.rows);
            console.log('to keep before syncing: ', this.toKeep);
            for (const row of this.rows) {
                console.log("syncing this row now: ", row);
                row.syncNameAmountParentIdWithDB();
            }
        };
        this.addRow = (row) => {
            this.rows.push(row);
        };
        this.rowById = (id) => {
            return this.rows.filter(row => row.id == id)[0];
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
        this.populateRoot = (frozen = true) => {
            /* Only for initial population of category rows to the budget */
            // Array.from(this.root.children).forEach(child=>child.remove(child)); // remove all children from budget-rows root node. Should not be necessary on initial population though
            this.toKeep.forEach(row => {
                if (frozen) {
                    this.root.appendChild(row.renderFrozen());
                }
                else {
                    this.root.appendChild(row.renderEditable());
                }
                row.dom_element_ref = this.root.lastElementChild; // bind dom element ref to row object
            });
        };
        this.removeDeletable = () => {
            console.log('called removeDeletable');
            for (const row of this.toDelete) {
                console.log("NOW DELETING: ", row);
                console.log('before delete: ', this.rows);
                // removing row in BUDGET object
                const indexOfRow = this.rows.indexOf(row);
                this.rows.splice(indexOfRow, 1);
                console.log('after delete: ', this.rows);
                // removing row in DOM
                row.dom_element_ref.remove(row.dom_element_ref);
            }
        };
        /* DOM ELEMENTS */
        this.clearDOM = () => {
            // clears dom
            for (const row of this.rows) {
                row.removeDomElement();
            }
            // renderfrozen all + render editable all: clear dom, first.
        };
        this.renderFrozenAll = () => {
            this.clearDOM();
            this.populateRoot(true);
        };
        this.renderEditableAll = () => {
            this.clearDOM();
            this.populateRoot(false);
        };
        this.syncFromDomElementToObject = () => {
            for (let row of this.rows) {
                row.readValuesFromDomElement();
            }
        };
        /* CALCULATE SUMS */
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
                this.rowById(id).amount = amount;
            }
        };
        this.calcBudgetTotalSum = () => {
            let budgetTotalSum = 0;
            for (let parent of this.parents) {
                budgetTotalSum += parent.amount;
            }
            this.sum = budgetTotalSum;
        };
        this.rows = this.parseCategoryArray(rows);
        this.sum = 0;
        this._editable = false; // make a setter, than when this is changed to true, will render all frozen rows as editable/input type
        this.root = budgetRowsRoot;
        this.populateRoot();
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
    set rows(rows) {
        this._rows = rows;
    }
    get rows() {
        return this._rows.filter(row => row.name != 'root');
    }
    get toKeep() {
        return this.rows.filter(row => !row.to_be_deleted);
    }
    get toDelete() {
        return this.rows.filter(row => row.to_be_deleted);
    }
    get roots() {
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
