"use strict";
// CREATE BUDGET ROWS
const createBudgetRow = function (budgetObject, level) {
    /**
     * budgetObject: {data}
     * level: Number // indicating parent/child/grandchild. 0 = parent, 1 = child, 2 = grandchild
     */
    // create budget row element with name and amount children
    let budgetRowElement = createHTMLElement('div', 'budget-row', '', [
        createHTMLElement('div', 'category-name', budgetObject['name']),
        createHTMLElement('div', 'category-amount', budgetObject['amount'])
    ]);
    // add class to define what level in the budget hierarchy the category is
    if (level == 0) {
        budgetRowElement.className += ' category-parent';
    }
    else if (level == 1) {
        budgetRowElement.className += ' category-child';
    }
    else if (level == 2) {
        budgetRowElement.className += ' category-grandchild';
    }
    // set id's on budget row element
    budgetRowElement.dataset.id = budgetObject['id'];
    budgetRowElement.dataset.parent_id = budgetObject['parent_id'];
    return budgetRowElement;
};
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
const makeDeleteable = function (budgetRow) {
    // should check if deleteable already in classname (when disabling childnodes of a category row, that can be checked already)
    if (!budgetRow.className.includes('deleteable')) {
        budgetRow.className += ' deleteable';
    }
    // disable amount and name input field
    Array.from(budgetRow.querySelectorAll('input.category-amount')).forEach(input => { input.disabled = true; });
    Array.from(budgetRow.querySelectorAll('input.category-name')).forEach(input => { input.disabled = true; });
    // check off delete checkbox if not already checked (if "makeDeleteable" is initialized by a parent node)
    budgetRow.querySelector('input[type=checkbox]').checked = true;
};
const unmakeDeleteable = function (budgetRow) {
    budgetRow.className = budgetRow.className.replace(' deleteable', '');
    // enable amount and name input field
    Array.from(budgetRow.querySelectorAll('input.category-amount')).forEach(input => { input.disabled = false; });
    Array.from(budgetRow.querySelectorAll('input.category-name')).forEach(input => { input.disabled = false; });
};
