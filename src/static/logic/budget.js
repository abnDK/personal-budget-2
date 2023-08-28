


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

            let parent = createBudgetRow(category, 0)
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
})

// POPULATE TRANSACTIONS (WITH PLACEHOLDER DATA)


const populateTransactions = async () => {
    let rows = document.querySelector('.transaction-rows');

    let res = await fetch('http://localhost:3000/transactions')
    let transactions = Array.from(await res.json())

    for (let trans of transactions) {
        const row = createTransactionRow(trans.name, trans.amount, trans.date, trans.category_id);

        rows.appendChild(row);
    }
    return 

    const ROWS_AMOUNT = 100;

    for (let i = 0; i < ROWS_AMOUNT; i++) {
        const row = createTransactionRow();
        console.log(row)
        console.log(typeof row)
        rows.appendChild(row);

    }
}


document.addEventListener('DOMContentLoaded', populateTransactions)




// toggle edit/save button
document.querySelector('.button-edit').addEventListener('click', (event) => {


    // toggle button between 'edit' and 'save' state
    let button = event.currentTarget

    // get all budget-rows
    let oldRows = document.querySelectorAll('.budget-row');


    if (button.innerText == 'Edit') {
        button.innerText ='Save'
        button.style.backgroundColor = "#ffd1e0"

        // make all rows editable if 'edit' was clicked
        for (let oldRow of oldRows) {


            // read values of oldRow
            const rowTag = oldRow.tagName;
            
            const rowClassName = oldRow.className;
            const oldNameElement = oldRow.querySelector('.category-name')
            const oldAmountElement = oldRow.querySelector('.category-amount')
            const rowName = oldNameElement.innerText;
            const rowAmount = oldAmountElement.innerText;
            const rowId = oldRow.dataset.id;
            const parentId = oldRow.dataset.parent_id

            // create newRow element
            let newRowElement = createHTMLElement(rowTag, rowClassName + ' editable');
            let newNameElement = createHTMLElement('input', oldNameElement.className);
            newNameElement.type = 'text';
            let newAmountElement = createHTMLElement('input', oldAmountElement.className);
            newAmountElement.type = 'number';
            
            // create delete div with <input> and <label> element
            let newDeleteElement = createHTMLElement('div', 'category-delete');
            
            let newDeleteInput = createHTMLElement('input');
            newDeleteInput.type = 'checkbox'
            newDeleteInput.id = 'delete_' + rowId;
            newDeleteInput.addEventListener('change', deleteCheckboxChange)
            
            let newDeleteLabel = createHTMLElement('label', false, innerText='Delete');
            newDeleteLabel.htmlFor = newDeleteInput.id;
            
            newDeleteElement.appendChild(newDeleteInput);
            newDeleteElement.appendChild(newDeleteLabel);

            // insert data in newRow
            newNameElement.value = rowName
            newAmountElement.value = rowAmount
            newRowElement.dataset.id = rowId;
            newRowElement.dataset.parent_id = parentId;


            // append children to newRow
            newRowElement.appendChild(newNameElement);
            newRowElement.appendChild(newDeleteElement);
            newRowElement.appendChild(newAmountElement);

            // replace oldRow with newRow
            oldRow.parentElement.replaceChild(newRowElement, oldRow)

            

        }
    } else {
        button.innerText = 'Edit'
        button.style.backgroundColor = "#FFD182"

        // freeze all rows if 'save' was clicked
        for (let oldRow of oldRows) {
            // remove class "editable" on row
            oldRow.className = oldRow.className.replace(' editable', '')


            // get values of nameDiv and amountDiv
            let nameInput = oldRow.querySelector('.category-name');
            let amountInput = oldRow.querySelector('.category-amount');

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

            

            oldRow.replaceChild(nameDiv, nameInput);     
            oldRow.replaceChild(amountDiv, amountInput);

            // if delete checkbox is checked, set data-delete = true
            const toBeDeleted = oldRow.querySelector('.category-delete').querySelector('input').checked
            if (toBeDeleted) {
                oldRow.dataset.to_be_deleted = 'true';
            }

            // remove delete checkbox
            oldRow.removeChild(oldRow.querySelector('.category-delete'));



        }

        // after clicking save, we send event to budget sum for calculating the sum of all parent nodes.
        document.querySelector('.budget-sum').dispatchEvent(new Event('updateDatabaseStart'));

    }




})

