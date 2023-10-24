"use strict";
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
            if (typeof this.name != "string") {
                throw new Error("Name has be be of type string");
            }
            if (this.name.length <= 3) {
                throw new Error("Name must be 4 characters or more");
            }
            // amount validation
            if (typeof this.amount != "number") {
                throw new Error("Amount must be of type number");
            }
            if (this.amount < 0) {
                throw new Error("Amount must be a positive value");
            }
            if (Number.isNaN(this.amount)) {
                throw new Error("Amount cannot be NaN");
            }
            // date validation
            /* if (this.date instanceof Date) {
                throw new Error(`Date invalid: ${this.date}`)
            } */
            if (isNaN(this.date)) {
                throw new Error("Date is NaN: ", this.date);
            }
            if (this.date.getFullYear() < 1950 || this.date.getFullYear() > 2050) {
                throw new Error("Date error: Year should be between 1950 and 2050");
            }
            // category validation
            if (this.category_id == undefined || isNaN(this.category_id)) {
                throw new Error("Missing or invalid category id");
            }
            console.log("INPUT VALID: ", this);
            return true;
        };
        this.sync = (row) => {
            this.id = parseInt(row.id);
            this.name = row.name;
            this.amount = parseInt(row.amount);
            this.date = new Date(row.date);
            this.category_id = parseInt(row.category_id);
        };
        this.bindDomElementToObject = () => {
            // BINDDOM FOR ROWS
            if (!this._dom_element_ref.hasOwnProperty("getObject")) {
                Object.defineProperty(this._dom_element_ref, "getObject", {
                    value: () => this,
                    writable: false,
                });
            }
        };
        this.focusOnElement = () => {
            if (this.frozen) {
                throw "can only focus on editable elements";
            }
            this.dom_element_ref.querySelector(".transaction-date").focus();
        };
        this.fetchEditableValues = () => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (this.frozen) {
                throw "cannot fetch values from frozen element...";
            }
            this.amount = parseInt((_a = this.dom_element_ref.querySelector(".transaction-amount")) === null || _a === void 0 ? void 0 : _a.value);
            // date is selected only by the day of month, and month + year is preserved
            const day = (_b = this.dom_element_ref.querySelector(".transaction-date")) === null || _b === void 0 ? void 0 : _b.value;
            // we use UTC time in order to avoid any nasty date shifting when
            // parsing because of timezone differences
            this.date = new Date(Date.UTC(PERIOD.YEAR, PERIOD.MONTH, day));
            this.category_id = parseInt((_c = this.dom_element_ref.querySelector(".transaction-category")) === null || _c === void 0 ? void 0 : _c.value);
            this.category_name =
                (_f = (_e = (_d = this.dom_element_ref
                    .querySelector(".transaction-category")) === null || _d === void 0 ? void 0 : _d.selectedOptions[0].innerText) === null || _e === void 0 ? void 0 : _e.split("- ")[1]) !== null && _f !== void 0 ? _f : (_g = this.dom_element_ref.querySelector(".transaction-category")) === null || _g === void 0 ? void 0 : _g.selectedOptions[0].innerText;
            this.name = (_h = this.dom_element_ref.querySelector(".transaction-description")) === null || _h === void 0 ? void 0 : _h.value;
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
        console.log("2.5: about to render this frozen");
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
        const dateRowChild = createHTMLElement("div", "transaction-date", new Date(row.date).getDate().toString().padStart(2, "0"));
        const amountRowChild = createHTMLElement("div", "transaction-amount", String(row.amount));
        const descriptionRowChild = createHTMLElement("div", "transaction-description", row.name);
        const categoryRowChild = createHTMLElement("div", "transaction-category", row.category_name);
        const editRowChild = createHTMLElement("div", "transaction-edit bi bi-pencil");
        const transactionRow = createHTMLElement("div", "transaction-row", undefined, [
            dateRowChild,
            amountRowChild,
            descriptionRowChild,
            categoryRowChild,
            editRowChild,
        ]);
        // add eventhandlers for click on edit button
        /*
        transactionRow.addEventListener('click', (e) => {
            console.log('you clicked: ', e.target)
            console.log(e.target.classList[0])
            console.log('the event has been attached to: ', e.currentTarget)

            if (e.target.classList[0] === 'transaction-edit') {

                e.currentTarget.getObject().renderEditable();

            }

        }) */
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
        console.log("render editable called");
        const dateRowChild = createHTMLElement("select", "transaction-date");
        const rowDay = new Date(row.date).getDate().toString().padStart(2, "0");
        // Last day of previous month can be accessed by setting day to 0.
        // Thus we calculate the last day of the current month by getting
        // day 0 in the month after the current month (+1).
        const lastDayOfMonth = new Date(PERIOD.YEAR, PERIOD.MONTH + 1, 0).getDate();
        for (let i = 1; i <= lastDayOfMonth; i++) {
            let rowOption = document.createElement("option");
            rowOption.innerText = i.toString();
            rowOption.value = i.toString().padStart(2, "0");
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
        const amountRowChild = createHTMLElement("input", "transaction-amount");
        amountRowChild.type = "number";
        amountRowChild.value = row.amount;
        const descriptionRowChild = createHTMLElement("input", "transaction-description");
        descriptionRowChild.type = "text";
        descriptionRowChild.value = row.name;
        // make selector
        const categoryRowChild = createHTMLElement("select", "transaction-category");
        // calls BUDGET object and get all available categories...
        for (let category of BUDGET.rows) {
            const newOptionElement = createHTMLElement("option", "transaction-category-option");
            newOptionElement.value = category.id;
            // make indents for categorys and level 2 and 3 (child and grandchildren)
            let indent = "";
            if (category.level > 1) {
                indent = "|";
                for (let i = 0; i < category.level - 1; i++) {
                    indent += "--";
                }
                indent += " ";
            }
            newOptionElement.innerText =
                category.name === "root"
                    ? `${indent} Uncategorized`
                    : `${indent} ${category.name}`;
            if (row.category_id == category.id) {
                newOptionElement.selected = true;
            }
            categoryRowChild.appendChild(newOptionElement);
        }
        // add and del buttons
        const addRowBtnChild = createHTMLElement("div", "addTransRow bi bi-check-circle");
        const delRowBtnChild = createHTMLElement("div", "delTransRow bi bi-x-circle");
        // merge entire element together
        const transactionRow = createHTMLElement("div", "transaction-row", undefined, [
            dateRowChild,
            amountRowChild,
            descriptionRowChild,
            categoryRowChild,
            addRowBtnChild,
            delRowBtnChild,
        ]);
        return transactionRow;
    }
}
/****   C O N T A I N E R   ****/
class TransactionContainer {
    constructor(budget_id, query, renderer) {
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            yield this.fetchTransactionDomElement();
            this.rows = yield this.fetchTransactions().catch((err) => {
                this.render.error(err.message);
            });
            this.renderHeader();
            this.renderTransactions();
            this.renderAddTransRowBtn(true);
        });
        // add/remove data
        this.addRow = () => {
            // create new empty row
            const newRow = new TransactionRow(NaN, "Enter name", 0, new Date(PERIOD.YEAR, PERIOD.MONTH, PERIOD.DAY), NaN, "Test", false);
            // add row to rows
            this.rows = [newRow, ...this.rows];
            // render the row to dom
            this.renderTransactions();
        };
        this.removeRow = (deleteRow) => __awaiter(this, void 0, void 0, function* () {
            if (deleteRow.id) {
                // only send del req if row is in db (if no id, its new and not in db yet)
                if (yield this.query.deleteTransaction(deleteRow.id)) {
                    this.rows = this.rows.filter((row) => row !== deleteRow);
                    this.renderTransactions();
                }
            }
            else {
                this.rows = this.rows.filter((row) => row !== deleteRow);
                this.renderTransactions();
            }
            this.render.succes("Row deleted!");
            /*
            throw 'TODO: Replace deleteRow.delete() with call to queries from TransactionContainer, as this hold the service for sending requests.'
            if (deleteRow.delete()) {
                // if row is deleted from db,
                // remove from mem object this.rows
                
                this.rows = this.rows.filter(row => row !== deleteRow);
    
                // remove from dom element
                deleteRow.dom_element_ref.parentElement?.removeChild(deleteRow.dom_element_ref)
                        
            }
            */
        });
        this.saveRow = (saveRow) => __awaiter(this, void 0, void 0, function* () {
            // maybe we have to fetch values from the input fields first and write to object??
            saveRow.fetchEditableValues();
            // validation of input
            try {
                saveRow.isValid();
            }
            catch (err) {
                this.render.error(err.message);
                return;
            }
            // Write row to db. Post if new (no id) and Put if known (id known)
            if (Number.isNaN(saveRow.id)) {
                yield this.query
                    .postTransaction(saveRow)
                    .then((newRow) => {
                    // render succes message
                    this.render.succes("New transaction added!");
                    saveRow.sync(newRow);
                    // render element frozen with updated values
                    saveRow.renderFrozen();
                })
                    .catch((err) => {
                    this.render.error(err.message);
                });
                /* if (newRow) {
                    saveRow.sync(newRow);
    
                    // render element frozen with updated values
                    saveRow.renderFrozen();
                } */
            }
            else {
                yield this.query
                    .updateTransaction(saveRow)
                    .then((updatedRow) => {
                    // render succes message
                    this.render.succes("Transaction updated!");
                    // sync db row to mem object row
                    saveRow.sync(updatedRow);
                    // render element frozen with updated values
                    saveRow.renderFrozen();
                })
                    .catch((err) => {
                    // render error message in frontend
                    this.render.error(err.message);
                });
            }
        });
        this.splitRow = (id) => {
            // dont implement yet, but a CR for later
        };
        // SORTING ROWS
        this.sortRowsBy = (key = "date") => {
            // set config by logic
            if (this.sortedBy.key === key) {
                // if same key is used, make ascending = decending and vice versa
                this.sortedBy.asc = !this.sortedBy.asc;
            }
            else {
                // if new key, set it and sort ascending
                this.sortedBy.key = key;
                this.sortedBy.asc = true;
            }
            // render transactions using the newly configured sorting options
            this.renderTransactions();
        };
        this.sortedRows = () => {
            // call correct function based no this.sortedBy.key
            switch (this.sortedBy.key) {
                case "date":
                    return this.sortRowsByDate();
                case "amount":
                    return this.sortRowsByAmount();
                case "description":
                    return this.sortRowsByDescription();
                case "category":
                    return this.sortRowsByCategory();
                default:
                    throw `Could not rows by the specified key ${this.sortedBy.key}`;
            }
        };
        this.sortRowsByDate = () => {
            let sortedRows = this._rows.toSorted((a, b) => {
                return a.date.getDate() - b.date.getDate();
            });
            if (!this.sortedBy.asc) {
                sortedRows.reverse();
            }
            return sortedRows;
        };
        this.sortRowsByAmount = () => {
            let sortedRows = this._rows.toSorted((a, b) => {
                return a.amount - b.amount;
            });
            if (!this.sortedBy.asc) {
                sortedRows.reverse();
            }
            return sortedRows;
        };
        this.sortRowsByDescription = () => {
            let sortedRows = this._rows.toSorted((a, b) => {
                // sort by name string without case sensitivity
                return a.name.localeCompare(b.name, "en", {
                    sensitivity: "base",
                });
            });
            if (!this.sortedBy.asc) {
                sortedRows.reverse();
            }
            return sortedRows;
        };
        this.sortRowsByCategory = () => {
            let sortedRows = this._rows.toSorted((a, b) => {
                // sort by category name string without case sensitivity
                return a.category_name.localeCompare(b.category_name, "en", {
                    sensitivity: "base",
                });
            });
            if (!this.sortedBy.asc) {
                sortedRows.reverse();
            }
            return sortedRows;
        };
        // EVENT HANDLER
        this.clickTransactionRowBtns = (e) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if ((_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.classList.contains("addTransRow")) {
                // setting frozen to true saves object to db and render frozen afterwards
                yield ((_b = e.currentTarget) === null || _b === void 0 ? void 0 : _b.getObject().saveRow(e.target.parentElement.getObject()));
                this.updateAddTransRowBtn();
            }
            else if ((_c = e === null || e === void 0 ? void 0 : e.target) === null || _c === void 0 ? void 0 : _c.classList.contains("delTransRow")) {
                // gets object of parent element == TransactionContainer element
                // and calls the remove row using the row object.
                yield ((_d = e.currentTarget) === null || _d === void 0 ? void 0 : _d.getObject().removeRow(e.target.parentElement.getObject()));
                this.updateAddTransRowBtn();
            }
            else if ((_e = e === null || e === void 0 ? void 0 : e.target) === null || _e === void 0 ? void 0 : _e.classList.contains("transaction-edit")) {
                if (this.rows.filter((row) => !row.frozen).length == 0) {
                    // only render row editable if no other rows is editable
                    e.target.parentElement.getObject().renderEditable();
                    this.updateAddTransRowBtn();
                }
            }
        });
        this.clickHeaderSort = (e) => {
            /**
             * refactor sort:
             * make function that 1) set config on container. 2) runs renderTransactions, which in turn 3) calls this.rows, that returns _rows through a sorting function that reads the config.
             *
             *
             *
             */
            var _a, _b, _c, _d;
            console.log("TARGET: ", e.target);
            console.log("CURRENTTARGET: ", e.currentTarget);
            console.log(e.currentTarget.parentElement);
            console.log(e.currentTarget.parentElement.children);
            const transactionsRowsObject = e.currentTarget.parentElement.children[1].getObject();
            console.log(transactionsRowsObject);
            // remove '.sorted-by' from previous sorting column title
            let columnTitleElements = Array.from(e.currentTarget.children);
            for (let element of columnTitleElements) {
                element.classList.remove("sorted-by");
                element.classList.remove("ascending");
                element.classList.remove("descending");
            }
            if ((_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.classList.contains("transaction-date")) {
                console.log('clicked "day" column and ready for sorting...');
                // getting the transaction rows container, sorts the rows and rerender rows
                transactionsRowsObject.sortRowsBy("date");
            }
            if ((_b = e === null || e === void 0 ? void 0 : e.target) === null || _b === void 0 ? void 0 : _b.classList.contains("transaction-amount")) {
                console.log('clicked "amount" column and ready for sorting...');
                // getting the transaction rows container, sorts the rows and rerender rows
                transactionsRowsObject.sortRowsBy("amount");
            }
            if ((_c = e === null || e === void 0 ? void 0 : e.target) === null || _c === void 0 ? void 0 : _c.classList.contains("transaction-description")) {
                console.log('clicked "description" column and ready for sorting...');
                // getting the transaction rows container, sorts the rows and rerender rows
                transactionsRowsObject.sortRowsBy("description");
            }
            if ((_d = e === null || e === void 0 ? void 0 : e.target) === null || _d === void 0 ? void 0 : _d.classList.contains("transaction-category")) {
                console.log('clicked "category" column and ready for sorting...');
                // getting the transaction rows container, sorts the rows and rerender rows
                transactionsRowsObject.sortRowsBy("category");
            }
            // set '.sorted-by' for new sorting column title
            e === null || e === void 0 ? void 0 : e.target.classList.add("sorted-by");
            // set '.ascending/.descending' class for adding up/down icon
            transactionsRowsObject.sortedBy.asc
                ? e === null || e === void 0 ? void 0 : e.target.classList.add("ascending")
                : e === null || e === void 0 ? void 0 : e.target.classList.add("descending");
        };
        // RENDERING
        this.renderTransactions = () => {
            // get container element
            const transactionRowsElement = document.querySelector(".transaction-rows");
            // remove all children, if any
            this.unrenderChildren(transactionRowsElement);
            // eventhandler for click on transactions rows buttons
            transactionRowsElement === null || transactionRowsElement === void 0 ? void 0 : transactionRowsElement.addEventListener("click", this.clickTransactionRowBtns);
            // render transaction rows one by one. T.frozen()
            for (let row of this.rows) {
                transactionRowsElement === null || transactionRowsElement === void 0 ? void 0 : transactionRowsElement.appendChild(row.render());
            }
            // replace container dom element with new element
            this.dom_element_ref = transactionRowsElement;
            // make 2 way binding between dom_element_ref on container object and Dom element
            this.bindDomElementToObject();
        };
        this.unrenderChildren = (parent) => {
            while (parent.firstChild) {
                parent === null || parent === void 0 ? void 0 : parent.removeChild(parent.firstChild);
            }
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
            const transactionsRowsTitle = document.querySelector(".transaction-rows-title");
            // render header section of transaction columns
            const dateChild = createHTMLElement("div", "transaction-date", "Day");
            const amountChild = createHTMLElement("div", "transaction-amount", "Amt");
            const descriptionChild = createHTMLElement("div", "transaction-description", "Name");
            const categoryChild = createHTMLElement("div", "transaction-category", "Category");
            transactionsRowsTitle === null || transactionsRowsTitle === void 0 ? void 0 : transactionsRowsTitle.appendChild(dateChild);
            transactionsRowsTitle === null || transactionsRowsTitle === void 0 ? void 0 : transactionsRowsTitle.appendChild(amountChild);
            transactionsRowsTitle === null || transactionsRowsTitle === void 0 ? void 0 : transactionsRowsTitle.appendChild(descriptionChild);
            transactionsRowsTitle === null || transactionsRowsTitle === void 0 ? void 0 : transactionsRowsTitle.appendChild(categoryChild);
            // eventhandler for sorting when clicking on column titles
            transactionsRowsTitle.addEventListener("click", this.clickHeaderSort);
        };
        this.updateAddTransRowBtn = () => {
            if (this.rows.filter((row) => !row.frozen).length > 0) {
                this.renderAddTransRowBtn(false);
            }
            else {
                this.renderAddTransRowBtn(true);
            }
        };
        this.renderAddTransRowBtn = (active) => {
            // renders in 2 versions. Active / inactive
            // eventhandler on the container element listens for clicks on target where id = addTransRow
            // if any rows !frozen, render inactive. If not, render active.
            var _a;
            console.log("render add trans row");
            const addTransRowBtn = document.createElement("div");
            addTransRowBtn.id = "addTransRow";
            if (active) {
                addTransRowBtn.className = "bi bi-plus-circle-fill active";
                addTransRowBtn.addEventListener("click", () => {
                    this.addRow();
                    // THINK BELOW COMMENT HAS BEEN FIXED. CAN WE VERIFY THAT BTN WORKS AS INTENDED?
                    // why does this line not get called when clicking on the element?
                    // - i think to 2 way binding error is causing this not to be read.
                    // fix this and check if the update row button updates correctly...
                    this.updateAddTransRowBtn();
                });
            }
            else {
                addTransRowBtn.className = "bi bi-plus-circle";
            }
            (_a = document.querySelector("#addTransRow")) === null || _a === void 0 ? void 0 : _a.replaceWith(addTransRowBtn);
        };
        this.fetchTransactionDomElement = () => {
            const transactionRowDomElement = document.querySelector(".transaction-rows");
            if (!transactionRowDomElement)
                throw "could not locate the transaction-row element";
            this.dom_element_ref = transactionRowDomElement;
        };
        this.bindDomElementToObject = () => {
            // bindDomElement for CONTAINER
            if (!this.dom_element_ref.hasOwnProperty("getObject")) {
                Object.defineProperty(this.dom_element_ref, "getObject", {
                    value: () => this,
                    writable: false,
                });
            }
        };
        // QUERIES
        this.fetchTransactions = () => __awaiter(this, void 0, void 0, function* () {
            const transByBudgetId = yield this.query
                .getTransactions(this.budget_id)
                .catch((err) => {
                throw err;
            });
            const transByBudgetIdAndPeriod = transByBudgetId.filter(
            // datestring returned from db is interpreted as UTC and not our timezone
            // so date will be day - 1. Parsing it with new Date() this is
            // corrected, so the returned datestring is intepreted as our timezone.
            // This results in the right date, but with an extra hour or 2, irrelevant
            // for application to work. Thus new Date(...) may not be deleted.
            (trans) => {
                trans.date = new Date(trans.date);
                if (trans.date.getFullYear() == PERIOD.YEAR &&
                    trans.date.getMonth() === PERIOD.MONTH) {
                    // return transactions that matches the period currently rendered on budget page
                    return trans;
                }
            });
            return transByBudgetIdAndPeriod.map(
            // parse trans.date with new Date as pr. the above comment
            (trans) => new TransactionRow(trans.id, trans.name, trans.amount, new Date(trans.date), trans.category_id, trans.category_name, true));
        });
        this.query = query;
        this.render = renderer;
        this.budget_id = budget_id;
        this.editing = false;
        this.sortedBy = {
            key: "date",
            asc: false,
        };
    }
    // getters / setters
    get rows() {
        return this.sortedRows();
    }
    set rows(rows) {
        this._rows = rows;
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
        this.error = (msg) => {
            // render error message
            const errorMessage = document.createElement("div");
            errorMessage.innerText = msg;
            errorMessage.className = "errorMessage";
            // get #informationContainer
            const informationContainer = document.querySelector("#informationContainer");
            // if informationContainer not found, just skip showing messages
            if (!informationContainer) {
                console.error("Cannot find #informationContainer for showing error message");
                return;
            }
            // remove potential errorMessage or successMessage of informationContainer
            while (informationContainer === null || informationContainer === void 0 ? void 0 : informationContainer.firstChild) {
                informationContainer === null || informationContainer === void 0 ? void 0 : informationContainer.removeChild(informationContainer.firstChild);
            }
            // replace child with error message
            informationContainer === null || informationContainer === void 0 ? void 0 : informationContainer.appendChild(errorMessage);
        };
        this.succes = (msg) => {
            // render success message
            const succesMessage = document.createElement("div");
            succesMessage.innerText = msg;
            succesMessage.className = "succesMessage";
            // get #informationContainer
            const informationContainer = document.querySelector("#informationContainer");
            // if informationContainer not found, just skip showing messages
            if (!informationContainer) {
                console.error("Cannot find #informationContainer for showing succes message");
                return;
            }
            // remove potential errorMessage or succesMessage of informationContainer
            while (informationContainer === null || informationContainer === void 0 ? void 0 : informationContainer.firstChild) {
                informationContainer.removeChild(informationContainer.firstChild);
            }
            // replace child with succes message
            informationContainer.appendChild(succesMessage);
            // add class .hide after 3 seconds (fades it out) and remove element efter 4 seconds
            setTimeout(() => {
                succesMessage.classList.add("hide");
                setTimeout(() => {
                    var _a;
                    (_a = succesMessage.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(succesMessage);
                }, 1000);
            }, 3000);
        };
    }
}
class MockTransactionQueries {
    constructor() {
        this.getTransactions = (budget_id) => __awaiter(this, void 0, void 0, function* () {
            // getting raw categories in json
            const categoriesOfBudgetId = yield this.getCategories(budget_id).catch((err) => {
                throw err;
            });
            // make map with id as key, name as value
            const categoriesIdNameMap = new Map();
            categoriesOfBudgetId === null || categoriesOfBudgetId === void 0 ? void 0 : categoriesOfBudgetId.forEach((category) => categoriesIdNameMap.set(category.id, category.name));
            // get transactions
            const allTransactions = yield fetch(`http://localhost:3000/transactions`, {
                method: "GET",
            })
                .then((res) => {
                if (!res.ok) {
                    return res.json().then((err) => {
                        console.error(err.description);
                        throw new Error(err.message);
                    });
                }
                return res.json();
            })
                .catch((err) => {
                throw err;
            });
            // filter transactions with category_id within relevant budget_id
            const filteredTransactions = allTransactions.filter((transaction) => Array.from(categoriesIdNameMap.keys()).includes(transaction.category_id));
            // add category name to each transaction
            filteredTransactions.forEach((transaction) => {
                transaction.category_name = categoriesIdNameMap.get(transaction.category_id);
            });
            return filteredTransactions;
        });
        this.deleteTransaction = (trans_id) => __awaiter(this, void 0, void 0, function* () {
            // return status?
            return yield fetch(`http://localhost:3000/transactions/${trans_id}`, {
                method: "DELETE",
            })
                .then((res) => {
                if (!res.ok) {
                    throw new Error(String(res.status));
                }
                return true;
            })
                .catch((err) => {
                throw err;
            });
        });
        this.postTransaction = (transaction) => {
            // return status?
            const data = {
                name: transaction.name,
                amount: transaction.amount,
                date: transaction.date,
                category_id: transaction.category_id,
                recipient: undefined,
                comment: undefined,
            };
            console.log("POSTING this to transactions: ", data);
            return fetch("http://localhost:3000/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((res) => {
                if (!res.ok) {
                    return res.json().then((err) => {
                        throw new Error(err.message);
                    });
                }
                return res.json();
            })
                .catch((err) => {
                throw err;
            });
        };
        this.updateTransaction = (transaction) => __awaiter(this, void 0, void 0, function* () {
            // name, amount, date, category_id, recipient, comment
            const data = {
                name: transaction.name,
                amount: transaction.amount,
                date: transaction.date,
                category_id: transaction.category_id,
                recipient: undefined,
                comment: undefined,
            };
            console.log("UPDATE/PUTTING this to transactions: ", data);
            return fetch(`http://localhost:3000/transactions/${transaction.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((res) => {
                if (!res.ok) {
                    return res.json().then((err) => {
                        throw new Error(err.message);
                    });
                }
                return res.json();
            })
                .then((result) => {
                return result;
            })
                .catch((err) => {
                throw err;
            });
        });
        this.getCategories = (budgetId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const categoriesRaw = yield fetch("http://localhost:3000/categories");
                const categoriesJson = yield categoriesRaw.json();
                return categoriesJson.filter((category) => category.budget_id == budgetId);
            }
            catch (err) {
                throw new Error("Cannot get categories!");
            }
        });
    }
}
