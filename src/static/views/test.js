
console.log('script loaded')


const createRowElement = function() {
    let newRow = document.createElement('div');
    newRow.className = 'row';
    
    let newDate = document.createElement('div');
    newDate.className = 'date';
    let date = new Date();
    let month = date.getMonth().toString().length == 1 ? "0" + date.getMonth() : date.getMonth();
    let day = date.getDay().toString().length == 1 ? "0" + date.getDay() : date.getDay();
    newDate.innerText = date.getFullYear() + "-" + month + "-" + day;
    newRow.appendChild(newDate);

    let newAmount = document.createElement('div');
    newAmount.className = 'amount';
    newAmount.innerHTML = "0";
    newRow.appendChild(newAmount);

    let newDescription = document.createElement('div');
    newDescription.className = 'description';
    newDescription.innerHTML = 'Please add some description';
    newRow.appendChild(newDescription);

    let newCategory = document.createElement('div');
    newCategory.className = 'category';
    newCategory.innerHTML = 'No cat yet';
    newRow.appendChild(newCategory);

    return newRow;
}

const addRowHandler = function(event) {
    let newRow = createRowElement();
    newRow.addEventListener('click', editRow);

    let rows = document.getElementsByClassName('rows')[0];
    rows.insertBefore(newRow, rows.children[0]);
}


const editRow = function(event) {
    /*
    if (event.target.className == 'save-button') {
        // for some reason, editRow gets added as eventListener to
        // save button, and cannot get it removed for now.
        // For now, until better solution, we check if
        // the target (the element actually clicked) is
        // is save-button, and skip the functionality.
        return
    }

    if (event.currentTarget.id == 'editable') {
        // only applies if row is not already editable
        // better solution though is to remove eventlisteners, but
        // somehow cannot get this to work right now.
        return
    }
    */
    let row = event.currentTarget;

    row.removeEventListener('click', editRow, false);
    Array.from(row.parentNode.children).map((row) => {
        if (row.id == 'editable') {
            row.removeAttribute('id');
            saveRow(row);
        }
    })
    row.id = 'editable';


    let date = row.children[0].textContent;
    let amount = row.children[1].textContent;
    let description = row.children[2].textContent;
    let category = row.children[3].textContent;

    // Make date editable
    let inputNewDate = document.createElement('input')
    inputNewDate.type = 'date'
    inputNewDate.className = 'date'
    let year = new Date(date).getFullYear().toString()
    let month = new Date(date).getMonth().toString()
    let day = new Date(date).getDay().toString()

    console.log(year)


    
    // parse old date and set as value
    //let [ year, month, day ] = date.split('-');
    day = day.length == 1 ? "0" + day : day;
    month = month.length == 1 ? "0" + month : month; 
    
    let parsedDate = year + "-" + month + "-" + day;
    console.log(parsedDate)
    inputNewDate.value = parsedDate;
    
    row.replaceChild(inputNewDate, row.children[0]);


    // Make Amount editable
    let inputNewAmount = document.createElement('input');
    inputNewAmount.type = 'text';
    inputNewAmount.className = 'amount';

    // insert old value as value
    inputNewAmount.value = amount;

    row.replaceChild(inputNewAmount, row.children[1]);

    // Make Description editable
    let inputNewDescription = document.createElement('input');
    inputNewDescription.type = 'text';
    inputNewDescription.className = 'description';

    // insert old value as value
    inputNewDescription.value = description;

    row.replaceChild(inputNewDescription, row.children[2]);

    // Make Category editable
    let inputNewCategory = document.createElement('select');
    let select_1 = document.createElement('option')
    let select_2 = document.createElement('option')
    select_1.value = 'test';
    select_1.innerHTML = 'test';
    select_2.value = 'fest';
    select_2.innerHTML = 'fest';
    inputNewCategory.appendChild(
        select_1
    );
    inputNewCategory.appendChild(
        select_2
    );
    
    inputNewCategory.className = 'category';

    // insert old value as value

    row.replaceChild(inputNewCategory, row.children[3]);
    
    // Add delete button
    let deleteButton = document.createElement('button');
    deleteButton.innerText='X';
    deleteButton.className='delete-button';
    row.appendChild(deleteButton);

    

    deleteButton.addEventListener('click', removeParentOfDeleteButton)

    // Add save button
    let saveButton = document.createElement('button');
    saveButton.innerText='SAVE';
    saveButton.className='save-button'
    row.appendChild(saveButton);

    saveButton.addEventListener('click', saveRowHandler);
    

    
    
    
}

const removeParentOfDeleteButton = function() {
    let parentRow = this.parentNode
    parentRow.parentNode.removeChild(parentRow);

    // should also deleted data from db


}

const saveRow = (row) => {
    row.removeAttribute('id');

    // get values
    let date = row.children[0].value;
    
    let amount = row.children[1].value;
    let description = row.children[2].value;
    let category = row.children[3].value;

    // Save Date
    let inputNewDate = document.createElement('div');
    inputNewDate.className = 'date';

    // insert inputvalue as value for date
    inputNewDate.innerHTML = date;
    row.replaceChild(inputNewDate, row.children[0]);

    // Save Amount
    let inputNewAmount = document.createElement('div');
    inputNewAmount.className = 'amount';

    // insert inputvalue as value for amount
    inputNewAmount.innerHTML = amount;
    row.replaceChild(inputNewAmount, row.children[1]);

    // Save Description
    let inputNewDescription = document.createElement('div');
    inputNewDescription.className = 'description';

    // insert inputvalue as value for description
    inputNewDescription.innerHTML = description;
    row.replaceChild(inputNewDescription, row.children[2]);

    // Save Category
    let inputNewCategory = document.createElement('div');
    inputNewCategory.className = 'category';
    inputNewCategory.innerHTML = category;

    // insert inputvalue as value for amount
    inputNewDescription.innerHTML = description;
    row.replaceChild(inputNewCategory, row.children[3]);
    




    // remove save and delete button
    let deleteButton = row.children[4];
    let saveButton = row.children[5];

    row.removeChild(deleteButton);
    row.removeChild(saveButton);

    // add edit eventlistener
    row.addEventListener('click', editRow);
}

const saveRowHandler = function(event) {
    event.stopPropagation();
    let row = event.currentTarget.parentNode;
    saveRow(row);


    // WRITE TO DB

    // use promise; when succesfull write, line should temporarily blink green.


}

document.addEventListener('keydown', (event) => {
    let editableRow = document.getElementById('editable');
    
    if (event.key == 'Enter' && editableRow) {
        saveRow(editableRow);
    }

    return

    
})

// add eventlisteners to all rows

let rows = document.getElementsByClassName('row');


for (let row of rows) {
    row.addEventListener('click', editRow)
}


document.getElementById('add-trans-button').addEventListener('click', addRowHandler)