// SAVE ALL BUDGET ROWS TO BUDGET
document.querySelector('.budget-sum').addEventListener('updateDatabaseStart', (event) => {
    /**
     * When saving all budget rows, the following steps apply:
     * - all rows marked with "to_be_deleted" are deleted from database
     * --- get all dom elements, and filter tokeep/to_be_deleted
     * --- order to delete rows, so grandchildren are deleted before children, and lastly parents (foreign key constraint)
     * --- delete categories by id
     * --- delete category dom elements
     * - all other rows are saved to db
     */



    // get all rows to keep and all rows to delete from the dom
    const budgetRows = Array.from(document.querySelectorAll('.budget-row'));
    const toKeepRows = []
    let toDeleteRows = []

    for (let budgetRow of budgetRows) {
        if (budgetRow.dataset.to_be_deleted === 'true') {
            toDeleteRows.push(budgetRow)
        } else {
            toKeepRows.push(budgetRow)
        }
    }



    // in order not to violate foreign_key constraints in db, we need to delete categories
    // in the order of: grandchildren, children, parents. Thus we now sort it by classname
    const toDeleteParents = toDeleteRows.filter(row => row.className.includes('category-parent'))
    const toDeleteChildren = toDeleteRows.filter(row => row.className.includes('category-child'))
    const toDeleteGrandchildren = toDeleteRows.filter(row => row.className.includes('category-grandchild'))
    toDeleteRows = [...toDeleteGrandchildren, ...toDeleteChildren, ...toDeleteParents]
    const toDeleteIds = toDeleteRows.map(row => row.dataset.id)


    deleteCategories(toDeleteIds).then((deletedCategories) => {
        

        const idsOfDeletedCategories = deletedCategories.map(cat => cat.id) 

        
        
        
        // after category is deleted in db, budget-row is deleted in DOM
        
        return Promise.all(
            toDeleteRows.map((toDeleteRow) => {
                if (idsOfDeletedCategories.includes(parseInt(toDeleteRow.dataset.id))) {
                    return deleteBudgetRow(toDeleteRow)
                } else {
                    throw new Error('row could not be deleted')

                }
            })
        )

        /*
        console.log("before deleting rows - what happens????")
        for (const toDeleteRow of toDeleteRows) {
            console.log("blblab delete this row now: ", toDeleteRow) // WHY DONT WE REACH THIS???
            console.log(idsOfDeletedCategories, toDeleteRow.dataset)
            if (idsOfDeletedCategories.includes(toDeleteRow.dataset.id)) {deleteBudgetRow(toDeleteRow)} else {throw new Error('asdioj');}
            
            
        }
        return*/
        
    })
    .then(() => {
        // after rows to be deleted has been removed from dom, we update sums of remaing budget rows

        updateBudgetSums();

        // and then we write budget-rows with updated sums to db

        for (const budgetRow of toKeepRows) {
            const id = budgetRow.dataset.id;
            const name = budgetRow.querySelector('.category-name').innerText;
            const amount = parseInt(budgetRow.querySelector('.category-amount').innerText);
            const parent_id = budgetRow.dataset.parent_id;
            const budget_id = parseInt(window.location.href.split("/").at(-1));
            
            let updatedCategoryObject = {
                "name": name,
                "amount": amount,
                "parent_id": parent_id,
                "budget_id": budget_id
            }
    
            
    
            updateCategory(updatedCategoryObject, id).then((res) => {
                if (res.ok) {
                    console.log(res)
                }
            }).catch((err)=> {
                throw new Error(err)
            })


        }

        // re-render transactions
        transactionRows = Array.from(document.querySelectorAll('transaction-row'))
        for (let trans of transactionRows) {
            deleteBudgetRow(trans);
        }
        populateTransactions()

    }).catch((err) => {throw new Error(err)})

})



