

/* 

MAKE CLASS DIAGRAM BEFORE MOVING ON

*/



/****   R O W   ****/
class TransactionRow implements ITransactionRow {
    id: number;
    name: string;
    amount: number;
    date: Date;
    category_id: number | undefined;
    category_name: string | undefined;
    renderer: ITransactionRowRender;
    frozen: boolean;

    constructor(id: number, name: string, amount: number, date: Date, category_id: number | undefined, category_name: string | undefined, frozen: boolean = true, renderer?: ITransactionRowRender) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.date = date;
        this.category_id = category_id;
        this.category_name = category_name;
        
        this.renderer = renderer ?? new TransactionRowRender();
        this.frozen = frozen;

    }

    get dom_element_ref() {
        return this._dom_element_ref
    }  

    set dom_element_ref(newRef) {

        // insert new ref in dom and establish two way binding
        
        if (this.dom_element_ref) {
            // if dom element has been rendered before, replace it
            this._dom_element_ref.replaceWith(newRef)
            this._dom_element_ref = newRef

            this.bindDomElementToObject()


        } else {
            // else set it new
            this._dom_element_ref = newRef

            this.bindDomElementToObject()

        }

    }


    /* READING / WRITING DATA */
    isValid = (): boolean => {

        // name validation
        if (typeof this.name != 'string') {
            throw new TypeError('Name has be be of type string')
        }

        if (this.name.length <= 3) {
            throw new Error('Name must be of lenght 4 or more')
        }

        // amount validation
        if (typeof this.amount != 'number') {
            throw new Error('Amount must be of type number')
        }

        if (this.amount < 0) {
            throw new Error('Amount canont be a negative value')
        }

        if (Number.isNaN(this.amount)) {
            throw new Error('Amount cannot be NaN')
        }

        // date validation
        /* if (this.date instanceof Date) {
            throw new Error(`Date invalid: ${this.date}`)
        } */

        if (isNaN(this.date)) {
            throw new Error('Date is NaN: ', this.date)
        }

        if (this.date.getFullYear() < 1950 || this.date.getFullYear() > 2050) {
            throw new Error('Date error: Year should be between 1950 and 2050')
        }

        // category validation
        if (this.category_id == undefined || isNaN(this.category_id)) {
            throw new Error('Missing or invalid category id')
        }

        console.log('INPUT VALID: ', this)

        return true


    }


    /* DOM EVENTS AND ELEMENTS */

    /* 
    renderFrozen => HTMLElement
    renderEditable => HTMLElement

    syncDom: replace dom element and dom_element_ref
    kan vi gøre så ændringer i dom_elemment
    
    */


    render(): HTMLElement {

        if (this.frozen) {

            return this.renderFrozen()

        } else {

            return this.renderEditable()

        }

    }

    renderFrozen(): HTMLElement {

        this.dom_element_ref = this.renderer.frozen(this)

        this.frozen = true;

        return this.dom_element_ref

    }

    renderEditable(): HTMLElement {

        this.dom_element_ref = this.renderer.editable(this)

        this.frozen = false;

        return this.dom_element_ref

    }

    private bindDomElementToObject = (): void => {
        // BINDDOM FOR ROWS
        Object.defineProperty(
            this._dom_element_ref,
            'getObject',
            {
                value: () => this,
                writable: false
            }
                
        )

    }

    focusOnElement = (): void => {

        if (this.frozen) {

            throw 'can only focus on editable elements'

        }

        this.dom_element_ref.querySelector('.transaction-date').focus();

    }

    fetchEditableValues = (): void => {

        if (this.frozen) {
            throw 'cannot fetch values from frozen element...'
        }

        this.amount = parseInt(this.dom_element_ref.querySelector('.transaction-amount')?.value);
        
        // date is selected only by the day of month, and month + year is preserved
        const day = this.dom_element_ref.querySelector('.transaction-date')?.value
        
        this.date = new Date(new Date(this.date).getFullYear(), new Date(this.date).getMonth(), day);
        
        
        
        this.category_id = parseInt(this.dom_element_ref.querySelector('.transaction-category')?.value);
        this.category_name = this.dom_element_ref.querySelector('.transaction-category')?.selectedOptions[0].innerText?.split('- ')[1] ?? this.dom_element_ref.querySelector('.transaction-category')?.selectedOptions[0].innerText;
        this.name = this.dom_element_ref.querySelector('.transaction-description')?.value;



    }

}

class TransactionRowRender implements ITransactionRowRender {

