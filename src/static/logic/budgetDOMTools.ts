// CREATE BUDGET ROW
const createBudgetRow = function(budgetObject: {name:string, amount:string, id:string, parent_id:string}, level: number): HTMLElement {
    /**
     * budgetObject: {data}
     * level: Number // indicating parent/child/grandchild. 0 = parent, 1 = child, 2 = grandchild
     */

    // create budget row element with name and amount children


    let budgetRowElement = createHTMLElement('div', 'budget-row', '', [
        createHTMLElement('div', 'category-name', budgetObject['name']),
        createHTMLElement('div', 'category-amount', budgetObject['amount'])
    ])

    // add class to define what level in the budget hierarchy the category is
    if (level == 0) {
        budgetRowElement.className += ' category-parent'
    } else if (level == 1) {
        budgetRowElement.className += ' category-child'
    } else if (level == 2) {
        budgetRowElement.className += ' category-grandchild'
    }

    // set id's on budget row element
    budgetRowElement.dataset.id = budgetObject['id'];
    budgetRowElement.dataset.parent_id = budgetObject['parent_id']

    


    return budgetRowElement;
}

const toggleEditableBudgetRow = function(budgetRow: HTMLElementBudgetRow): void {

    // read values of oldRow
    const rowTag = budgetRow.tagName;
            
    const rowClassName: string = budgetRow.className;
    const oldNameElement: HTMLElement | null = budgetRow.querySelector('.category-name')
    const oldAmountElement: HTMLElement | null = budgetRow.querySelector('.category-amount')
    const rowName: string | null = oldNameElement.innerText;
    const rowAmount: string | null = oldAmountElement.innerText;
    const rowId: string = budgetRow.dataset.id;
    const parentId: string = budgetRow.dataset.parent_id

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

    newAddRowElement.appendChild(newAddRowButtonElement)
    
    // create delete div with <input> and <label> element
    let newDeleteElement = createHTMLElement('div', 'category-delete');
    
    let newDeleteRowButtonElement = createHTMLElement('div', 'delete-category-btn');
    newDeleteRowButtonElement.innerText = '-';
    newDeleteRowButtonElement.id = 'delete_' + rowId;
    newDeleteRowButtonElement.addEventListener('click', deleteBudgetRow);

    newDeleteElement.appendChild(newDeleteRowButtonElement)

    /*
    let newDeleteInput = createHTMLElement('input');
    newDeleteInput.type = 'checkbox'
    newDeleteInput.id = 'delete_' + rowId;
    newDeleteInput.addEventListener('change', deleteCheckboxChange)
    
    let newDeleteLabel = createHTMLElement('label', undefined, 'Delete');
    newDeleteLabel.htmlFor = newDeleteInput.id;
    
    newDeleteElement.appendChild(newDeleteInput);
    newDeleteElement.appendChild(newDeleteLabel);
    */

    // insert data in newRow
    newNameElement.value = rowName
    newAmountElement.value = rowAmount
    newRowElement.dataset.id = rowId;
    newRowElement.dataset.parent_id = parentId;


    // append children to newRow
    newRowElement.appendChild(newNameElement);
    newRowElement.appendChild(newAddRowElement);
    newRowElement.appendChild(newDeleteElement);
    newRowElement.appendChild(newAmountElement);

    // replace oldRow with newRow
    budgetRow.parentElement.replaceChild(newRowElement, budgetRow)


}

const toggleFreezeBudgetRow = function(editableBudgetRow: HTMLElementBudgetRowEditable): void {
    
    // remove class "editable" on row
    editableBudgetRow.className = editableBudgetRow.className.replace(' editable', '')


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

    // if delete checkbox is checked, set data-delete = true
    const toBeDeleted = editableBudgetRow.querySelector('.category-delete').querySelector('input').checked
    if (toBeDeleted) {
        editableBudgetRow.dataset.to_be_deleted = 'true';
    }

    // remove delete checkbox
    editableBudgetRow.removeChild(editableBudgetRow.querySelector('.category-delete'));
}

// ADD BUDGET ROW TO BUDGET
const addBudgetRow = function(event: Event) {
    // call createBudgetRow function...
    console.log(event.currentTarget)



    // logic that places the row
    // can we use the same for root row as well as parent, child and grandchild rows?



}

/*
// DELETE BUDGET ROW
const deleteBudgetRow = function(event: Event) {
    console.log(event.currentTarget)
}
*/

// CREATE PLACEHOLDER TRANSACTION ROW

const createPlaceholderTransactionRow = function() {
    let row = document.createElement('div')
    row.className = 'transaction-row'

    let date = document.createElement('div')
    date.className = 'transaction-date'
    let day = Math.round(Math.random() * 31)
    let month = Math.round(Math.random() * 12)
    let year = Math.round(Math.random() * 50) + 1980
    date.innerText=`${day}-${month}-${year}`


    let amount = document.createElement('div')
    amount.className = 'transaction-amount'
    amount.innerText = String(Math.round(Math.random() * 350))

    let description = document.createElement('div')
    description.className = 'transaction-description'
    description.innerText = "<placeholder_description>"

    let category = document.createElement('div')
    category.className = 'transaction-category'
    category.innerText = '<plh CAT>'

    row.appendChild(date);
    row.appendChild(amount);
    row.appendChild(description);
    row.appendChild(category);

    return row
}

const createTransactionRow = function(description='default desc', amount="def amount", date="def date", category="def category") {
    const transactionRowClass = 'transaction-row'
    const transactionDateClass = 'transaction-date'
    const transactionDescriptionClass = 'transaction-description'
    const transactionAmountClass = 'transaction-amount'
    const transactionCategoryClass = 'transaction-category'

    
    
    const element = document.createElement('div')
    element.className = transactionRowClass
    element.innerHTML = `
        
            <div class="${transactionDateClass}">${iso8601dateToInputValue(date)}</div>
            <div class="${transactionAmountClass}">${amount}</div>
            <div class="${transactionDescriptionClass}">${description}</div>
            <div class="${transactionCategoryClass}">${category}</div>

    `

    return element
}


const makeDeleteable = function(budgetRow: HTMLElement) {
    // should check if deleteable already in classname (when disabling childnodes of a category row, that can be checked already)
    if (!budgetRow.className.includes('deleteable')) {
        budgetRow.className += ' deleteable'
    }

    // disable amount and name input field
    Array.from(budgetRow.querySelectorAll('input.category-amount')).forEach(input => {input.disabled = true})
    Array.from(budgetRow.querySelectorAll('input.category-name')).forEach(input => {input.disabled = true})

    // check off delete checkbox if not already checked (if "makeDeleteable" is initialized by a parent node)
    budgetRow.querySelector('input[type=checkbox]').checked = true;
}

const unmakeDeleteable = function(budgetRow: HTMLElement) {
    budgetRow.className = budgetRow.className.replace(' deleteable', '')

    // enable amount and name input field
    Array.from(budgetRow.querySelectorAll('input.category-amount')).forEach(input => {input.disabled = false})
    Array.from(budgetRow.querySelectorAll('input.category-name')).forEach(input => {input.disabled = false})
}