// TOGGLING CATEGORY ROW TO BE DELETED
const deleteCheckboxChange = function(event) {

    const parentRow = event.currentTarget.parentElement.parentElement;

    if (!event.currentTarget.checked) {
        unmakeDeleteable(event.currentTarget.parentElement.parentElement)

    } else {
        makeDeleteable(event.currentTarget.parentElement.parentElement)
        if (event.currentTarget.parentElement.parentElement.className.includes('category-parent') || event.currentTarget.parentElement.parentElement.className.includes('category-child')) {
            
            
            let toBeDeletedRows = new Array();
            const childrenOfCurrentTargetRow = Array.from(document.querySelectorAll('.budget-row')).filter(row => row.dataset.parent_id === parentRow.dataset.id);
            if (childrenOfCurrentTargetRow) {
                // add row to be deleted rows
                //toBeDeletedRows.push(child)

                toBeDeletedRows = [...toBeDeletedRows, ...childrenOfCurrentTargetRow]
            }

            // if the eventTarget is a parent, we potentially also have grandchildren in the tree
            if (event.currentTarget.parentElement.parentElement.className.includes('category-parent')) {

                const childrenIds = childrenOfCurrentTargetRow.map(row=>row.dataset.id);
                for (let childId of childrenIds) {
                    const grandChildren = Array.from(document.querySelectorAll('.budget-row')).filter(row => row.dataset.parent_id === childId)
                    toBeDeletedRows = [...toBeDeletedRows, ...grandChildren]
                }
            }                      

            // when finished, all children should be marked as "to_be_deleted" and greyed out.
            toBeDeletedRows.map(row => makeDeleteable(row))

        }

        
    }
}


// UPDATE BUDGET SUM AND ALL PARTSUMS OF CHILDREN AND PARENT CATEGORIES
const updateBudgetSums = function() {
    // budget sum is calculated as parent = sum(children) = sum(grandchildren)
    // values in children and parents are updated as sum of their child
    // and will be set before the row is saved to db
    

    // calculating sum of all grandchild elements
    let grandChildren = Array.from(document.querySelectorAll('.category-grandchild'))
    grandChildren = grandChildren.filter(grandChild => grandChild.dataset.to_be_deleted !== 'true') // FILTER OUT ROWS TO BE DELETED
    let uniqueParentIdOfGrandChildren = new Set(grandChildren.map((grandChild) => grandChild.dataset.parent_id));
    let sumsOfGrandChildElements = {};

    for (const uniqueParentId of uniqueParentIdOfGrandChildren) {
        sumsOfGrandChildElements[uniqueParentId] = (() => {
            const grandChildWithParentId = grandChildren.filter(grandChild => grandChild.dataset.parent_id == uniqueParentId)
            const grandChildAmounts = grandChildWithParentId.map(grandChild => parseInt(grandChild.querySelector('.category-amount').innerText))
            const sum = grandChildAmounts.reduce((prevValue, currentValue) => {return prevValue + currentValue})
            return sum
        })();
    }
    
    // write sum of grandchildren to children nodes.
    // if no grandchildren, child amount is just kept as is
    let children = Array.from(document.querySelectorAll('.category-child'))
    children = children.filter(child => child.dataset.to_be_deleted !== 'true') // FILTER OUT ROWS TO BE DELETED

    for (const child of children) {
        let amountDiv = child.querySelector('.category-amount')
        amountDiv.innerText = sumsOfGrandChildElements[child.dataset.id] ? sumsOfGrandChildElements[child.dataset.id] : amountDiv.innerText;
    }
    
    // calculating sum of all child elements
    let uniqueParentIdOfChildren = new Set(children.map((child) => child.dataset.parent_id));

    let sumsOfChildElements = {};

    for (const uniqueParentId of uniqueParentIdOfChildren) {
        sumsOfChildElements[uniqueParentId] = (() => {
            const childWithParentId = children.filter(child => child.dataset.parent_id == uniqueParentId)
            const childAmounts = childWithParentId.map(child => parseInt(child.querySelector('.category-amount').innerText))
            const sum = childAmounts.reduce((prevValue, currentValue) => {return prevValue + currentValue})
            return sum
        })();
    }


    // write sum of childnodes to parent nodes.
    // if no children, parent amount is just kept as is
    // this also calculates the total sum and writes it to the budget-sum node
    let parents = Array.from(document.querySelectorAll('.category-parent'));
    parents = parents.filter(parent => parent.dataset.to_be_deleted !== 'true') // FILTER OUT ROWS TO BE DELETED

    let totalSum = 0;

    for (const parent of parents) {
        let amountDiv = parent.querySelector('.category-amount')
        let parentSum = sumsOfChildElements[parent.dataset.id];
        amountDiv.innerText = parentSum ? parentSum : amountDiv.innerText;
        totalSum += parentSum ? parentSum : parseInt(amountDiv.innerText)
    }

    // set sum on the budget-sum dom element
    document.querySelector('.budget-sum').innerText = `Budget sum: ${totalSum}`;

    // after all sums are calculated, rows can be written to db.
    document.querySelector('.budget-sum').dispatchEvent(new Event('budgetUpdateDone'));
}