    frozen(row: ITransactionRow): HTMLElement {
        `
        Target element:

        
        <div class="transaction-row">
            <div class="transaction-date">1999-03-01</div>
            <div class="transaction-amount">199</div>
            <div class="transaction-description">Jyllinge - Sdr. Omme</div>
            <div class="transaction-category">3</div>
            edit button
        </div>
        
        `

        // input comes either from db or from dateselector in ui
        // return from db: 2000-01-14T23:00:00.000Z (when input to new Date(...) it corrects to 2000-01-15)
        // return from ui: 1999-01-01 (when input to new Date(...) it will return 1999-01-01 - 01:00 - but still ok as date is the same)
        // what happens when YYYY-MM-DD 01:00 gets inserted to db?

        const dateRowChild = createHTMLElement('div', 'transaction-date', new Date(row.date).getDate().toString().padStart(2, '0'))
        
        const amountRowChild = createHTMLElement('div', 'transaction-amount', String(row.amount))
        const descriptionRowChild = createHTMLElement('div', 'transaction-description', row.name)
        const categoryRowChild = createHTMLElement('div', 'transaction-category', row.category_name)
        const editRowChild = createHTMLElement('div', 'transaction-edit bi bi-pencil')

        const transactionRow = createHTMLElement(
            'div', 
            'transaction-row',
            undefined,
            [
                dateRowChild,
                amountRowChild,
                descriptionRowChild,
                categoryRowChild,
                editRowChild
            ]
        )

        // add eventhandlers for click on edit button

        transactionRow.addEventListener('click', (e) => {
            console.log('you clicked: ', e.target)
            console.log(e.target.classList[0])
            console.log('the event has been attached to: ', e.currentTarget)

            if (e.target.classList[0] === 'transaction-edit') {

                e.currentTarget.getObject().renderEditable();

            }

        })


        return transactionRow

    }

    editable(row: TransactionRow): HTMLElement {
        `
        Target element:

        
        <div class="transaction-row">
            <input name="date" type="date" placeholder="new Date()" required="">
            <input name="amount" type="number" placeholder="0" required="">
            <input name="name" type="text" placeholder="Please add a name" required="">
            <select name="category" required="">
                <option value="1" data-parent-id="4">updated_expense_test</option><option value="2" data-parent-id="null">test_b</option><option value="3" data-parent-id="null">root</option><option value="4" data-parent-id="null">Bilka</option><option value="5" data-parent-id="null">Vand</option><option value="6" data-parent-id="null">Varme</option><option value="7" data-parent-id="null">Forsikring</option><option value="81" data-parent-id="3">Investering</option><option value="82" data-parent-id="3">Forbrug</option><option value="83" data-parent-id="3">Transport</option><option value="84" data-parent-id="3">Mad</option><option value="85" data-parent-id="3">Hus</option><option value="86" data-parent-id="3">Bankkonto</option><option value="88" data-parent-id="82">Forbrug</option><option value="89" data-parent-id="82">Tøj</option><option value="90" data-parent-id="82">Gaver</option><option value="91" data-parent-id="82">Uddannelse</option><option value="92" data-parent-id="83">Rejsekort</option><option value="93" data-parent-id="83">Pendlerkort</option><option value="94" data-parent-id="84">Ekstra til børn, bleer mr.</option><option value="95" data-parent-id="84">Dagligt forbrug</option><option value="96" data-parent-id="85">Forbrug</option><option value="97" data-parent-id="85">Finansiering</option><option value="98" data-parent-id="96">Kloak</option><option value="99" data-parent-id="96">Renovation</option><option value="100" data-parent-id="96">EL</option><option value="101" data-parent-id="96">Varme</option><option value="102" data-parent-id="96">Vand</option><option value="103" data-parent-id="97">Grundskyld</option><option value="104" data-parent-id="97">Ejendomsskat</option><option value="105" data-parent-id="97">Realkredit</option><option value="106" data-parent-id="3">Pension</option><option value="107" data-parent-id="81">Nordnet</option><option value="108" data-parent-id="85">Uforudsete</option><option value="109" data-parent-id="3">Bedstemor</option><option value="110" data-parent-id="109">Far 1</option>
            </select>
            <button value="Add">
            <button value="Del">
        </div>
        
        `
        console.log('render editable called')

        const dateRowChild = createHTMLElement('select', 'transaction-date')
        
        const rowDay = new Date(row.date).getDate().toString().padStart(2, '0');


        // attention: months are zero based. Input is prob. not, so 
        // from the getgo, month is probably already overflowing
        // and creating the effect we want (month + 1) and date 0
        // == last day of current month.
        const lastDayOfMonth = new Date(PERIOD.YEAR, PERIOD.MONTH, 0).getDate()

        for (let i = 1; i <= lastDayOfMonth; i++) {

            let rowOption = document.createElement('option')
            rowOption.innerText = i.toString();
            rowOption.value = i.toString().padStart(2, '0');

            if (parseInt(rowDay) == i) {
                rowOption.selected = true;
            }

            dateRowChild.appendChild(
                rowOption
            )

        }
        
        /* 
        const year = new Date(row.date).getFullYear().toString();
        let month = new Date(row.date).getMonth() + 1
        month = month.toString().padStart(2, '0'); 
        */
        
      

        // dateRowChild.value = `${year}-${month}-${day}`

        const amountRowChild = createHTMLElement('input', 'transaction-amount')
        amountRowChild.type = 'number'
        amountRowChild.value = row.amount

        const descriptionRowChild = createHTMLElement('input', 'transaction-description')
        descriptionRowChild.type = 'text'
        descriptionRowChild.value = row.name

        // make selector
        const categoryRowChild = createHTMLElement('select', 'transaction-category')
        
        // calls BUDGET object and get all available categories...
        for (let category of BUDGET.rows) {
            const newOptionElement = createHTMLElement('option', 'transaction-category-option')
            newOptionElement.value = category.id
            
            // make indents for categorys and level 2 and 3 (child and grandchildren)
            let indent: string = ''
            if (category.level > 1) {
                for (let i=0; i<category.level-1; i++) {
                    indent += "--"
                }
                indent += ' '
            }
            
            newOptionElement.innerText = `${indent}${category.name}`

            if (this.category_id == category.id) {
                newOptionElement.selected = true;
            }

            categoryRowChild.appendChild(newOptionElement)
        }

        // add and del buttons
        const addRowBtnChild = createHTMLElement('div', 'addTransRow bi bi-check-circle');
        const delRowBtnChild = createHTMLElement('div', 'delTransRow bi bi-x-circle');

        // merge entire element together
        const transactionRow = createHTMLElement(
            'div', 
            'transaction-row',
            undefined,
            [
                dateRowChild,
                amountRowChild,
                descriptionRowChild,
                categoryRowChild,
                addRowBtnChild,
                delRowBtnChild
            ]
        )
        
        // eventlisteners for add and del buttons
        transactionRow.addEventListener('click', (e) => {
            console.log(e.currentTarget)
            console.log(e.target)
            console.log(e.target.classList[0])
            if (e.target.classList[0] === 'addTransRow') {

                // setting frozen to true saves object to db and render frozen afterwards
                e.currentTarget?.parentElement.getObject().saveRow(e.currentTarget.getObject())

            } else if (e.target.classList[0] === 'delTransRow') {
                // gets object of parent element == TransactionContainer element
                // and calls the remove row using the row object.
                e.currentTarget?.parentElement.getObject().removeRow(e.currentTarget.getObject())
            }


        })

        console.log('this should be rendered: ', transactionRow)

        return transactionRow

    }
}


