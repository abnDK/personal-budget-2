"use strict";
////**** BUDGET SIDE  ****////
// CREATE BUDGET ROW
const createBudgetRow = function (category) {
    /**
     * Takes CategoryRow as input.
     * Besides obligatory fields,
     * optional field 'level' must
     * be provided.
     *
     */
    // create budget row element with name and amount children
    let budgetRowElement = createHTMLElement('div', 'budget-row', '', [
        createHTMLElement('div', 'category-name', category['name']),
        createHTMLElement('div', 'category-amount', String(category['amount']))
    ]);
    // add class to define what level in the budget hierarchy the category is
    if (category['level'] == 0) {
        budgetRowElement.className += ' category-parent';
    }
    else if (category['level'] == 1) {
        budgetRowElement.className += ' category-child';
    }
    else if (category['level'] == 2) {
        budgetRowElement.className += ' category-grandchild';
    }
    // set id's on budget row element
    budgetRowElement.dataset.id = String(category['id']);
    budgetRowElement.dataset.parent_id = String(category['parent_id']);
    return budgetRowElement;
};
const createEditableBudgetRow = function (category) {
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
     * Takes CategoryRow as input.
     * Besides obligatory fields,
     * optional field 'level' must
     * be provided.
     *
     */
    let editableBudgetRowElement = createHTMLElement('div', 'budget-row editable');
    editableBudgetRowElement.dataset.id = String(category.id);
    editableBudgetRowElement.dataset.parent_id = String(category.parent_id);
    if (category['level'] == 0) {
        editableBudgetRowElement.className += ' category-parent';
    }
    else if (category['level'] == 1) {
        editableBudgetRowElement.className += ' category-child';
    }
    else if (category['level'] == 2) {
        editableBudgetRowElement.className += ' category-grandchild';
    }
    else {
        console.log('category: ', typeof category['level'], category['level']);
    }
    let nameInput = createHTMLElement('input', 'category-name');
    nameInput.type = 'text';
    nameInput.value = category['name'];
    editableBudgetRowElement.appendChild(nameInput);
    let categoryAdd = createHTMLElement('div', 'category-add', '', [createHTMLElement('div', 'add-category-btn', '+')]);
    editableBudgetRowElement.appendChild(categoryAdd);
    let categoryDelete = createHTMLElement('div', 'category-delete');
    let categoryDeleteBtn = createHTMLElement('div', 'delete-category-btn', 'x');
    categoryDeleteBtn.id = 'delete_' + String(category.id);
    categoryDelete.appendChild(categoryDeleteBtn);
    editableBudgetRowElement.appendChild(categoryDelete);
    let amountInput = createHTMLElement('input', 'category-amount');
    amountInput.type = 'number';
    amountInput.value = category['amount'];
    editableBudgetRowElement.appendChild(amountInput);
    return editableBudgetRowElement;
};
// TOGGLE BUDGET ROW (onclick 'edit'); EDITABLE OR FREEZE
const toggleEditableBudgetRow = function (budgetRow) {
    // read values of oldRow
    const rowTag = budgetRow.tagName;
    const rowClassName = budgetRow.className;
    const oldNameElement = budgetRow.querySelector('.category-name');
    const oldAmountElement = budgetRow.querySelector('.category-amount');
    const rowName = oldNameElement.innerText;
    const rowAmount = oldAmountElement.innerText;
    const rowId = budgetRow.dataset.id;
    const parentId = budgetRow.dataset.parent_id;
    // create newRow element
    let newRowElement = createHTMLElement(rowTag, rowClassName + ' editable');
    let newNameElement = createHTMLElement('input', oldNameElement.className);
    newNameElement.type = 'text';
    let newAmountElement = createHTMLElement('input', oldAmountElement.className);
    newAmountElement.type = 'number';
    // create add row <div> with a button inside
    let newAddRowElement = createHTMLElement('div', 'category-add');
    let newAddRowButtonElement = createHTMLElement('div', 'add-category-btn');
    newAddRowButtonElement.innerText = '+';
    newAddRowButtonElement.addEventListener('click', addBudgetRow);
    newAddRowElement.appendChild(newAddRowButtonElement);
    // create delete div with <input> and <label> element
    let newDeleteElement = createHTMLElement('div', 'category-delete');
    let newDeleteRowButtonElement = createHTMLElement('div', 'delete-category-btn');
    newDeleteRowButtonElement.innerText = 'x';
    newDeleteRowButtonElement.id = 'delete_' + rowId;
    newDeleteRowButtonElement.addEventListener('click', deleteBudgetRowHandler);
    newDeleteElement.appendChild(newDeleteRowButtonElement);
    // insert data in newRow
    newNameElement.value = rowName;
    newAmountElement.value = rowAmount;
    newRowElement.dataset.id = rowId;
    newRowElement.dataset.parent_id = parentId;
    // append children to newRow
    newRowElement.appendChild(newNameElement);
    newRowElement.appendChild(newAddRowElement);
    newRowElement.appendChild(newDeleteElement);
    newRowElement.appendChild(newAmountElement);
    // replace oldRow with newRow
    budgetRow.parentElement.replaceChild(newRowElement, budgetRow);
};
const toggleFreezeBudgetRow = function (editableBudgetRow) {
    // remove class "editable" on row
    editableBudgetRow.className = editableBudgetRow.className.replace(' editable', '');
    // get values of nameDiv and amountDiv
    let nameInput = editableBudgetRow.querySelector('.category-name');
    let amountInput = editableBudgetRow.querySelector('.category-amount');
    let nameValue = nameInput.value;
    let amountValue = amountInput.value;
    // create new div
    let nameDiv = document.createElement('div');
    let amountDiv = document.createElement('div');
    // change input into div
    nameDiv.innerText = nameValue;
    amountDiv.innerText = amountValue;
    nameDiv.className = nameInput.className;
    amountDiv.className = amountInput.className;
    editableBudgetRow.replaceChild(nameDiv, nameInput);
    editableBudgetRow.replaceChild(amountDiv, amountInput);
    // remove delete button and add row button
    editableBudgetRow.removeChild(editableBudgetRow.querySelector('.category-delete'));
    editableBudgetRow.removeChild(editableBudgetRow.querySelector('.category-add'));
};
// ADD BUDGET ROW TO BUDGET
const addBudgetRow = function (event) {
    // call createBudgetRow function...
    console.log(event.currentTarget);
    // logic that places the row
    // can we use the same for root row as well as parent, child and grandchild rows?
};
// DELETE BUDGET ROW
function deleteBudgetRowHandler(event) {
    /**
     * Handles the marking of row as to_be_deleted
     * Row isn't deleted until 'save' is clicked
     * and budget sums and all rows are to be written to db
     */
    const budgetRow = getBudgetRow(event.currentTarget);
    if (budgetRow.dataset.to_be_deleted == "true") {
        budgetRow.dataset.to_be_deleted = "false";
        unmakeDeleteable(budgetRow);
    }
    else {
        budgetRow.dataset.to_be_deleted = "true";
        makeDeleteable(budgetRow);
    }
}
function deleteBudgetRow(row) {
    var _a;
    (_a = row.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(row);
}
function getBudgetRow(element) {
    /**
     * Looks for budget-row element from child and up
     * Search stops, if <body> element is reached
     * or if there is no parent and row isn't a
     * budget row element.
     */
    if (element.className.includes('budget-row')) {
        return element;
    }
    if (element.tagName == 'body' || element.parentElement == null) {
        // we've gone to far without finding the budget row to delete
        return false;
    }
    return getBudgetRow(element.parentElement);
}
const makeDeleteable = function (budgetRow) {
    // should check if deleteable already in classname (when disabling childnodes of a category row, that can be checked already)
    if (!budgetRow.className.includes('deleteable')) {
        budgetRow.className += ' deleteable';
    }
    else {
        unmakeDeleteable(budgetRow);
    }
    // disable amount and name input field
    Array.from(budgetRow.querySelectorAll('input.category-amount')).forEach(input => { input.disabled = true; });
    Array.from(budgetRow.querySelectorAll('input.category-name')).forEach(input => { input.disabled = true; });
    // greyout delete button and add row button
    const deleteBtn = budgetRow.querySelector('.delete-category-btn');
    if (!deleteBtn.className.includes('greyed-out')) {
        deleteBtn.className += ' greyed-out';
    }
    const addBtn = budgetRow.querySelector('.add-category-btn');
    if (!addBtn.className.includes('greyed-out')) {
        addBtn.className += ' greyed-out';
    }
};
const unmakeDeleteable = function (budgetRow) {
    budgetRow.className = budgetRow.className.replace(' deleteable', '');
    // enable amount and name input field
    Array.from(budgetRow.querySelectorAll('input.category-amount')).forEach(input => { input.disabled = false; });
    Array.from(budgetRow.querySelectorAll('input.category-name')).forEach(input => { input.disabled = false; });
    // un-greyout delete button and add row button
    const deleteBtn = budgetRow.querySelector('.delete-category-btn');
    if (deleteBtn.className.includes('greyed-out')) {
        deleteBtn.className = deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.className.replace(' greyed-out', '');
    }
    const addBtn = budgetRow.querySelector('.add-category-btn');
    if (addBtn.className.includes('greyed-out')) {
        addBtn.className = addBtn === null || addBtn === void 0 ? void 0 : addBtn.className.replace(' greyed-out', '');
    }
};
////**** TRANSACTIONS SIDE  ****////
// CREATE PLACEHOLDER TRANSACTION ROW
const createPlaceholderTransactionRow = function () {
    let row = document.createElement('div');
    row.className = 'transaction-row';
    let date = document.createElement('div');
    date.className = 'transaction-date';
    let day = Math.round(Math.random() * 31);
    let month = Math.round(Math.random() * 12);
    let year = Math.round(Math.random() * 50) + 1980;
    date.innerText = `${day}-${month}-${year}`;
    let amount = document.createElement('div');
    amount.className = 'transaction-amount';
    amount.innerText = String(Math.round(Math.random() * 350));
    let description = document.createElement('div');
    description.className = 'transaction-description';
    description.innerText = "<placeholder_description>";
    let category = document.createElement('div');
    category.className = 'transaction-category';
    category.innerText = '<plh CAT>';
    row.appendChild(date);
    row.appendChild(amount);
    row.appendChild(description);
    row.appendChild(category);
    return row;
};
const createTransactionRow = function (description = 'default desc', amount = "def amount", date = "def date", category = "def category") {
    const transactionRowClass = 'transaction-row';
    const transactionDateClass = 'transaction-date';
    const transactionDescriptionClass = 'transaction-description';
    const transactionAmountClass = 'transaction-amount';
    const transactionCategoryClass = 'transaction-category';
    const element = document.createElement('div');
    element.className = transactionRowClass;
    element.innerHTML = `
        
            <div class="${transactionDateClass}">${iso8601dateToInputValue(date)}</div>
            <div class="${transactionAmountClass}">${amount}</div>
            <div class="${transactionDescriptionClass}">${description}</div>
            <div class="${transactionCategoryClass}">${category}</div>

    `;
    return element;
};
