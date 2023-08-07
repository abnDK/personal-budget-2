
console.log('script loaded')

/**
 * 
 * EVENTS:
 * [1] add new transaction
 *    - click "add new trans button"
 *      - row form element is created                                                       // #B
 *      - row form added as element 0 on list of transactions                               // #C
 * [2] post new transaction
 *    - click "save" on newly added row
 *      - post request sent to db                                                           // postTransaction(data)
 *      - inserted transaction returned from db
 *    - form element is changed to regular row element with transaction data                // ??? #A
 * [] edit existing row
 *    - click anywhere on existing row                                                        
 *      - row becomes "editable"  
 *      - row form element is created                                                       // #B
 *      - row element is changed to form element with data values in input element'         // 
 * [] delete row
 *    - click "x" on editable row
 *    - delete request sent to db
 *    - row is deleted on positive status code
 * [] updating existing row
 *    - click "save" on "editable" row
 *      - put request sent to db (we need to add id)                                          // updateTransaction(data)
 *      - row FORM element => row DIV element with returned transaction from db        // #E createRowElement(transactionObject : {date, name, amount}) + insertfunction
 * [] getting page initially
 *   - get all transactions
 *   - build with createRowElement
 *   - append to list (so pug file onle as .rows div, which then is populated)
*/    

const inputValueToDate = function(datestring) {
    // takes in datestring in format "YYYY-MM-DD" and converts to Date object
    let [year, month, day] = datestring.split('-');

    // as month is zero indexed in the Date class, we subtract 1 from month'
    month = parseInt(month) - 1

    return new Date(year, month, day)
}

const dateToInputValue = function(date) {
    // takes date object and returns in format "YYYY-MM-DD" so it equals the ".value" attribute format of date input elements
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    // as month on date objects are zero indexed, we need to add 1
    month += 1

    // if month and day are single digit, we need to add leading 0
    console.log(month)
    console.log(day)
    month = month.toString().padStart(2, '0');
    day = day.toString().padStart(2, '0');

    return `${year}-${month}-${day}`
}

const iso8601dateToInputValue = function(isoD8601Date) {
    // input is string of type "YYYY-MM-DDTHH:mm:ss.SSSZ" ie. 1989-01-24T04:35:39.348Z
    // returns "YYYY-MM-DD"
    let date = new Date(isoD8601Date);
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    // as month on date objects are zero indexed, we need to add 1
    month += 1

    // if month and day are single digit, we need to add leading 0

    month = month.toString().padStart(2, '0');
    day = day.toString().padStart(2, '0');

    return `${year}-${month}-${day}`
}


const replaceElement = function(newElement, oldElement) {
    console.log('replacing element');
    console.log('New: ');
    console.log(newElement);
    console.log('Old: ');
    console.log(oldElement);

    oldElement.parentNode.replaceChild(newElement, oldElement)
}