/****   C O N T A I N E R   ****/

class TransactionContainer implements ITransactionContainer {

    rows: TransactionRow[];
    dom_element_ref: Element;
    budget_id: number;
    query: ITransactionQueries;
    renderer: ITransactionContainerRender;


    constructor(budget_id: number, query: ITransactionQueries, renderer: ITransactionContainerRender) {

        this.query = query;
        this.renderer = renderer;
        this.budget_id = budget_id;

    }

    init = async (): Promise<void> => {

        await this.fetchTransactionDomElement()

        this.rows = await this.fetchTransactions()

    }

    // getters / setters

    

    // add/remove data
    addRow = (): void => {
        // create new empty row
        const newRow = new TransactionRow(NaN, 'Enter name', 0, new Date, NaN, 'Test', false)
        console.log(newRow)
        console.log(newRow.render())
        // add row to rows
        this.rows = [newRow, ...this.rows]
        

        // render the row to dom
        this.renderTransactions()

    }

    removeRow = (deleteRow: TransactionRow): void => {

        throw 'TODO: Replace deleteRow.delete() with call to queries from TransactionContainer, as this hold the service for sending requests.'
        if (deleteRow.delete()) { 
            // if row is deleted from db,
            // remove from mem object this.rows
            
            this.rows = this.rows.filter(row => row !== deleteRow);

            // remove from dom element
            deleteRow.dom_element_ref.parentElement?.removeChild(deleteRow.dom_element_ref)
                    
        }

    }
    
    

    saveRow = async (saveRow: TransactionRow): Promise<void> => {
        // maybe we have to fetch values from the input fields first and write to object??
        saveRow.fetchEditableValues()

        // TODO: VALIDATION
        saveRow.isValid()

        // Write row to db. Post if new (no id) and Put if known (id known)
        if (Number.isNaN(saveRow.id) === true) {
            
            await this.query.postTransaction(saveRow)

        } else {

            await this.query.updateTransaction(saveRow)

        }

        // render element frozen with updated values
        saveRow.renderFrozen();

    }

    splitRow = (id: number): void => {
        
        // dont implement yet, but a CR for later

    }

