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
var _a;
let BUDGET;
let TRANS;
const PERIOD = {
    YEAR: new Date().getFullYear(),
    MONTH: new Date().getMonth(),
    DAY: new Date().getDate(),
    monthNames: {
        0: "Januar",
        1: "Februar",
        2: "Marts",
        3: "April",
        4: "Maj",
        5: "Juni",
        6: "Juli",
        7: "August",
        8: "September",
        9: "Oktober",
        10: "November",
        11: "December",
    },
};
// POPULATE BUDGET WITH CATEGORY ROWS
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // RENDER TITLES
    BudgetPage.renderTitles();
    const BUDGET_ID = parseInt((_b = window.location.href.split("/").at(-1)) !== null && _b !== void 0 ? _b : "-1");
    console.log("about to init TRANSACTIONS");
    // TRANSACTIONS PAGE
    TRANS = new TransactionContainer(BUDGET_ID, new MockTransactionQueries(), new TransactionContainerRender());
    yield TRANS.init();
    console.log("TRANSACTIONS has been init");
    // BUDGET PAGE
    let budgetRowsDomElement = document.querySelector(".budget-rows");
    if (budgetRowsDomElement == null) {
        throw new Error("Could not find budget rows element");
    }
    let categories = yield getCategories();
    if (categories == undefined) {
        throw new Error("Categories returned undefined!");
    }
    const filteredCategories = categories.filter((cat) => cat.budget_id === BUDGET_ID);
    BUDGET = new Budget(filteredCategories, budgetRowsDomElement);
}));
const toggle = () => {
    BUDGET.editable = !BUDGET.editable;
};
/*
// POPULATE TRANSACTION ROWS
const populateTransactions = async () => {

    let rows = document.querySelector('.transaction-rows');

    let res = await fetch('http://localhost:3000/transactions')

    let transactions = Array.from(await res.json())

    for (let trans of transactions) {

        const row = createTransactionRow(trans.name, trans.amount, trans.date, trans.category_id);

        rows.appendChild(row);
    }

    return

}

document.addEventListener('DOMContentLoaded', populateTransactions)
*/
// TOGGLE EDIT / SAVE
document
    .querySelector(".button-edit")
    .addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
    // toggle button between 'edit' and 'save' state
    let button = event.currentTarget;
    if (button.innerText == "Edit") {
        button.innerText = "Save";
        button.style.backgroundColor = "#ffd1e0";
        // make all rows editable if 'edit' was clicked
        BUDGET.editable = true;
    }
    else {
        button.innerText = "Edit";
        button.style.backgroundColor = "#FFD182";
        BUDGET.editable = false;
    }
}));
// MARK DELETE
// ADD NEW (root) CATEGORY ROW
(_a = document.querySelector("#addRow")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (event) => {
    const newRow = BUDGET.root.addChild();
    BUDGET.budgetRowsDomElement.appendChild(newRow.renderEditable());
    newRow.focusOnElement();
});
// /* TO BE DELETED
const makeCategoryTreeFromBudget = () => {
    var _a, _b;
    throw new Error("Should not use any more - tree will never be built from DOM element - only from API call");
    /**
     * Returns a tree structure
     * from the budgetview, when
     * it is toggled into 'edit-mode'
     */
    const categoryRows = new Budget();
    const budgetRows = document.querySelectorAll(".budget-row");
    for (const row of budgetRows) {
        let rowLevel;
        if (row.className.includes("parent")) {
            rowLevel = 0;
        }
        else if (row.className.includes("grandchild")) {
            rowLevel = 2;
        }
        else {
            rowLevel = 1;
        }
        const catRow = {
            id: row.dataset.id,
            name: (_a = row.querySelector("input.category-name")) === null || _a === void 0 ? void 0 : _a.value,
            level: rowLevel,
            amount: parseInt((_b = row.querySelector("input.category-amount")) === null || _b === void 0 ? void 0 : _b.value),
            parent_id: row.dataset.parent_id,
            to_be_deleted: row.dataset.to_be_deleted == "true" ? true : false,
            element: row,
        };
        categoryRows.addRow(catRow);
    }
    return categoryRows;
};
// UPDATE BUDGET SUM AND ALL PARTSUMS OF CHILDREN AND PARENT CATEGORIES
const updateBudgetSums = function () {
    throw new Error('we shouldn"t use this anymore - updateBudgetSums');
    // INSTEAD OF ALL THE CODE BELOW: Use makeCategoryTreeFromBudget() - it has handy functions for calculating sums.
    // budget sum is calculated as parent = sum(children) = sum(grandchildren)
    // values in children and parents are updated as sum of their child
    // and will be set before the row is saved to db
    // calculating sum of all grandchild elements
    let grandChildren = Array.from(document.querySelectorAll(".category-grandchild"));
    grandChildren = grandChildren.filter((grandChild) => grandChild.dataset.to_be_deleted !== "true"); // FILTER OUT ROWS TO BE DELETED
    let uniqueParentIdOfGrandChildren = new Set(grandChildren.map((grandChild) => grandChild.dataset.parent_id));
    let sumsOfGrandChildElements = {};
    for (const uniqueParentId of uniqueParentIdOfGrandChildren) {
        sumsOfGrandChildElements[uniqueParentId] = (() => {
            const grandChildWithParentId = grandChildren.filter((grandChild) => grandChild.dataset.parent_id == uniqueParentId);
            const grandChildAmounts = grandChildWithParentId.map((grandChild) => parseInt(grandChild.querySelector(".category-amount").innerText));
            const sum = grandChildAmounts.reduce((prevValue, currentValue) => {
                return prevValue + currentValue;
            });
            return sum;
        })();
    }
    // write sum of grandchildren to children nodes.
    // if no grandchildren, child amount is just kept as is
    let children = Array.from(document.querySelectorAll(".category-child"));
    children = children.filter((child) => child.dataset.to_be_deleted !== "true"); // FILTER OUT ROWS TO BE DELETED
    for (const child of children) {
        let amountDiv = child.querySelector(".category-amount");
        amountDiv.innerText = sumsOfGrandChildElements[child.dataset.id]
            ? sumsOfGrandChildElements[child.dataset.id]
            : amountDiv.innerText;
    }
    // calculating sum of all child elements
    let uniqueParentIdOfChildren = new Set(children.map((child) => child.dataset.parent_id));
    let sumsOfChildElements = {};
    for (const uniqueParentId of uniqueParentIdOfChildren) {
        sumsOfChildElements[uniqueParentId] = (() => {
            const childWithParentId = children.filter((child) => child.dataset.parent_id == uniqueParentId);
            const childAmounts = childWithParentId.map((child) => parseInt(child.querySelector(".category-amount").innerText));
            const sum = childAmounts.reduce((prevValue, currentValue) => {
                return prevValue + currentValue;
            });
            return sum;
        })();
    }
    // write sum of childnodes to parent nodes.
    // if no children, parent amount is just kept as is
    // this also calculates the total sum and writes it to the budget-sum node
    let parents = Array.from(document.querySelectorAll(".category-parent"));
    parents = parents.filter((parent) => parent.dataset.to_be_deleted !== "true"); // FILTER OUT ROWS TO BE DELETED
    let totalSum = 0;
    for (const parent of parents) {
        let amountDiv = parent.querySelector(".category-amount");
        let parentSum = sumsOfChildElements[parent.dataset.id];
        amountDiv.innerText = parentSum ? parentSum : amountDiv.innerText;
        totalSum += parentSum ? parentSum : parseInt(amountDiv.innerText);
    }
    // set sum on the budget-sum dom element
    document.querySelector(".budget-sum").innerText = `Budget sum: ${totalSum}`;
    // after all sums are calculated, rows can be written to db.
    // document.querySelector('.budget-sum').dispatchEvent(new Event('budgetUpdateDone'));
};
const deleteCheckboxChange = function (event) {
    throw new Error("is this used - deprecated deleteCheckboxChange");
    const parentRow = event.currentTarget.parentElement.parentElement;
    if (!event.currentTarget.checked) {
        unmakeDeleteable(event.currentTarget.parentElement.parentElement);
    }
    else {
        makeDeleteable(event.currentTarget.parentElement.parentElement);
        if (event.currentTarget.parentElement.parentElement.className.includes("category-parent") ||
            event.currentTarget.parentElement.parentElement.className.includes("category-child")) {
            let toBeDeletedRows = new Array();
            const childrenOfCurrentTargetRow = Array.from(document.querySelectorAll(".budget-row")).filter((row) => row.dataset.parent_id === parentRow.dataset.id);
            if (childrenOfCurrentTargetRow) {
                // add row to be deleted rows
                //toBeDeletedRows.push(child)
                toBeDeletedRows = [
                    ...toBeDeletedRows,
                    ...childrenOfCurrentTargetRow,
                ];
            }
            // if the eventTarget is a parent, we potentially also have grandchildren in the tree
            if (event.currentTarget.parentElement.parentElement.className.includes("category-parent")) {
                const childrenIds = childrenOfCurrentTargetRow.map((row) => row.dataset.id);
                for (let childId of childrenIds) {
                    const grandChildren = Array.from(document.querySelectorAll(".budget-row")).filter((row) => row.dataset.parent_id === childId);
                    toBeDeletedRows = [...toBeDeletedRows, ...grandChildren];
                }
            }
            // when finished, all children should be marked as "to_be_deleted" and greyed out.
            toBeDeletedRows.map((row) => makeDeleteable(row));
        }
    }
};