const getCategory = function(category_id) {
    return fetch(`http://localhost:3000/categories/${category_id}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(res.status)
            }
            return res.text()
        })
        .then((res) => {
            return JSON.parse(res)
        })
        .catch((err) => {throw new Error(err)})
}

const createRowElement = function(transactionObject) {
    /**
     * transactionObject minium requirement: {id, date, amount, name, category_id}
     */
    
    let rowDiv = document.createElement('div');
    rowDiv.className = 'row';

    let idDiv = document.createElement('div');
    idDiv.className = "trans-id"
    idDiv.hidden = true;
    rowDiv.appendChild(idDiv);

    let dateDiv = document.createElement('div');
    dateDiv.className = 'date';
    rowDiv.appendChild(dateDiv);

    let amountDiv = document.createElement('div');
    amountDiv.className = 'amount';
    rowDiv.appendChild(amountDiv);

    let nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    rowDiv.appendChild(nameDiv);

    let categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    rowDiv.appendChild(categoryDiv);

    // populating with data
    if (transactionObject) {

        idDiv.dataset.id = transactionObject['id'];

        // parse date // TODO // THINK WE CAN JUST INSERT DATE AS FORMAT IS TAKEN CARE OF BEFORE THIS FUNC...
        dateDiv.innerText = iso8601dateToInputValue(transactionObject['date'])
        /*
        let date = new Date(transactionObject['date']);
        let month = date.getMonth().toString().length == 1 ? "0" + date.getMonth() : date.getMonth();
        let day = date.getDay().toString().length == 1 ? "0" + date.getDay() : date.getDay();
        dateDiv.innerText = day + "-" + month + "-" + date.getFullYear();
        */

        amountDiv.innerText = transactionObject['amount'];

        nameDiv.innerText = transactionObject['name'];

        if (transactionObject['category_id']) {
            // get category budget from category id
            getCategory(transactionObject['category_id'])
                .then((category) => {
                    categoryDiv.dataset.id = category['id'];
                    categoryDiv.dataset.name = category['name'];
                    categoryDiv.innerText = category['name'];
                })
                .catch((err) => {
                    throw new Error(err)
                })
        }
        
        // if we return a populated rowDiv, it is when we save a row/initial population of transaction
        // and thus we can add the eventlistener for toggleEditRow inside this if block
        rowDiv.addEventListener('click', toggleEditRow);
    }



    return rowDiv

}


const createRowFormElement = function() {
    /**
     * Function does not create real form,
     * but a div element the resembles a
     * form. When clicking submit button
     * a fetch post request is sent, instead
     * of regular form action.
     */


    // CREATE REGULAR ROW DIV ELEMENT
    let rowDiv = createRowElement()

    // INSERT INPUT FIELDS IN DIV FIELDS

    // DATE
    let dateInput = document.createElement('input');
    dateInput.name = 'date';
    dateInput.type = 'date';
    dateInput.placeholder = new Date();
    dateInput.required = true;

    rowDiv.querySelector('.date').appendChild(dateInput);


    // AMOUNT
    let amountInput = document.createElement('input');
    amountInput.name = 'amount';
    amountInput.type = 'number';
    amountInput.placeholder = "0";
    amountInput.required = true;
    
    rowDiv.querySelector('.amount').appendChild(amountInput);


    // NAME
    let nameInput = document.createElement('input');
    nameInput.name = 'name'
    nameInput.type = 'text';
    nameInput.placeholder = "Please add a name";
    nameInput.required = true;

    rowDiv.querySelector('.name').appendChild(nameInput);
    
    // SUBMIT
    let submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Save';
    submitButton.addEventListener('click', saveTransactionHandler);
    
    let submitDiv = document.createElement('div');
    submitDiv.className = 'submit';
    submitDiv.appendChild(submitButton);
    rowDiv.appendChild(submitDiv);

    // CATEGORY
    // TODO UPDATE WITH FETCH GET REQ
    let categorySelect = document.createElement('select');
    categorySelect.name = 'category';
    categorySelect.required = true;

    const categories = fetch(
        'http://localhost:3000/categories', {
            method: 'GET'
        })

    return categories
        .then(
            (res) => {
                if (!res.ok) {
                    throw new Error(res.status)
                }
                return res.json()
            })   
        .then(
            (categories) => {
                for (let category of categories) {
                    let categoryOption = document.createElement('option');
                    categoryOption.value = category.id;
                    categoryOption.text = category.name;
                    categoryOption.dataset.parentId = category.parent_id;
                    categorySelect.add(categoryOption);
                }  
                
                rowDiv.querySelector('.category').appendChild(categorySelect);

    

                return rowDiv;
            })
        .catch(
            (err) => {
                console.log(err)
            })
    
    
}

const addRowHandler = function(event) {
    
    createRowFormElement()
        .then((newFormRow) => {

            let rows = document.querySelector('.rows');
            rows.insertBefore(newFormRow, rows.children[0]);

            newFormRow.querySelector('.date').children[0].focus() // set focus on newly added "Add transaction" element
            
        })

}

const testPostRequest = {
    name: 'fetch-test-data',
    amount: 999,
    date: new Date(),
    category_id: 1,
    recipient: '3test-rec',
    comment: "this is a test made with fetch API"
}

const updateTransaction = function(data) {
    return fetch(`http://localhost:3000/transactions/${data['id']}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then((res)=>{
        if (!res.ok) {
            throw new Error(res.status)
        }
        return res.json()
    })
    .catch((err)=> {throw new Error(err)}) 
}

const postTransaction = function(data) {
    return fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then((res)=>{
        if (!res.ok) {
            throw new Error(res.status)
        }
        return res.json()
    })
    .catch((err)=> {throw new Error(err)})
}

const saveTransactionHandler = function(event) {
    // prevent form from redirecting/refreshing page
    event.preventDefault(); // might be ommitable as we dont use form tag anymore - only fetch onclick

    // extract data
    let row = event.currentTarget.parentNode.parentNode;
    const dataRequest = {
        "date": row.querySelector('.date').children[0].value ? new Date(row.querySelector('.date').children[0].value) : new Date(), // if no or invalid date, date will be set to today
        "amount": parseInt(row.querySelector('.amount').children[0].value),
        "name": row.querySelector('.name').children[0].value,
        "category_id": parseInt(row.querySelector('.category').children[0].value),
        "recipient": "<placeholder_recipient>",
        "comment": "<placeholder_comment>",
        "id": row.querySelector('.trans-id') ? parseInt(row.querySelector('.trans-id').dataset.id) : undefined

    }
    console.log(dataRequest)
    const transactionObject = {
        "id": undefined,
        "date": undefined,
        "amount": undefined,
        "name": undefined,
        "category": {
            "id": "",
            "name": ""
        }
    }

    // put or post requesting transaction
    // write inserted transaction to page
    if (dataRequest['id']) {
        console.log('putting transaction...');
        updateTransaction(dataRequest)
            .then((res) => {

                transactionObject['id'] = res['id'];
                transactionObject['date'] = iso8601dateToInputValue(res['date']);
                transactionObject['amount'] = res['amount'];
                transactionObject['name'] = res['name'];
                transactionObject['category_id'] = res['category_id']
                replaceElement(createRowElement(transactionObject), row)
            })
            .catch((err) => {throw new Error(err)});
    } else {
        console.log('posting transaction...')
        postTransaction(dataRequest)
            .then((res) => {
                transactionObject['id'] = res['id'];
                transactionObject['date'] = iso8601dateToInputValue(res['date']);
                transactionObject['amount'] = res['amount'];
                transactionObject['name'] = res['name'];
                transactionObject['category_id'] = res['category_id']

                replaceElement(createRowElement(transactionObject), row)
            })
            .catch((err) => {throw new Error(err)});
    }

}

