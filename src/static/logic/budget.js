"use strict";
/**
 * split files:
 *      budgetDOMTools.js
 *      budgetQueries.js
 *
 *
 *
 *
 *
 * FLOWS:
 *
 * when click 'edit':
 * - name and amount field become input fields
 * - 'delete row' checkbox is shown
 * - 'add row' button is shown
 *
 *
 * when click 'save':
 * - rows marked for deletion are deleted in db (HTTP DELETE REQUEST)
 * - if all successful, rows are removed and sum can be calculated of the remaining rows.
 *   - what if not succesful: An error message is shown and all rows remain shown. User can then try again?
 * - when sum is calculated, rows are "frozen" with new values (checkbox are removed, class 'editable' removed)
 *
 * when 'delete row' is checked:
 * - row is greyed out and cannot be edited anymore
 *
 *
 * EVENTS:
 *
 * Edit budget rows
 *  [x] Toggle edit/save for all rows
 *  [x] set row for deletion (mark it and when saved, it disappears. When marked it is greyed out.)
 *  [ ] Delete multiple rows and change category_id of related transactions
 *
 * Save budget rows
 *  [x] calculate sum
 *  [x] parent sum = children sum = grandchildren sum
 *  [x] save to db
 *
 * Populate budget
 *  [x] get data from db and create budget rows and add to .budget-rows element
 *
 * Add budget row
 *  [ ] Add new row on all 3 levels (parent, child, grandchild - and not grand-grandchild)
 *  [ ] Save row to db on save. (might already happen if we just add row like when we populate budget)
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// POPULATE BUDGET ROWS
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    let budgetRows = document.querySelector('.budget-rows');
    if (budgetRows == null) {
        throw new Error('Could not find budget rows element');
    }
    let categories = yield getCategories();
    const budget_id = parseInt(window.location.href.split("/").at(-1));
    categories = categories === null || categories === void 0 ? void 0 : categories.filter(cat => cat.budget_id === budget_id);
    if (categories !== undefined) {
        const categoryRows = categories.map(cat => {
            let category = {
                name: cat['name'],
                amount: cat['amount'],
                id: cat['id'],
                parent_id: cat['parent_id'],
                budget_id: cat['budget_id'],
            };
            return category;
        });
        const categoryRowsTree = BuildTree(categoryRows, 'parent_id');
        const categoryRowsTreeAsArray = dfsTree(categoryRowsTree);
        console.log(categoryRowsTree);
        console.log(categoryRowsTreeAsArray);
        for (let category of categoryRowsTreeAsArray) {
            budgetRows.appendChild(createBudgetRow(category));
        }
    }
    /*
    // fetch data
    getCategoriesAsTree().then((categories) => {
        
        
        // filter categories by budget_id
        // by grapping last :id part of url (after "/" in .../budgets/show/:id)
        const budget_id = parseInt(window.location.href.split("/").at(-1));
        categories = categories.filter((cat) => cat.budget_id == budget_id)

        const categoryRows = categories.map(category => {
            let categoryRow: CategoryRow = {
                name: category['name'],
                amount: category['amount'],
                id: category['id'],
                parent_id: category['parent_id'],
                budget_id: category['budget_id'],

            }
            return categoryRow
        })
        
        console.log(categoryRows)
        console.log(categories)
        
        for (let category of categoryRows) {

            // let parent = createBudgetRow(category, 0)
            budgetRows.appendChild(
                createBudgetRow(category, 0)
            );

            if (category.children) {

                for (let child of category.children) {

                    budgetRows.appendChild(
                        createBudgetRow(child, 1)
                    )

                    if (child.children) {

                        for (let grandchild of child.children) {

                            budgetRows.appendChild(
                                createBudgetRow(grandchild, 2)
                            )
                            }
                        }
                    }
                }
            }
        })

    console.log(budgetRows) */
}));
// POPULATE TRANSACTIONS (WITH PLACEHOLDER DATA)
const populateTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    let rows = document.querySelector('.transaction-rows');
    let res = yield fetch('http://localhost:3000/transactions');
    let transactions = Array.from(yield res.json());
    for (let trans of transactions) {
        const row = createTransactionRow(trans.name, trans.amount, trans.date, trans.category_id);
        rows.appendChild(row);
    }
    return;
});
document.addEventListener('DOMContentLoaded', populateTransactions);
// toggle edit/save button
document.querySelector('.button-edit').addEventListener('click', (event) => {
    // toggle button between 'edit' and 'save' state
    let button = event.currentTarget;
    // get all budget-rows
    let oldRows = document.querySelectorAll('.budget-row');
    if (button.innerText == 'Edit') {
        button.innerText = 'Save';
        button.style.backgroundColor = "#ffd1e0";
        // make all rows editable if 'edit' was clicked
        for (let oldRow of oldRows) {
            toggleEditableBudgetRow(oldRow);
        }
    }
    else {
        button.innerText = 'Edit';
        button.style.backgroundColor = "#FFD182";
        // freeze all rows if 'save' was clicked
        for (let oldRow of oldRows) {
            toggleFreezeBudgetRow(oldRow);
        }
        // after clicking save, we send event to budget sum for calculating the sum of all parent nodes.
        document.querySelector('.budget-sum').dispatchEvent(new Event('updateDatabaseStart'));
    }
});
// SAVE ALL BUDGET ROWS TO BUDGET
document.querySelector('.budget-sum').addEventListener('updateDatabaseStart', (event) => __awaiter(void 0, void 0, void 0, function* () {
    /**
     * When saving all budget rows, the following steps apply:
     * - all rows marked with "to_be_deleted" are deleted from database
     * --- get all dom elements, and filter tokeep/to_be_deleted
     * --- order to delete rows, so grandchildren are deleted before children, and lastly parents (foreign key constraint)
     * --- delete categories by id
     * --- delete category dom elements
     * - all other rows are saved to db
     */
    /*
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! README !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    principle: never update UI before confirmed change in db
    principle: deleting category: constraining transactions and categories will get the parent_id. If no parent_id, then no id.
    
    
    when clicking 'save':
    - filter rows in 2 arrays:
      - keep
      - delete
    
    - deletes:
      - delete in db
        - take care of foreign key constraints. "Take a step up in the tree"
      - delete in ui
    - keepers:
      - calc new sums (dont write to db yet)
      - update categories (only name and value) - entire object with potential new category_id/parent_id
      - update row in UI (as frozen) with parent_id from db, as this can have been changed
    
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    

    
    */
    // FILTER ROWS: TO KEEP / TO DELETE
    const budgetRows = Array.from(document.querySelectorAll('.budget-row'));
    const toKeepRows = budgetRows.filter(row => row.dataset.to_be_deleted != 'true');
    let toDeleteRows = budgetRows.filter(row => row.dataset.to_be_deleted == 'true');
    console.log('to keep: ', toKeepRows);
    console.log('to delete: ', toDeleteRows);
    // DELETE CATEGORIES IN DB
    const deletedCategories = yield deleteCategories(toDeleteRows.map(row => Number(row.dataset.id)));
    console.log('deleted in db: ', deletedCategories);
    // DELETE CATEGORES IN UI
    for (const deletedRow of deletedCategories) {
        toDeleteRows.forEach((row => {
            console.log('deleted in db: ', deletedRow);
            console.log('forEach toDelete: ', row);
            if (Number(row.dataset.id) == Number(deletedRow.id)) {
                deleteBudgetRow(row);
            }
        }));
    }
    // CALC SUMS
    // UPDATE CATEGORIES IN DB
    // RENDER FROZEN ROWS
    /*
    **
        * CALCULATE AND UPDATE BUDGET ROW SUMS
        *
        * 1. Calculate new sums, but dont update front end
        * 2. Update rows in the db with new values (not parent_id)
        * 3. Set new values for sum, and parent_id from db on the rows
        *
        */
    // after rows to be deleted has been removed from dom, we update sums of remaing budget rows
    console.log('check');
    try {
        updateBudgetSums();
    }
    catch (error) {
        console.error(error);
    }
}));
// TOGGLING CATEGORY ROW TO BE DELETED
const deleteCheckboxChange = function (event) {
    console.log('is this used?');
    const parentRow = event.currentTarget.parentElement.parentElement;
    if (!event.currentTarget.checked) {
        unmakeDeleteable(event.currentTarget.parentElement.parentElement);
    }
    else {
        makeDeleteable(event.currentTarget.parentElement.parentElement);
        if (event.currentTarget.parentElement.parentElement.className.includes('category-parent') || event.currentTarget.parentElement.parentElement.className.includes('category-child')) {
            let toBeDeletedRows = new Array();
            const childrenOfCurrentTargetRow = Array.from(document.querySelectorAll('.budget-row')).filter(row => row.dataset.parent_id === parentRow.dataset.id);
            if (childrenOfCurrentTargetRow) {
                // add row to be deleted rows
                //toBeDeletedRows.push(child)
                toBeDeletedRows = [...toBeDeletedRows, ...childrenOfCurrentTargetRow];
            }
            // if the eventTarget is a parent, we potentially also have grandchildren in the tree
            if (event.currentTarget.parentElement.parentElement.className.includes('category-parent')) {
                const childrenIds = childrenOfCurrentTargetRow.map(row => row.dataset.id);
                for (let childId of childrenIds) {
                    const grandChildren = Array.from(document.querySelectorAll('.budget-row')).filter(row => row.dataset.parent_id === childId);
                    toBeDeletedRows = [...toBeDeletedRows, ...grandChildren];
                }
            }
            // when finished, all children should be marked as "to_be_deleted" and greyed out.
            toBeDeletedRows.map(row => makeDeleteable(row));
        }
    }
};
const makeCategoryTreeFromBudget = () => {
    var _a, _b;
    /**
     * Returns a tree structure
     * from the budgetview, when
     * it is toggled into 'edit-mode'
     */
    const rowTree = new CategoryTree();
    const rows = document.querySelectorAll('.budget-row');
    for (const row of rows) {
        let rowLevel;
        if (row.className.includes('parent')) {
            rowLevel = 0;
        }
        else if (row.className.includes('grandchild')) {
            rowLevel = 2;
        }
        else {
            rowLevel = 1;
        }
        const rowObj = {
            id: row.dataset.id,
            name: (_a = row.querySelector('input.category-name')) === null || _a === void 0 ? void 0 : _a.value,
            level: rowLevel,
            amount: parseInt((_b = row.querySelector('input.category-amount')) === null || _b === void 0 ? void 0 : _b.value),
            parent_id: row.dataset.parent_id,
            to_be_deleted: row.dataset.to_be_deleted == 'true' ? true : false,
            element: row
        };
        rowTree.addRow(rowObj);
    }
    return rowTree;
};
const tmp = () => {
    let tree = makeCategoryTreeFromBudget();
    for (let row of tree.rows) {
        // console.log(row)
        let _ = createEditableBudgetRow(row);
        console.log(_);
    }
    // tree.renderEditable();
    // MAKE IT SO I CAN MAKE EDITABLE ROWS
    /* SPLIT "toggleeditable" into a make row editable & render it to page (in budgetDomTools.ts) */
};
// UPDATE BUDGET SUM AND ALL PARTSUMS OF CHILDREN AND PARENT CATEGORIES
const updateBudgetSums = function () {
    // INSTEAD OF ALL THE CODE BELOW: Use makeCategoryTreeFromBudget() - it has handy functions for calculating sums.
    // budget sum is calculated as parent = sum(children) = sum(grandchildren)
    // values in children and parents are updated as sum of their child
    // and will be set before the row is saved to db
    // calculating sum of all grandchild elements
    let grandChildren = Array.from(document.querySelectorAll('.category-grandchild'));
    grandChildren = grandChildren.filter(grandChild => grandChild.dataset.to_be_deleted !== 'true'); // FILTER OUT ROWS TO BE DELETED
    let uniqueParentIdOfGrandChildren = new Set(grandChildren.map((grandChild) => grandChild.dataset.parent_id));
    let sumsOfGrandChildElements = {};
    for (const uniqueParentId of uniqueParentIdOfGrandChildren) {
        sumsOfGrandChildElements[uniqueParentId] = (() => {
            const grandChildWithParentId = grandChildren.filter(grandChild => grandChild.dataset.parent_id == uniqueParentId);
            const grandChildAmounts = grandChildWithParentId.map(grandChild => parseInt(grandChild.querySelector('.category-amount').innerText));
            const sum = grandChildAmounts.reduce((prevValue, currentValue) => { return prevValue + currentValue; });
            return sum;
        })();
    }
    // write sum of grandchildren to children nodes.
    // if no grandchildren, child amount is just kept as is
    let children = Array.from(document.querySelectorAll('.category-child'));
    children = children.filter(child => child.dataset.to_be_deleted !== 'true'); // FILTER OUT ROWS TO BE DELETED
    for (const child of children) {
        let amountDiv = child.querySelector('.category-amount');
        amountDiv.innerText = sumsOfGrandChildElements[child.dataset.id] ? sumsOfGrandChildElements[child.dataset.id] : amountDiv.innerText;
    }
    // calculating sum of all child elements
    let uniqueParentIdOfChildren = new Set(children.map((child) => child.dataset.parent_id));
    let sumsOfChildElements = {};
    for (const uniqueParentId of uniqueParentIdOfChildren) {
        sumsOfChildElements[uniqueParentId] = (() => {
            const childWithParentId = children.filter(child => child.dataset.parent_id == uniqueParentId);
            const childAmounts = childWithParentId.map(child => parseInt(child.querySelector('.category-amount').innerText));
            const sum = childAmounts.reduce((prevValue, currentValue) => { return prevValue + currentValue; });
            return sum;
        })();
    }
    // write sum of childnodes to parent nodes.
    // if no children, parent amount is just kept as is
    // this also calculates the total sum and writes it to the budget-sum node
    let parents = Array.from(document.querySelectorAll('.category-parent'));
    parents = parents.filter(parent => parent.dataset.to_be_deleted !== 'true'); // FILTER OUT ROWS TO BE DELETED
    let totalSum = 0;
    for (const parent of parents) {
        let amountDiv = parent.querySelector('.category-amount');
        let parentSum = sumsOfChildElements[parent.dataset.id];
        amountDiv.innerText = parentSum ? parentSum : amountDiv.innerText;
        totalSum += parentSum ? parentSum : parseInt(amountDiv.innerText);
    }
    // set sum on the budget-sum dom element
    document.querySelector('.budget-sum').innerText = `Budget sum: ${totalSum}`;
    // after all sums are calculated, rows can be written to db.
    document.querySelector('.budget-sum').dispatchEvent(new Event('budgetUpdateDone'));
};
