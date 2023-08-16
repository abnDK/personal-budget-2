
console.log('script loaded')

//const { createHTMLElement } = require('./htmlTools')


/**
 * EVENTS:
 * 
 * Edit budget rows
 *  [x] make all rows editable
 *  [ ] set row for deletion (mark it and when saved, it disappears. When marked it is greyed out.)
 * 
 * Save budget rows
 *  [x] calculate sum
 *  [x] parent sum = children sum = grandchildren sum
 *  [ ] save to db
 * 
 * 
 * populate budget
 *  [x] done
 * 
 * 
 * 
 * 
 */

const getCategoriesAsTree = function() {
    return fetch(
        'http://localhost:3000/categories'
    ).then((res) => {
        if (!res.ok) {
            throw new Error(res.status)
        }
        return res.text()
    }).then((res) => {
            return BuildTree(JSON.parse(res), 'parent_id');
        }
    ).catch(
        (err) => {
            throw new Error(err);
        })
}


// CREATE BUDGET ROWS
const createBudgetRow = function(budgetObject, level) {
    /**
     * budgetObject: {data}
     * level: Number // indicating parent/child/grandchild. 0 = parent, 1 = child, 2 = grandchild
     */

    // create budget row element with name and amount children
    
    let budgetRowElement = createHTMLElement('div', 'budget-row', '', children = [
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

// POPULATE BUDGET ROWS
document.addEventListener('DOMContentLoaded', () => {
    let budgetRows = document.querySelector('.budget-rows');

    
    
    // fetch data
    getCategoriesAsTree().then((categories) => {

        
        // filter categories by budget_id
        // by grapping last :id part of url (after "/" in .../budgets/show/:id)
        const budget_id = parseInt(window.location.href.split("/").at(-1));
        categories = categories.filter((cat) => cat.budget_id == budget_id)


        for (let category of categories) {
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
    }
        
    )


})


// POPULATE TRANSACTIONS (WITH PLACEHOLDER DATA)
document.addEventListener('DOMContentLoaded', () => {
    let rows = document.querySelector('.transaction-rows');
    const ROWS_AMOUNT = 100;

    for (let i = 0; i < ROWS_AMOUNT; i++) {
        console.log('adding row')
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
        amount.innerText = Math.round(Math.random() * 350)

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

        rows.appendChild(row);

    }
})

// Eventlistener on budget sum, calculating sum of all budget rows
document.querySelector('.budget-sum').addEventListener('budgetUpdate', (event) => {
    // budget sum is calculated as parent = sum(children) = sum(grandchildren)
    // values in children and parents are updated as sum of their child
    // and will be set before the row is saved to db
    

    // calculating sum of all .category-child elements
    let grandChildren = Array.from(document.querySelectorAll('.category-grandchild'))
    let uniqueParentIdOfGrandChildren = new Set(grandChildren.map((grandChild) => grandChild.dataset.parent_id));

    let sumsOfChildElements = {};

    for (const uniqueParentId of uniqueParentIdOfGrandChildren) {
        sumsOfChildElements[uniqueParentId] = (() => {
            return grandChildren.map((grandChild) => {
                if (grandChild.dataset.parent_id === uniqueParentId) {
                    return parseInt(grandChild.querySelector('.category-amount').innerText)
                }
                return 0
            }).reduce((a, b) => a+b)
        })();
    }

    // set sum of all child-elements (sum of grandchildren)
    
    // update all child elements with sum of their (grand-)children

    let children = Array.from(document.querySelectorAll('.category-child'))
    
    for (const child of children) {
        child.querySelector('.category-amount').innerText = sumsOfChildElements[child.dataset.id];
    }
    
    // calculating sum of all .category-parent elements

    let uniqueParentIdOfChildren = new Set(children.map((child) => child.dataset.parent_id));

    let sumsOfParentElements = {};

    for (const uniqueParentId of uniqueParentIdOfChildren) {
        sumsOfParentElements[uniqueParentId] = (() => {
            return children.map((child) => {
                if (child.dataset.parent_id === uniqueParentId) {
                    return parseInt(child.querySelector('.category-amount').innerText)
                }
                return 0
            }).reduce((a, b) => a+b)
        })();
    }
    console.log(sumsOfChildElements)
    console.log(sumsOfParentElements)

    // update all parent elements with sum of their children and calc sum of all parents
    let parents = Array.from(document.querySelectorAll('.category-parent'));

    let totalSum = 0;

    for (const parent of parents) {
        let parentSum = sumsOfParentElements[parent.dataset.id];
        parent.querySelector('.category-amount').innerText = parentSum;
        totalSum += parentSum;
    }

    // set sum on the budget-sum dom element
    document.querySelector('.budget-sum').innerText = `Budget sum: ${totalSum}`;
})



// toggle edit/save button
document.querySelector('.button-edit').addEventListener('click', (event) => {
    console.log('Edit button clicked')


    // toggle button between 'edit' and 'save' state
    let button = event.currentTarget

    // get all budget-rows
    let rows = document.querySelectorAll('.budget-row');


    if (button.innerText == 'Edit') {
        button.innerText ='Save'
        button.style.backgroundColor = "#ffd1e0"

        // make all rows editable if 'edit' was clicked
        for (let row of rows) {
            // set class "editable" on row
            row.className += ' editable'


            // get values of nameDiv and amountDiv
            let nameDiv = row.querySelector('.category-name');
            let amountDiv = row.querySelector('.category-amount');
            let nameValue = nameDiv.innerText;
            let amountValue = amountDiv.innerText;
            
            // create new input fields of type text
            let nameInput = document.createElement('input');
            nameInput.type = 'text';
            let amountInput = document.createElement('input');
            amountInput.type = 'text';
            
            // change div into input
            nameInput.value = nameValue;
            amountInput.value = amountValue;
            nameInput.className = nameDiv.className;
            amountInput.className = amountDiv.className;

            row.replaceChild(nameInput, nameDiv);
            row.replaceChild(amountInput, amountDiv);

        }
    } else {
        button.innerText = 'Edit'
        button.style.backgroundColor = "#FFD182"

        // freeze all rows if 'save' was clicked
        for (let row of rows) {
            // remove class "editable" on row
            row.className = row.className.replace(' editable', '')


            // get values of nameDiv and amountDiv
            let nameInput = row.querySelector('.category-name');
            let amountInput = row.querySelector('.category-amount');
            let nameValue = nameInput.value;
            let amountValue = amountInput.value;
            
            // create new div
            let nameDiv = document.createElement('div');
            let amountDiv = document.createElement('div');
            
            // change div into input
            nameDiv.innerText = nameValue;
            amountDiv.innerText = amountValue;
            nameDiv.className = nameInput.className;
            amountDiv.className = amountInput.className;

            row.replaceChild(nameDiv, nameInput);
            row.replaceChild(amountDiv, amountInput);


        }

        // after clicking save, we send event to budget sum for calculating the sum of all parent nodes.
        document.querySelector('.budget-sum').dispatchEvent(new Event('budgetUpdate'));

    }




})