// EDIT ROW
const toggleEditRow = function(event) {
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

    // when already editable, it should not be possible to toggle again
    row.removeEventListener('click', toggleEditRow, false);

    // only 1 row can be editable at the time
    Array.from(row.parentNode.children).map((childRow) => {
        if (childRow.id == 'editable') {
            childRow.removeAttribute('id');
            childRow.querySelector('.submit').click();
        }
    })

    // add editable class for css changing the styling of the row
    row.id = 'editable';

    


    // prepare data for populating rowForm element
    let id = row.querySelector('.trans-id').dataset.id;
    let date = row.querySelector('.date').innerText;
    let amount = row.querySelector('.amount').innerText;
    let name = row.querySelector('.name').innerText;
    let category_id = row.querySelector('.category').dataset.id;


    
    // create rowForm element
    createRowFormElement()
        .then((rowForm) => {
            rowForm.querySelector('.trans-id').dataset.id = id;
            rowForm.querySelector('.date').children[0].value = date;
            rowForm.querySelector('.amount').children[0].value = amount;
            rowForm.querySelector('.name').children[0].value = name;

            // setting selected option
            let selectElement = rowForm.querySelector('.category').children[0]

            for (let index in selectElement.options) {
                if (category_id == selectElement.options[index].value) {
                    selectElement.selectedIndex = index;
                }
            }
        
            // replace row with editable rowForm
            replaceElement(rowForm, row)
        })

    



    // USE CREATE ROW ELEMENT
    // MAKE ELEMENT
    // POPULATE WITH DATA
    // REPLACE row

    /*




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

    // Make Name editable
    let inputNewName = document.createElement('input');
    inputNewName.type = 'text';
    inputNewName.className = 'name';

    // insert old value as value
    inputNewName.value = name;

    row.replaceChild(inputNewName, row.children[2]);

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
    
    */
    
    
    
}

const removeParentOfDeleteButton = function() {
    let parentRow = this.parentNode
    parentRow.parentNode.removeChild(parentRow);

    // should also deleted data from db


}

// todo: add POST req to "save" event
const saveRow = (row) => { // UDGÅET! DONT USE!
    // remove id attr and thus the "editable" id selector
    row.removeAttribute('id');

    // get values
    let date = row.children[0].value;
    
    let amount = row.children[1].value;
    let name = row.children[2].value;
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

    // Save Name
    let inputNewName = document.createElement('div');
    inputNewName.className = 'name';

    // insert inputvalue as value for name
    inputNewName.innerHTML = name;
    row.replaceChild(inputNewName, row.children[2]);

    // Save Category
    let inputNewCategory = document.createElement('div');
    inputNewCategory.className = 'category';
    inputNewCategory.innerHTML = category;

    // insert inputvalue as value for amount
    inputNewName.innerHTML = name;
    row.replaceChild(inputNewCategory, row.children[3]);
    




    // remove save and delete button
    let deleteButton = row.children[4];
    let saveButton = row.children[5];

    row.removeChild(deleteButton);
    row.removeChild(saveButton);

    // add edit eventlistener
    row.addEventListener('click', toggleEditRow);
}

const saveRowHandler = function(event) {
    event.stopPropagation();
    let row = event.currentTarget.parentNode;
    saveRow(row);


    // WRITE TO DB

    // use promise; when succesfull write, line should temporarily blink green.


}

//ADDING EVENT HANDLERS...
// #1 ADD NEW TRANSACTION
// click "add new trans" button (event listeners)
document.querySelector('#add-trans-button').addEventListener('click', addRowHandler)

// #? SAVE TRANSACTION (post/put)
//document.querySelector('.save-button').addEventListener('click', saveTransactionHandler)
// has to be added as handler on "save" in row form element..
// add delete button to row form element as well.,..

// POPULATE PAGE WITH TRANSACTIONS
document.addEventListener('DOMContentLoaded', (event) => {
    
    let rows = document.querySelector('.rows');
    
    
    fetch('http://localhost:3000/transactions')
        .then((res) => {
            if (!res.ok) {
                throw new Error(res.status)
            }
            return res.json()
        })
        .then((transactions) => {
            for (let transaction of transactions) {
                rows.appendChild(createRowElement(transaction))
            }
        })
        .catch((err) => {
            console.log(err);
        })
})
