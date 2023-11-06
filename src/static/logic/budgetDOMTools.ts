import { createHTMLElement } from "./htmlTools.js";
import { LevelClassMap } from "./interfaces.js";
import { BUDGET } from "./budget.js";

////**** BUDGET SIDE  ****////

// CREATE BUDGET ROW
export const createBudgetRow = function (category: CategoryRow): Element {
    let budgetRowElement = createHTMLElement(
        "div",
        `budget-row ${LevelClassMap.get(String(category["level"]))}`,
        "",
        [
            createHTMLElement("div", "category-name", `${category["name"]}`),
            createHTMLElement(
                "div",
                "category-amount",
                String(category["amount"])
            ),
        ]
    );

    // set id's on budget row element
    budgetRowElement.dataset.id = String(category["id"]);
    budgetRowElement.dataset.parent_id = String(category["parent_id"]);

    return budgetRowElement;
};

export const createEditableBudgetRow = function (
    category: CategoryRow
): Element {
    `
    Structure of editable budget row

    <div class="budget-row category-parent editable" data-id="8" data-parent_id="null">
        <input class="category-name" type="text">
        <div class="category-add">
            <div class="add-category-btn">
                +
            </div>
        </div>
        <div class="category-delete">
            <div class="delete-category-btn" id="delete_8">
                x
            </div>
        </div>
        <input class="category-amount" type="number">
    </div>
    
    `;
    /* 
    Returns budget-row element editable

    /*
     * Takes Category as input. 
     * Besides obligatory fields, 
     * optional field 'level' must
     * be provided.
     * 
     */

    // MAIN ELEMENT
    let editableBudgetRowElement = createHTMLElement(
        "div",
        `budget-row editable ${LevelClassMap.get(String(category["level"]))}`
    );

    editableBudgetRowElement.dataset.id = String(category.id);

    editableBudgetRowElement.dataset.parent_id = String(category.parent_id);

    // NAME SUB ELEMENT
    let nameInput = createHTMLElement("input", "category-name");

    nameInput.type = "text";

    nameInput.value = category["name"];

    nameInput.placeholder = "Add name for new row";

    nameInput.addEventListener("keyup", () => {
        editableBudgetRowElement.getObject().name = nameInput.value;
    });

    editableBudgetRowElement.appendChild(nameInput);

    // ADD ROW BUTTON
    // don't add to grandchild elements or new rows (has id == NaN)
    if (category["level"] < 3 && !Number.isNaN(category.id)) {
        let categoryAddBtn = createHTMLElement("div", "add-category-btn", "+");

        categoryAddBtn.addEventListener("click", addBudgetRowHandler);

        let categoryAdd = createHTMLElement("div", "category-add", "", [
            categoryAddBtn,
        ]);

        editableBudgetRowElement.appendChild(categoryAdd);
    }

    // DELETE CATEGORY BUTTON
    let categoryDelete = createHTMLElement("div", "category-delete");

    let categoryDeleteBtn = createHTMLElement(
        "div",
        "delete-category-btn",
        "x"
    );

    categoryDeleteBtn.id = "delete_" + String(category.id);

    categoryDeleteBtn.addEventListener("click", deleteBudgetRowHandler);

    categoryDelete.appendChild(categoryDeleteBtn);

    editableBudgetRowElement.appendChild(categoryDelete);

    // AMOUNT SUB ELEMENT
    let amountInput = createHTMLElement("input", "category-amount");

    amountInput.type = "number";

    amountInput.value = category["amount"];

    amountInput.addEventListener("keyup", () => {
        editableBudgetRowElement.getObject().amount = amountInput.value;
    });

    editableBudgetRowElement.appendChild(amountInput);

    return editableBudgetRowElement;
};

export const createCategoryRowFromElement = function (
    element: Element
): CategoryRow {
    // converts html element into CategoryRow object

    // if a childnode of a budget row element is given, we select the budget-row parent element first

    element = getBudgetRow(element);

    // creating the CategoryRow object
    let catRow: CategoryRow = {
        name:
            String(element.querySelector(".category-name").value) ??
            "No name found",
        amount:
            Number(element.querySelector(".category-amount").value) ??
            "No amount found",
        id: Number(element.dataset.id) ?? "No id found",
        parent_id: Number(element.dataset.parent_id) ?? "No parent id found",
        budget_id:
            Number(element.querySelector(".category-name").value) ??
            "No budget id found",
        level:
            Number(LevelClassMap.get(element.className)) ??
            "No level or class found",
        to_be_deleted: element.dataset.to_be_deleted ?? false,
        element: element,
    };

    return catRow;
};

export const toggleFreezeBudgetRow = function (
    editableBudgetRow: HTMLElementBudgetRowEditable
): void {
    // remove class "editable" on row
    editableBudgetRow.className = editableBudgetRow.className.replace(
        " editable",
        ""
    );

    // get values of nameDiv and amountDiv
    let nameInput = editableBudgetRow.querySelector(".category-name");
    let amountInput = editableBudgetRow.querySelector(".category-amount");

    let nameValue = nameInput.value;
    let amountValue = amountInput.value;

    // create new div
    let nameDiv = document.createElement("div");
    let amountDiv = document.createElement("div");

    // change input into div
    nameDiv.innerText = nameValue;
    amountDiv.innerText = amountValue;
    nameDiv.className = nameInput.className;
    amountDiv.className = amountInput.className;

    editableBudgetRow.replaceChild(nameDiv, nameInput);
    editableBudgetRow.replaceChild(amountDiv, amountInput);

    // remove delete button and add row button
    editableBudgetRow.removeChild(
        editableBudgetRow.querySelector(".category-delete")
    );
    editableBudgetRow.removeChild(
        editableBudgetRow.querySelector(".category-add")
    );
};

