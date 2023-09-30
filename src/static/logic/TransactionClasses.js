"use strict";
/*

MAKE CLASS DIAGRAM BEFORE MOVING ON

*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/****   R O W   ****/
class TransactionRow {
    constructor(id, name, amount, date, category_id, category_name, frozen = true, renderer) {
        /* READING / WRITING DATA */
        this.isValid = () => {
            // name validation
            if (typeof this.name != 'string') {
                throw new TypeError('Name has be be of type string');
            }
            if (this.name.length <= 3) {
                throw new Error('Name must be of lenght 4 or more');
            }
            // amount validation
            if (typeof this.amount != 'number') {
                throw new Error('Amount must be of type number');
            }
            if (this.amount < 0) {
                throw new Error('Amount canont be a negative value');
            }
            if (Number.isNaN(this.amount)) {
                throw new Error('Amount cannot be NaN');
            }
            // date validation
            /* if (this.date instanceof Date) {
                throw new Error(`Date invalid: ${this.date}`)
            } */
            if (isNaN(this.date)) {
                throw new Error('Date is NaN: ', this.date);
            }
            if (this.date.getFullYear() < 1950 || this.date.getFullYear() > 2050) {
                throw new Error('Date error: Year should be between 1950 and 2050');
            }
            // category validation
            if (this.category_id == undefined || isNaN(this.category_id)) {
                throw new Error('Missing or invalid category id');
            }
            console.log('INPUT VALID: ', this);
            return true;
        };
        this.bindDomElementToObject = () => {
            // BINDDOM FOR ROWS
            Object.defineProperty(this._dom_element_ref, 'getObject', {
                value: () => this,
                writable: false
            });
        };
        this.focusOnElement = () => {
            if (this.frozen) {
                throw 'can only focus on editable elements';
            }
            this.dom_element_ref.querySelector('.transaction-date').focus();
        };
        this.fetchEditableValues = () => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (this.frozen) {
                throw 'cannot fetch values from frozen element...';
            }
            this.amount = parseInt((_a = this.dom_element_ref.querySelector('.transaction-amount')) === null || _a === void 0 ? void 0 : _a.value);
            // date is selected only by the day of month, and month + year is preserved
            const day = (_b = this.dom_element_ref.querySelector('.transaction-date')) === null || _b === void 0 ? void 0 : _b.value;
            // we use UTC time in order to avoid any nasty date shifting when 
            // parsing because of timezone differences
            this.date = new Date(Date.UTC(PERIOD.YEAR, PERIOD.MONTH, day));
            this.category_id = parseInt((_c = this.dom_element_ref.querySelector('.transaction-category')) === null || _c === void 0 ? void 0 : _c.value);
            this.category_name = (_f = (_e = (_d = this.dom_element_ref.querySelector('.transaction-category')) === null || _d === void 0 ? void 0 : _d.selectedOptions[0].innerText) === null || _e === void 0 ? void 0 : _e.split('- ')[1]) !== null && _f !== void 0 ? _f : (_g = this.dom_element_ref.querySelector('.transaction-category')) === null || _g === void 0 ? void 0 : _g.selectedOptions[0].innerText;
            this.name = (_h = this.dom_element_ref.querySelector('.transaction-description')) === null || _h === void 0 ? void 0 : _h.value;
        };
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.date = date;
        this.category_id = category_id;
        this.category_name = category_name;
        this.renderer = renderer !== null && renderer !== void 0 ? renderer : new TransactionRowRender();
        this.frozen = frozen;
    }
    get dom_element_ref() {
        return this._dom_element_ref;
    }
    set dom_element_ref(newRef) {
        // insert new ref in dom and establish two way binding
        if (this.dom_element_ref) {
            // if dom element has been rendered before, replace it
            this._dom_element_ref.replaceWith(newRef);
            this._dom_element_ref = newRef;
            this.bindDomElementToObject();
        }
        else {
            // else set it new
            this._dom_element_ref = newRef;
            this.bindDomElementToObject();
        }
    }
    /* DOM EVENTS AND ELEMENTS */
    /*
    renderFrozen => HTMLElement
    renderEditable => HTMLElement

    syncDom: replace dom element and dom_element_ref
    kan vi gøre så ændringer i dom_elemment
    
    */
    render() {
        if (this.frozen) {
            return this.renderFrozen();
        }
        else {
            return this.renderEditable();
        }
    }
    renderFrozen() {
        this.dom_element_ref = this.renderer.frozen(this);
        this.frozen = true;
        return this.dom_element_ref;
    }
    renderEditable() {
        this.dom_element_ref = this.renderer.editable(this);
        this.frozen = false;
        return this.dom_element_ref;
    }
}
class TransactionRowRender {
    frozen(row) {
        `
        Target element:

        
        <div class="transaction-row">
            <div class="transaction-date">1999-03-01</div>
            <div class="transaction-amount">199</div>
            <div class="transaction-description">Jyllinge - Sdr. Omme</div>
            <div class="transaction-category">3</div>
            edit button
        </div>
        
        `;
        // input comes either from db or from dateselector in ui
        // return from db: 2000-01-14T23:00:00.000Z (when input to new Date(...) it corrects to 2000-01-15)
        // return from ui: 1999-01-01 (when input to new Date(...) it will return 1999-01-01 - 01:00 - but still ok as date is the same)
        // what happens when YYYY-MM-DD 01:00 gets inserted to db?
        const dateRowChild = createHTMLElement('div', 'transaction-date', new Date(row.date).getDate().toString().padStart(2, '0'));
        const amountRowChild = createHTMLElement('div', 'transaction-amount', String(row.amount));
        const descriptionRowChild = createHTMLElement('div', 'transaction-description', row.name);
        const categoryRowChild = createHTMLElement('div', 'transaction-category', row.category_name);
        const editRowChild = createHTMLElement('div', 'transaction-edit bi bi-pencil');
        const transactionRow = createHTMLElement('div', 'transaction-row', undefined, [
            dateRowChild,
            amountRowChild,
            descriptionRowChild,
            categoryRowChild,
            editRowChild
        ]);
        // add eventhandlers for click on edit button
        transactionRow.addEventListener('click', (e) => {
            console.log('you clicked: ', e.target);
            console.log(e.target.classList[0]);
            console.log('the event has been attached to: ', e.currentTarget);
            if (e.target.classList[0] === 'transaction-edit') {
                e.currentTarget.getObject().renderEditable();
            }
        });
        return transactionRow;
    }
    editable(row) {
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
        
        `;
        console.log('render editable called');
        const dateRowChild = createHTMLElement('select', 'transaction-date');
        const rowDay = new Date(row.date).getDate().toString().padStart(2, '0');
        // Last day of previous month can be accessed by setting day to 0.
        // Thus we calculate the last day of the current month by getting
        // day 0 in the month after the current month (+1).
        const lastDayOfMonth = new Date(PERIOD.YEAR, PERIOD.MONTH + 1, 0).getDate();
        for (let i = 1; i <= lastDayOfMonth; i++) {
            let rowOption = document.createElement('option');
            rowOption.innerText = i.toString();
            rowOption.value = i.toString().padStart(2, '0');
            if (parseInt(rowDay) == i) {
                rowOption.selected = true;
            }
            dateRowChild.appendChild(rowOption);
        }
        /*
        const year = new Date(row.date).getFullYear().toString();
        let month = new Date(row.date).getMonth() + 1
        month = month.toString().padStart(2, '0');
        */
        // dateRowChild.value = `${year}-${month}-${day}`
        const amountRowChild = createHTMLElement('input', 'transaction-amount');
        amountRowChild.type = 'number';
        amountRowChild.value = row.amount;
        const descriptionRowChild = createHTMLElement('input', 'transaction-description');
        descriptionRowChild.type = 'text';
        descriptionRowChild.value = row.name;
        // make selector
        const categoryRowChild = createHTMLElement('select', 'transaction-category');
        // calls BUDGET object and get all available categories...
        for (let category of BUDGET.rows) {
            const newOptionElement = createHTMLElement('option', 'transaction-category-option');
            newOptionElement.value = category.id;
            // make indents for categorys and level 2 and 3 (child and grandchildren)
            let indent = '';
            if (category.level > 1) {
                for (let i = 0; i < category.level - 1; i++) {
                    indent += "--";
                }
                indent += ' ';
            }
            newOptionElement.innerText = `${indent}${category.name}`;
            if (this.category_id == category.id) {
                newOptionElement.selected = true;
            }
            categoryRowChild.appendChild(newOptionElement);
        }
        // add and del buttons
        const addRowBtnChild = createHTMLElement('div', 'addTransRow bi bi-check-circle');
        const delRowBtnChild = createHTMLElement('div', 'delTransRow bi bi-x-circle');
        // merge entire element together
        const transactionRow = createHTMLElement('div', 'transaction-row', undefined, [
            dateRowChild,
            amountRowChild,
            descriptionRowChild,
            categoryRowChild,
            addRowBtnChild,
            delRowBtnChild
        ]);
        // eventlisteners for add and del buttons
        transactionRow.addEventListener('click', (e) => {
            var _a, _b;
            console.log(e.currentTarget);
            console.log(e.target);
            console.log(e.target.classList[0]);
            if (e.target.classList[0] === 'addTransRow') {
                // setting frozen to true saves object to db and render frozen afterwards
                (_a = e.currentTarget) === null || _a === void 0 ? void 0 : _a.parentElement.getObject().saveRow(e.currentTarget.getObject());
            }
            else if (e.target.classList[0] === 'delTransRow') {
                // gets object of parent element == TransactionContainer element
                // and calls the remove row using the row object.
                (_b = e.currentTarget) === null || _b === void 0 ? void 0 : _b.parentElement.getObject().removeRow(e.currentTarget.getObject());
            }
        });
        console.log('this should be rendered: ', transactionRow);
        return transactionRow;
    }
}
/****   C O N T A I N E R   ****/
class TransactionContainer {
    constructor(budget_id, query, renderer) {
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            yield this.fetchTransactionDomElement();
            this.rows = yield this.fetchTransactions();
        });
        // getters / setters
        // add/remove data
        this.addRow = () => {
            // create new empty row
            const newRow = new TransactionRow(NaN, 'Enter name', 0, new Date(PERIOD.YEAR, PERIOD.MONTH, PERIOD.DAY), NaN, 'Test', false);
            console.log(newRow);
            console.log(newRow.render());
            // add row to rows
            this.rows = [newRow, ...this.rows];
            // render the row to dom
            this.renderTransactions();
        };
        this.removeRow = (deleteRow) => {
            var _a;
            throw 'TODO: Replace deleteRow.delete() with call to queries from TransactionContainer, as this hold the service for sending requests.';
            if (deleteRow.delete()) {
                // if row is deleted from db,
                // remove from mem object this.rows
                this.rows = this.rows.filter(row => row !== deleteRow);
                // remove from dom element
                (_a = deleteRow.dom_element_ref.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(deleteRow.dom_element_ref);
            }
        };
        this.saveRow = (saveRow) => __awaiter(this, void 0, void 0, function* () {
            // maybe we have to fetch values from the input fields first and write to object??
            saveRow.fetchEditableValues();
            // TODO: VALIDATION
            saveRow.isValid();
            // Write row to db. Post if new (no id) and Put if known (id known)
            if (Number.isNaN(saveRow.id) === true) {
                yield this.query.postTransaction(saveRow);
            }
            else {
                yield this.query.updateTransaction(saveRow);
            }
            // render element frozen with updated values
            saveRow.renderFrozen();
        });
        this.splitRow = (id) => {
            // dont implement yet, but a CR for later
        };
        // rendering
        this.renderTransactions = () => {
            // get container element
            const transactionRowsElement = document.querySelector('.transaction-rows');
            // render header of transactions
            // transactionRowsElement.appendChild(this.renderHeader());
            // render transaction rows one by one. T.frozen()
            for (let row of this.rows) {
                transactionRowsElement === null || transactionRowsElement === void 0 ? void 0 : transactionRowsElement.appendChild(row.render());
            }
            // replace container dom element with new element
            this.dom_element_ref = transactionRowsElement;
            // make 2 way binding between dom_element_ref on container object and Dom element
            this.bindDomElementToObject();
        };
        this.renderHeader = () => {
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
            const header = createHTMLElement('div', 'transaction-row header', undefined, [dateChild, amountChild, descriptionChild, categoryChild]);
            // return header element
            return header;
        };
        this.fetchTransactionDomElement = () => {
            const transactionRowDomElement = document.querySelector('.transaction-rows');
            if (!transactionRowDomElement)
                throw 'could not locate the transaction-row element';
            this.dom_element_ref = transactionRowDomElement;
        };
        this.bindDomElementToObject = () => {
            // bindDomElement for CONTAINER
            Object.defineProperty(this.dom_element_ref, 'getObject', {
                value: () => this,
                writable: false
            });
        };
        // queries
        this.fetchTransactions = () => __awaiter(this, void 0, void 0, function* () {
            const transByBudgetId = yield this.query.getTransactions(this.budget_id);
            const transByBudgetIdAndPeriod = transByBudgetId.filter(
            // datestring returned from db is interpreted as UTC and not our timezone
            // so date will be day - 1. Parsing it with new Date() this is
            // corrected, so the returned datestring is intepreted as our timezone.
            // This results in the right date, but with an extra hour or 2, irrelevant 
            // for application to work. Thus new Date(...) may not be deleted.
            trans => {
                trans.date = new Date(trans.date);
                if (trans.date.getFullYear() == PERIOD.YEAR && trans.date.getMonth() === PERIOD.MONTH) {
                    // return transactions that matches the period currently rendered on budget page
                    return trans;
                }
            });
            return transByBudgetIdAndPeriod.map(
            // parse trans.date with new Date as pr. the above comment 
            trans => new TransactionRow(trans.id, trans.name, trans.amount, new Date(trans.date), trans.category_id, trans.category_name, true));
        });
        this.query = query;
        this.renderer = renderer;
        this.budget_id = budget_id;
    }
}
class TransactionContainerRender {
    constructor() {
        this.frozen = () => {
            return "new element";
        };
        this.header = () => {
            return "new element";
        };
    }
}
class MockTransactionQueries {
    constructor() {
        this.getTransactions = (budget_id) => __awaiter(this, void 0, void 0, function* () {
            // getting raw categories in json
            const categoriesOfBudgetId = yield this.getCategories(budget_id);
            // make map with id as key, name as value
            const categoriesIdNameMap = new Map();
            categoriesOfBudgetId === null || categoriesOfBudgetId === void 0 ? void 0 : categoriesOfBudgetId.forEach(category => categoriesIdNameMap.set(category.id, category.name));
            // get transactions
            const allTransactions = yield fetch(`http://localhost:3000/transactions`, {
                method: 'GET'
            }).then((res) => {
                if (!res.ok) {
                    throw new Error(String(res.status));
                }
                return res.json();
            }).catch((err) => { throw new Error(err); });
            // filter transactions with category_id within relevant budget_id
            const filteredTransactions = allTransactions.filter(transaction => Array.from(categoriesIdNameMap.keys()).includes(transaction.category_id));
            // add category name to each transaction
            filteredTransactions.forEach(transaction => transaction.category_name = categoriesIdNameMap.get(transaction.category_id));
            return filteredTransactions;
        });
        this.deleteTransaction = (trans_id) => {
            // return status?
        };
        this.postTransaction = (transaction) => {
            // return status?
            const data = {
                name: transaction.name,
                amount: transaction.amount,
                date: transaction.date,
                category_id: transaction.category_id,
                recipient: undefined,
                comment: undefined
            };
            console.log('posting this to transactions: ', data);
            return fetch('http://localhost:3000/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then((res) => {
                if (!res.ok) {
                    throw new Error(res.status);
                }
                console.log('returned from API: ', res);
                return res.json();
            })
                .catch((err) => { throw new Error(err); });
        };
        this.updateTransaction = (transaction) => __awaiter(this, void 0, void 0, function* () {
            // name, amount, date, category_id, recipient, comment
            const data = {
                name: transaction.name,
                amount: transaction.amount,
                date: transaction.date,
                category_id: transaction.category_id,
                recipient: undefined,
                comment: undefined
            };
            console.log('updating/putting this to transactions: ', data);
            return fetch(`http://localhost:3000/transactions/${transaction.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then((res) => {
                if (!res.ok) {
                    throw new Error(res.status);
                }
                return res.json();
            })
                .catch((err) => { throw new Error(err); });
        });
        this.getCategories = (budgetId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const categoriesRaw = yield fetch('http://localhost:3000/categories');
                const categoriesJson = yield categoriesRaw.json();
                return categoriesJson.filter(category => category.budget_id == budgetId);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
}
