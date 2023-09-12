


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


let BUDGET: Budget;



// POPULATE BUDGET WITH CATEGORY ROWS
document.addEventListener('DOMContentLoaded', async () => {
    

    
    
    let budgetRowsDomElement: Element | null = document.querySelector('.budget-rows');
    
    if (budgetRowsDomElement == null) {
        throw new Error('Could not find budget rows element')
    }

    
    let categories = await getCategories();
    console.log(categories)
    if (categories == undefined) {
        throw new Error('Categories returned undefined!')
    }

    const budget_id = parseInt(window.location.href.split("/").at(-1));

    const filteredCategories = categories.filter(cat => cat.budget_id === budget_id)//.filter(cat => cat.name != 'root');
    console.log("filtered cats: ", filteredCategories)
    
    BUDGET = new Budget(filteredCategories, budgetRowsDomElement);
    
    
    /* 
    console.log('###', BUDGET)

    for (let row of BUDGET.rows) {
        budgetRowsRoot.appendChild(row.element)
    }
     */
    


})
    
const toggle = (): void => {
    BUDGET.editable = !BUDGET.editable;
}

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


// TOGGLE EDIT / SAVE
document.querySelector('.button-edit').addEventListener('click', async (event) => {


    // toggle button between 'edit' and 'save' state
    let button = event.currentTarget

    if (button.innerText == 'Edit') {
        button.innerText ='Save'
        button.style.backgroundColor = "#ffd1e0"

        // make all rows editable if 'edit' was clicked
        BUDGET.editable = true;
            

        
    } else {
        button.innerText = 'Edit'
        button.style.backgroundColor = "#FFD182"

        
        BUDGET.editable = false;


        // DELETE CATEGORIES IN DB
        const idsToDelete = BUDGET.toDelete.toSorted((a, b) => a.level - b.level).reverse().map(row => row.id)
        console.log('now deleting the following ids: ', idsToDelete)
        return
        const deletedCategories = await deleteCategories(idsToDelete);

        console.log('these cats just been returned as deletedL: ', deletedCategories)

        for (const deletedCategory of deletedCategories) {
            // Takes the parent_id of deletedCategories and write it to the children of a 
            // deletedCategory. This will i.e. mean that if a child node is deleted,
            // the grandchild will have the parent node as it's parent. (in a root->parent->child->grandchild tree)
            
            // IMPORTANT:
            // make sure this also is sorted from grandchild level to parent level
            // so rows getting new parent_id's if their parent_id category was deleted
            // can be elevated from bottom to top of tree, if a chain of categories
            // was deleted.

            const orphanedCategories = BUDGET.rowsByParentId(deletedCategory.id);

            if (orphanedCategories.length) {

                for (const orphan of orphanedCategories) {

                    orphan.parent_id = deletedCategory.parent_id

                }

            }

        }
        
        BUDGET.removeDeletable();
        // when this returns - we need to update parents ids before we do calcSums. Else it will look
        // for parent_id that has been deleted in the above when deleting a row, that is not grandchild or nor loner.

        
        // GET DATA FROM DOM ELEMENTS TO OBJECT
        BUDGET.syncFromDomElementToObject()

        // CALC SUMS (but don't write them)
        BUDGET.calcSums(); // ERROR LIES HERE SOME WHERE. DO WE TEMPORARILY STORE CATORIES IN DB WIHT NULL PARENT_ID AND BUDGET ID - IT SHOULD JUST USE OLD VALUE THEN..

        
        // UPDATE CATEGORIES IN DB (and get updated parent_ids)
        BUDGET.syncDB()

        // after getting parent ids back, run through category rows and update parent_id (and maybe level???)

        // RENDER FROZEN AGAIN
        
        BUDGET.editable = !BUDGET.editable;

    }




})

// MARK DELETE

// ADD NEW CATEGORY ROW















// /* TO BE DELETED

const makeCategoryTreeFromBudget = () => {
    throw new Error('Should not use any more - tree will never be built from DOM element - only from API call')

    /**
     * Returns a tree structure
     * from the budgetview, when
     * it is toggled into 'edit-mode'
     */
    const categoryRows = new Budget();

    const budgetRows = document.querySelectorAll('.budget-row')
    
    for (const row of budgetRows) {
        
        let rowLevel;

        if (row.className.includes('parent')) {
            rowLevel = 0;
        } else if (row.className.includes('grandchild')) {
            rowLevel = 2;
        } else {
            rowLevel = 1;
        }

        const catRow: CategoryRow = {
            id: row.dataset.id,
            name: row.querySelector('input.category-name')?.value,
            level: rowLevel,
            amount: parseInt(row.querySelector('input.category-amount')?.value),
            parent_id: row.dataset.parent_id,
            to_be_deleted: row.dataset.to_be_deleted == 'true' ? true : false,
            element: row
        }
        categoryRows.addRow(catRow);
    }

    return categoryRows
}





// UPDATE BUDGET SUM AND ALL PARTSUMS OF CHILDREN AND PARENT CATEGORIES
const updateBudgetSums = function() {
    throw new Error('we shouldn"t use this anymore - updateBudgetSums')
    
    // INSTEAD OF ALL THE CODE BELOW: Use makeCategoryTreeFromBudget() - it has handy functions for calculating sums.
    
    
    
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
    // document.querySelector('.budget-sum').dispatchEvent(new Event('budgetUpdateDone'));
}







const deleteCheckboxChange = function(event) {
    throw new Error('is this used - deprecated deleteCheckboxChange')
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
 