// ADD BUDGET ROW TO BUDGET
export const addBudgetRowHandler = function (event: Event) {
    // call createBudgetRow function...
    const parentRow = getBudgetRow(event.currentTarget);

    console.log("Parent row: ", parentRow.getObject());

    BUDGET.addNewRow(parentRow.dataset.id);
};

// DELETE BUDGET ROW
export function deleteBudgetRowHandler(event: Event): void {
    /**
     * Handles the marking of row as to_be_deleted
     * Row isn't deleted until 'save' is clicked
     * and budget sums and all rows are to be written to db
     */

    const budgetRow = getBudgetRow(event.currentTarget);

    const budgetObject = budgetRow.getObject();

    if (budgetRow.dataset.to_be_deleted == "true") {
        budgetRow.dataset.to_be_deleted = "false";

        budgetObject.to_be_deleted = false;

        unmakeDeleteable(budgetRow);
    } else {
        budgetRow.dataset.to_be_deleted = "true";

        budgetObject.to_be_deleted = true;

        makeDeleteable(budgetRow);
    }
}

export function deleteBudgetRow(row: HTMLElement): void {
    row.parentElement?.removeChild(row);
}

export function getBudgetRow(element: HTMLElement): HTMLElement | boolean {
    /**
     * Looks for budget-row element from child and up
     * Search stops, if <body> element is reached
     * or if there is no parent and row isn't a
     * budget row element.
     */

    if (element.className.includes("budget-row")) {
        return element;
    }

    if (element.tagName == "body" || element.parentElement == null) {
        // we've gone to far without finding the budget row to delete
        return false;
    }

    return getBudgetRow(element.parentElement);
}

export const makeDeleteable = function (budgetRow: HTMLElement) {
    // should check if deleteable already in classname (when disabling childnodes of a category row, that can be checked already)
    if (!budgetRow.className.includes("deleteable")) {
        budgetRow.className += " deleteable";
    } else {
        unmakeDeleteable(budgetRow);
    }

    // disable amount and name input field
    Array.from(budgetRow.querySelectorAll("input.category-amount")).forEach(
        (input) => {
            input.disabled = true;
        }
    );
    Array.from(budgetRow.querySelectorAll("input.category-name")).forEach(
        (input) => {
            input.disabled = true;
        }
    );

    // greyout delete button and add row button
    const deleteBtn = budgetRow.querySelector(".delete-category-btn");

    // check for deleteBtn if it somehow cannot be found
    if (deleteBtn && !deleteBtn.className.includes("greyed-out")) {
        deleteBtn.className += " greyed-out";
    }

    const addBtn = budgetRow.querySelector(".add-category-btn");

    // checking for addBtn first, as grandchild rows doesn't have addBtn and thus will be undefined and we skip
    if (addBtn && !addBtn.className.includes("greyed-out")) {
        addBtn.className += " greyed-out";
    }
};

export const unmakeDeleteable = function (budgetRow: HTMLElement) {
    budgetRow.className = budgetRow.className.replace(" deleteable", "");

    // enable amount and name input field
    Array.from(budgetRow.querySelectorAll("input.category-amount")).forEach(
        (input) => {
            input.disabled = false;
        }
    );
    Array.from(budgetRow.querySelectorAll("input.category-name")).forEach(
        (input) => {
            input.disabled = false;
        }
    );

    // un-greyout delete button and add row button
    const deleteBtn = budgetRow.querySelector(".delete-category-btn");

    // check for deleteBtn if it somehow cannot be found
    if (deleteBtn && deleteBtn.className.includes("greyed-out")) {
        deleteBtn.className = deleteBtn?.className.replace(" greyed-out", "");
    }

    const addBtn = budgetRow.querySelector(".add-category-btn");

    // checking for addBtn first, as grandchild rows doesn't have addBtn and thus will be undefined and we skip
    if (addBtn && addBtn.className.includes("greyed-out")) {
        addBtn.className = addBtn?.className.replace(" greyed-out", "");
    }
};

////**** TRANSACTIONS SIDE  ****////

// CREATE PLACEHOLDER TRANSACTION ROW

export const createPlaceholderTransactionRow = function () {
    let row = document.createElement("div");
    row.className = "transaction-row";

    let date = document.createElement("div");
    date.className = "transaction-date";
    let day = Math.round(Math.random() * 31);
    let month = Math.round(Math.random() * 12);
    let year = Math.round(Math.random() * 50) + 1980;
    date.innerText = `${day}-${month}-${year}`;

    let amount = document.createElement("div");
    amount.className = "transaction-amount";
    amount.innerText = String(Math.round(Math.random() * 350));

    let description = document.createElement("div");
    description.className = "transaction-description";
    description.innerText = "<placeholder_description>";

    let category = document.createElement("div");
    category.className = "transaction-category";
    category.innerText = "<plh CAT>";

    row.appendChild(date);
    row.appendChild(amount);
    row.appendChild(description);
    row.appendChild(category);

    return row;
};

export const createTransactionRow = function (
    description = "default desc",
    amount = "def amount",
    date = "def date",
    category = "def category"
) {
    const transactionRowClass = "transaction-row";
    const transactionDateClass = "transaction-date";
    const transactionDescriptionClass = "transaction-description";
    const transactionAmountClass = "transaction-amount";
    const transactionCategoryClass = "transaction-category";

    const element = document.createElement("div");
    element.className = transactionRowClass;
    element.innerHTML = `
        
            <div class="${transactionDateClass}">${iso8601dateToInputValue(
        date
    )}</div>
            <div class="${transactionAmountClass}">${amount}</div>
            <div class="${transactionDescriptionClass}">${description}</div>
            <div class="${transactionCategoryClass}">${category}</div>

    `;

    return element;
};