    // rendering
    renderTransactions = (): void => {

        // get container element
        const transactionRowsElement = document.querySelector('.transaction-rows');
        
        // render header of transactions
        // transactionRowsElement.appendChild(this.renderHeader());

        // render transaction rows one by one. T.frozen()
        for (let row of this.rows) {
            
            transactionRowsElement?.appendChild(row.render())

        }
        
        // replace container dom element with new element
        this.dom_element_ref = transactionRowsElement

        // make 2 way binding between dom_element_ref on container object and Dom element
        this.bindDomElementToObject()

        

    }

    renderHeader = (): HTMLElement => {
        /* 

        TARGET ELEMENT

            <div class="transaction-row header">
                <div class="transaction-date">DATE</div>
                <div class="transaction-amount">AMOUNT</div>
                <div class="transaction-description">DESCRIPTION</div>
                <div class="transaction-category">CATEGORY</div>
            </div>

        */


        // render header section of transaction columns
        const dateChild = createHTMLElement('div', 'transaction-date', 'Date');
        const amountChild = createHTMLElement('div', 'transaction-amount', 'Amt');
        const descriptionChild = createHTMLElement('div', 'transaction-description', 'Name');
        const categoryChild = createHTMLElement('div', 'transaction-category', 'Category');

        const header = createHTMLElement(
            'div',
            'transaction-row header',
            undefined,
            [dateChild, amountChild, descriptionChild, categoryChild]
        )

        // return header element
        return header

    }

    fetchTransactionDomElement = (): void => {

        const transactionRowDomElement: Element | null = document.querySelector('.transaction-rows')
        
        if (!transactionRowDomElement) throw 'could not locate the transaction-row element'

        this.dom_element_ref = transactionRowDomElement
    }

    private bindDomElementToObject = (): void => {
        // bindDomElement for CONTAINER
        Object.defineProperty(
            this.dom_element_ref,
            'getObject',
            {
                value: () => this,
                writable: false
            }
                
        )

    }

    // queries

    fetchTransactions = async (): Promise<TransactionRow[]> => {
        
        const transByBudgetId = await this.query.getTransactions(this.budget_id)
        
        return transByBudgetId.map(

            trans=>new TransactionRow(trans.id, trans.name, trans.amount, trans.date, trans.category_id, trans.category_name, true)
        
        )
    }

}


class TransactionContainerRender implements ITransactionContainerRender {

    frozen = (): Element => {
        
        return "new element"
    
    }

    header = (): Element => {

        return "new element"

    }

}




class MockTransactionQueries implements ITransactionQueries {

    getTransactions = async (budget_id: number): Promise<ITransaction[]> => {
        // getting raw categories in json
        const categoriesOfBudgetId = await this.getCategories(budget_id)
        
        // make map with id as key, name as value
        const categoriesIdNameMap = new Map()
        categoriesOfBudgetId?.forEach(category => categoriesIdNameMap.set(category.id, category.name));

        // get transactions
        const allTransactions = await fetch(`http://localhost:3000/transactions`, {
            method: 'GET'
            }).then((res) => {
                if (!res.ok) {
                    throw new Error(String(res.status))
                }
                return res.json()
            }).catch((err) => {throw new Error(err)})
        
        // filter transactions with category_id within relevant budget_id
        const filteredTransactions = allTransactions.filter(transaction => Array.from(categoriesIdNameMap.keys()).includes(transaction.category_id))
        
        // add category name to each transaction
        filteredTransactions.forEach(transaction => transaction.category_name = categoriesIdNameMap.get(transaction.category_id))

        return filteredTransactions
            

    }

    deleteTransaction = (trans_id: number): void => {
        // return status?

    }

    postTransaction = (transaction: ITransaction): Promise<ITransaction> => {
        // return status?

        
        const data = {
            name: transaction.name, 
            amount: transaction.amount,
            date: transaction.date,
            category_id: transaction.category_id,
            recipient: undefined, 
            comment: undefined
        }

        console.log('posting this to transactions: ', data)

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

    updateTransaction = async (transaction: ITransaction): Promise<ITransaction> => {
        // name, amount, date, category_id, recipient, comment
        const data = {
            name: transaction.name, 
            amount: transaction.amount,
            date: transaction.date,
            category_id: transaction.category_id,
            recipient: undefined, 
            comment: undefined
        }

        console.log('updating/putting this to transactions: ', data)

        return fetch(`http://localhost:3000/transactions/${transaction.id}`, {
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

    getCategories = async (budgetId: number): Promise<Category[] | undefined> => {

        try {
            const categoriesRaw = await fetch('http://localhost:3000/categories')
            const categoriesJson = await categoriesRaw.json()
            return categoriesJson.filter(category => category.budget_id == budgetId);
        } catch (error) {
            console.error(error)
        }

    }

}

