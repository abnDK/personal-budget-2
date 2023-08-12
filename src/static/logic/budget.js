
console.log('script loaded')

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
    console.log('calculating sum....')
    let budgetRows = document.querySelectorAll('.budget-row.category-parent');
    let sum = 0;
    for (let budgetRow of budgetRows) {
        sum += parseInt(budgetRow.querySelector('.category-amount').innerText)
    }

    // set sum on the budget-sum dom element
    console.log(this.currentTarget);
    document.querySelector('.budget-sum').innerText = `Budget sum: ${sum}`;
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


/**
 * .transaction-row
                    .transaction-date="04/07/2017"
                    .transaction-amount="5000"
                    .transaction-description="Last post"
                    .transaction-category="Diverse"
 */