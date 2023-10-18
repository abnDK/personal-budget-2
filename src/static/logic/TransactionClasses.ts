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

    constructor(
        id: number,
        name: string,
        amount: number,
        date: Date,
        category_id: number | undefined,
        category_name: string | undefined,
        frozen: boolean = true,
        renderer?: ITransactionRowRender
    ) {
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
        return this._dom_element_ref;
    }

    set dom_element_ref(newRef) {
        // insert new ref in dom and establish two way binding

        if (this.dom_element_ref) {
            // if dom element has been rendered before, replace it
            this._dom_element_ref.replaceWith(newRef);
            this._dom_element_ref = newRef;

            this.bindDomElementToObject();
        } else {
            // else set it new
            this._dom_element_ref = newRef;

            this.bindDomElementToObject();
        }
    }

    /* READING / WRITING DATA */
    isValid = (): boolean => {
        // name validation
        if (typeof this.name != "string") {
            throw new CustomError(
                "GENERIC",
                500,
                "Name has be be of type string"
            );
        }

        if (this.name.length <= 3) {
            throw new CustomError(
                "GENERIC",
                500,
                "Name must be 4 characters or more"
            );
        }

        // amount validation
        if (typeof this.amount != "number") {
            throw new Error("Amount must be of type number");
        }

        if (this.amount < 0) {
            throw new Error("Amount canont be a negative value");
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

    sync = (row: {
        id: string;
        name: string;
        amount: string;
        date: string;
        category_id: string;
        recipient: string;
        comment: string;
    }): void => {
        this.id = parseInt(row.id);
        this.name = row.name;
        this.amount = parseInt(row.amount);
        this.date = new Date(row.date);
        this.category_id = parseInt(row.category_id);
    };

    /* DOM EVENTS AND ELEMENTS */

    /* 
    renderFrozen => HTMLElement
    renderEditable => HTMLElement

    syncDom: replace dom element and dom_element_ref
    kan vi gøre så ændringer i dom_elemment
    
    */

    render(): HTMLElement {
        if (this.frozen) {
            return this.renderFrozen();
        } else {
            return this.renderEditable();
        }
    }

    renderFrozen(): HTMLElement {
        console.log("2.5: about to render this frozen");

        this.dom_element_ref = this.renderer.frozen(this);

        this.frozen = true;

        return this.dom_element_ref;
    }

    renderEditable(): HTMLElement {
        this.dom_element_ref = this.renderer.editable(this);

        this.frozen = false;

        return this.dom_element_ref;
    }

    private bindDomElementToObject = (): void => {
        // BINDDOM FOR ROWS
        if (!this._dom_element_ref.hasOwnProperty("getObject")) {
            Object.defineProperty(this._dom_element_ref, "getObject", {
                value: () => this,
                writable: false,
            });
        }
    };

    focusOnElement = (): void => {
        if (this.frozen) {
            throw "can only focus on editable elements";
        }

        this.dom_element_ref.querySelector(".transaction-date").focus();
    };

    fetchEditableValues = (): void => {
        if (this.frozen) {
            throw "cannot fetch values from frozen element...";
        }

        this.amount = parseInt(
            this.dom_element_ref.querySelector(".transaction-amount")?.value
        );

        // date is selected only by the day of month, and month + year is preserved
        const day =
            this.dom_element_ref.querySelector(".transaction-date")?.value;

        // we use UTC time in order to avoid any nasty date shifting when
        // parsing because of timezone differences
        this.date = new Date(Date.UTC(PERIOD.YEAR, PERIOD.MONTH, day));

        this.category_id = parseInt(
            this.dom_element_ref.querySelector(".transaction-category")?.value
        );
        this.category_name =
            this.dom_element_ref
                .querySelector(".transaction-category")
                ?.selectedOptions[0].innerText?.split("- ")[1] ??
            this.dom_element_ref.querySelector(".transaction-category")
                ?.selectedOptions[0].innerText;
        this.name = this.dom_element_ref.querySelector(
            ".transaction-description"
        )?.value;
    };
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
        
        `;

        // input comes either from db or from dateselector in ui
        // return from db: 2000-01-14T23:00:00.000Z (when input to new Date(...) it corrects to 2000-01-15)
        // return from ui: 1999-01-01 (when input to new Date(...) it will return 1999-01-01 - 01:00 - but still ok as date is the same)
        // what happens when YYYY-MM-DD 01:00 gets inserted to db?

        const dateRowChild = createHTMLElement(
            "div",
            "transaction-date",
            new Date(row.date).getDate().toString().padStart(2, "0")
        );

        const amountRowChild = createHTMLElement(
            "div",
            "transaction-amount",
            String(row.amount)
        );
        const descriptionRowChild = createHTMLElement(
            "div",
            "transaction-description",
            row.name
        );
        const categoryRowChild = createHTMLElement(
            "div",
            "transaction-category",
            row.category_name
        );
        const editRowChild = createHTMLElement(
            "div",
            "transaction-edit bi bi-pencil"
        );

        const transactionRow = createHTMLElement(
            "div",
            "transaction-row",
            undefined,
            [
                dateRowChild,
                amountRowChild,
                descriptionRowChild,
                categoryRowChild,
                editRowChild,
            ]
        );

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
        
        `;
        console.log("render editable called");

        const dateRowChild = createHTMLElement("select", "transaction-date");

        const rowDay = new Date(row.date).getDate().toString().padStart(2, "0");

        // Last day of previous month can be accessed by setting day to 0.
        // Thus we calculate the last day of the current month by getting
        // day 0 in the month after the current month (+1).
        const lastDayOfMonth = new Date(
            PERIOD.YEAR,
            PERIOD.MONTH + 1,
            0
        ).getDate();

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

        const descriptionRowChild = createHTMLElement(
            "input",
            "transaction-description"
        );
        descriptionRowChild.type = "text";
        descriptionRowChild.value = row.name;

        // make selector
        const categoryRowChild = createHTMLElement(
            "select",
            "transaction-category"
        );

        // calls BUDGET object and get all available categories...
        for (let category of BUDGET.rows) {
            const newOptionElement = createHTMLElement(
                "option",
                "transaction-category-option"
            );
            newOptionElement.value = category.id;

            // make indents for categorys and level 2 and 3 (child and grandchildren)
            let indent: string = "";
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
        const addRowBtnChild = createHTMLElement(
            "div",
            "addTransRow bi bi-check-circle"
        );
        const delRowBtnChild = createHTMLElement(
            "div",
            "delTransRow bi bi-x-circle"
        );

        // merge entire element together
        const transactionRow = createHTMLElement(
            "div",
            "transaction-row",
            undefined,
            [
                dateRowChild,
                amountRowChild,
                descriptionRowChild,
                categoryRowChild,
                addRowBtnChild,
                delRowBtnChild,
            ]
        );

        return transactionRow;
    }
}

/****   C O N T A I N E R   ****/
class TransactionContainer implements ITransactionContainer {
    _rows: TransactionRow[];
    dom_element_ref: Element;
    budget_id: number;
    query: ITransactionQueries;
    renderer: ITransactionContainerRender;
    editing: boolean;
    sortedBy: { key: string; asc: boolean };

    constructor(
        budget_id: number,
        query: ITransactionQueries,
        renderer: ITransactionContainerRender
    ) {
        this.query = query;
        this.renderer = renderer;
        this.budget_id = budget_id;
        this.editing = false;
        this.sortedBy = {
            key: "date",
            asc: false,
        };
    }

    init = async (): Promise<void> => {
        await this.fetchTransactionDomElement();

        this.rows = await this.fetchTransactions();

        this.renderHeader();

        this.renderTransactions();

        this.renderAddTransRowBtn(true);
    };

    // getters / setters

    get rows(): TransactionRow[] {
        return this.sortedRows();
    }

    set rows(rows: TransactionRow[]) {
        this._rows = rows;
    }

    // add/remove data
    addRow = (): void => {
        // create new empty row
        const newRow = new TransactionRow(
            NaN,
            "Enter name",
            0,
            new Date(PERIOD.YEAR, PERIOD.MONTH, PERIOD.DAY),
            NaN,
            "Test",
            false
        );

        // add row to rows
        this.rows = [newRow, ...this.rows];

        // render the row to dom
        this.renderTransactions();
    };

    removeRow = async (deleteRow: TransactionRow): Promise<void> => {
        if (deleteRow.id) {
            // only send del req if row is in db (if no id, its new and not in db yet)
            if (await this.query.deleteTransaction(deleteRow.id)) {
                this.rows = this.rows.filter((row) => row !== deleteRow);

                this.renderTransactions();
            }
        } else {
            this.rows = this.rows.filter((row) => row !== deleteRow);

            this.renderTransactions();
        }

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
    };

    saveRow = async (saveRow: TransactionRow): Promise<void> => {
        // maybe we have to fetch values from the input fields first and write to object??
        saveRow.fetchEditableValues();

        // TODO: VALIDATION
        saveRow.isValid();

        // Write row to db. Post if new (no id) and Put if known (id known)
        if (Number.isNaN(saveRow.id)) {
            const newRow = await this.query
                .postTransaction(saveRow)
                .catch((err) => console.error(err));

            if (newRow) {
                saveRow.sync(newRow);
            }
        } else {
            const updatedRow = await this.query
                .updateTransaction(saveRow)
                .catch((err) => console.error(err));

            if (updatedRow) {
                saveRow.sync(updatedRow);
            }
        }

        // render element frozen with updated values
        saveRow.renderFrozen();
    };

    splitRow = (id: number): void => {
        // dont implement yet, but a CR for later
    };

    // SORTING ROWS

    sortRowsBy = (key: string = "date"): void => {
        // set config by logic
        if (this.sortedBy.key === key) {
            // if same key is used, make ascending = decending and vice versa
            this.sortedBy.asc = !this.sortedBy.asc;
        } else {
            // if new key, set it and sort ascending
            this.sortedBy.key = key;
            this.sortedBy.asc = true;
        }

        // render transactions using the newly configured sorting options
        this.renderTransactions();
    };

    private sortedRows = (): TransactionRow[] => {
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

    private sortRowsByDate = (): TransactionRow[] => {
        let sortedRows = this._rows.toSorted(
            (a: TransactionRow, b: TransactionRow) => {
                return a.date.getDate() - b.date.getDate();
            }
        );

        if (!this.sortedBy.asc) {
            sortedRows.reverse();
        }

        return sortedRows;
    };

    private sortRowsByAmount = (): TransactionRow[] => {
        let sortedRows = this._rows.toSorted(
            (a: TransactionRow, b: TransactionRow) => {
                return a.amount - b.amount;
            }
        );

        if (!this.sortedBy.asc) {
            sortedRows.reverse();
        }

        return sortedRows;
    };

    private sortRowsByDescription = (): TransactionRow[] => {
        let sortedRows = this._rows.toSorted(
            (a: TransactionRow, b: TransactionRow) => {
                // sort by name string without case sensitivity
                return a.name.localeCompare(b.name, "en", {
                    sensitivity: "base",
                });
            }
        );

        if (!this.sortedBy.asc) {
            sortedRows.reverse();
        }

        return sortedRows;
    };

    private sortRowsByCategory = (): TransactionRow[] => {
        let sortedRows = this._rows.toSorted(
            (a: TransactionRow, b: TransactionRow) => {
                // sort by category name string without case sensitivity
                return a.category_name.localeCompare(b.category_name, "en", {
                    sensitivity: "base",
                });
            }
        );

        if (!this.sortedBy.asc) {
            sortedRows.reverse();
        }

        return sortedRows;
    };

    // EVENT HANDLER

    clickTransactionRowBtns = async (e: EventTarget): Promise<void> => {
        if (e?.target?.classList.contains("addTransRow")) {
            // setting frozen to true saves object to db and render frozen afterwards
            await e.currentTarget
                ?.getObject()
                .saveRow(e.target.parentElement.getObject());

            this.updateAddTransRowBtn();
        } else if (e?.target?.classList.contains("delTransRow")) {
            // gets object of parent element == TransactionContainer element
            // and calls the remove row using the row object.
            await e.currentTarget
                ?.getObject()
                .removeRow(e.target.parentElement.getObject());

            this.updateAddTransRowBtn();
        } else if (e?.target?.classList.contains("transaction-edit")) {
            if (this.rows.filter((row) => !row.frozen).length == 0) {
                // only render row editable if no other rows is editable
                e.target.parentElement.getObject().renderEditable();

                this.updateAddTransRowBtn();
            }
        }
    };

    clickHeaderSort = (e: EventTarget): void => {
        /**
         * refactor sort:
         * make function that 1) set config on container. 2) runs renderTransactions, which in turn 3) calls this.rows, that returns _rows through a sorting function that reads the config.
         *
         *
         *
         */

        console.log("TARGET: ", e.target);
        console.log("CURRENTTARGET: ", e.currentTarget);
        console.log(e.currentTarget.parentElement);
        console.log(e.currentTarget.parentElement.children);

        const transactionsRowsObject =
            e.currentTarget.parentElement.children[1].getObject();
        console.log(transactionsRowsObject);

        // remove '.sorted-by' from previous sorting column title
        let columnTitleElements = Array.from(e.currentTarget.children);

        for (let element of columnTitleElements) {
            element.classList.remove("sorted-by");
            element.classList.remove("ascending");
            element.classList.remove("descending");
        }

        if (e?.target?.classList.contains("transaction-date")) {
            console.log('clicked "day" column and ready for sorting...');

            // getting the transaction rows container, sorts the rows and rerender rows
            transactionsRowsObject.sortRowsBy("date");
        }

        if (e?.target?.classList.contains("transaction-amount")) {
            console.log('clicked "amount" column and ready for sorting...');

            // getting the transaction rows container, sorts the rows and rerender rows
            transactionsRowsObject.sortRowsBy("amount");
        }

        if (e?.target?.classList.contains("transaction-description")) {
            console.log(
                'clicked "description" column and ready for sorting...'
            );

            // getting the transaction rows container, sorts the rows and rerender rows
            transactionsRowsObject.sortRowsBy("description");
        }

        if (e?.target?.classList.contains("transaction-category")) {
            console.log('clicked "category" column and ready for sorting...');

            // getting the transaction rows container, sorts the rows and rerender rows
            transactionsRowsObject.sortRowsBy("category");
        }

        // set '.sorted-by' for new sorting column title
        e?.target.classList.add("sorted-by");

        // set '.ascending/.descending' class for adding up/down icon
        transactionsRowsObject.sortedBy.asc
            ? e?.target.classList.add("ascending")
            : e?.target.classList.add("descending");
    };

    // RENDERING

    renderTransactions = (): void => {
        // get container element
        const transactionRowsElement =
            document.querySelector(".transaction-rows");

        // remove all children, if any
        this.unrenderChildren(transactionRowsElement);

        // eventhandler for click on transactions rows buttons
        transactionRowsElement?.addEventListener(
            "click",
            this.clickTransactionRowBtns
        );

        // render transaction rows one by one. T.frozen()
        for (let row of this.rows) {
            transactionRowsElement?.appendChild(row.render());
        }

        // replace container dom element with new element
        this.dom_element_ref = transactionRowsElement;

        // make 2 way binding between dom_element_ref on container object and Dom element
        this.bindDomElementToObject();
    };

    private unrenderChildren = (parent: HTMLElement): void => {
        while (parent.firstChild) {
            parent?.removeChild(parent.firstChild);
        }
    };

    renderHeader = (): void => {
        /* 




        TARGET ELEMENT

            <div class="transaction-row header">
                <div class="transaction-date">DATE</div>
                <div class="transaction-amount">AMOUNT</div>
                <div class="transaction-description">DESCRIPTION</div>
                <div class="transaction-category">CATEGORY</div>
            </div>

        */

        const transactionsRowsTitle = document.querySelector(
            ".transaction-rows-title"
        );

        // render header section of transaction columns
        const dateChild = createHTMLElement("div", "transaction-date", "Day");
        const amountChild = createHTMLElement(
            "div",
            "transaction-amount",
            "Amt"
        );
        const descriptionChild = createHTMLElement(
            "div",
            "transaction-description",
            "Name"
        );
        const categoryChild = createHTMLElement(
            "div",
            "transaction-category",
            "Category"
        );

        transactionsRowsTitle?.appendChild(dateChild);
        transactionsRowsTitle?.appendChild(amountChild);
        transactionsRowsTitle?.appendChild(descriptionChild);
        transactionsRowsTitle?.appendChild(categoryChild);

        // eventhandler for sorting when clicking on column titles
        transactionsRowsTitle.addEventListener("click", this.clickHeaderSort);
    };

    updateAddTransRowBtn = (): void => {
        if (this.rows.filter((row) => !row.frozen).length > 0) {
            this.renderAddTransRowBtn(false);
        } else {
            this.renderAddTransRowBtn(true);
        }
    };

    renderAddTransRowBtn = (active: boolean): void => {
        // renders in 2 versions. Active / inactive
        // eventhandler on the container element listens for clicks on target where id = addTransRow
        // if any rows !frozen, render inactive. If not, render active.

        console.log("render add trans row");

        const addTransRowBtn = document.createElement("div");
        addTransRowBtn.id = "addTransRow";

        if (active) {
            addTransRowBtn.className = "bi bi-plus-circle-fill active";

            addTransRowBtn.addEventListener("click", () => {
                this.addRow();

                // why does this line not get called when clicking on the element?
                // - i think to 2 way binding error is causing this not to be read.
                // fix this and check if the update row button updates correctly...
                this.updateAddTransRowBtn();
            });
        } else {
            addTransRowBtn.className = "bi bi-plus-circle";
        }

        document.querySelector("#addTransRow")?.replaceWith(addTransRowBtn);
    };

    fetchTransactionDomElement = (): void => {
        const transactionRowDomElement: Element | null =
            document.querySelector(".transaction-rows");

        if (!transactionRowDomElement)
            throw "could not locate the transaction-row element";

        this.dom_element_ref = transactionRowDomElement;
    };

    private bindDomElementToObject = (): void => {
        // bindDomElement for CONTAINER
        if (!this.dom_element_ref.hasOwnProperty("getObject")) {
            Object.defineProperty(this.dom_element_ref, "getObject", {
                value: () => this,
                writable: false,
            });
        }
    };

    // QUERIES

    fetchTransactions = async (): Promise<TransactionRow[]> => {
        const transByBudgetId = await this.query.getTransactions(
            this.budget_id
        );

        const transByBudgetIdAndPeriod = transByBudgetId.filter(
            // datestring returned from db is interpreted as UTC and not our timezone
            // so date will be day - 1. Parsing it with new Date() this is
            // corrected, so the returned datestring is intepreted as our timezone.
            // This results in the right date, but with an extra hour or 2, irrelevant
            // for application to work. Thus new Date(...) may not be deleted.

            (trans) => {
                trans.date = new Date(trans.date);

                if (
                    trans.date.getFullYear() == PERIOD.YEAR &&
                    trans.date.getMonth() === PERIOD.MONTH
                ) {
                    // return transactions that matches the period currently rendered on budget page

                    return trans;
                }
            }
        );

        return transByBudgetIdAndPeriod.map(
            // parse trans.date with new Date as pr. the above comment

            (trans) =>
                new TransactionRow(
                    trans.id,
                    trans.name,
                    trans.amount,
                    new Date(trans.date),
                    trans.category_id,
                    trans.category_name,
                    true
                )
        );
    };
}

class TransactionContainerRender implements ITransactionContainerRender {
    frozen = (): Element => {
        return "new element";
    };

    header = (): Element => {
        return "new element";
    };
}

class MockTransactionQueries implements ITransactionQueries {
    getTransactions = async (budget_id: number): Promise<ITransaction[]> => {
        // getting raw categories in json
        const categoriesOfBudgetId = await this.getCategories(budget_id);

        // make map with id as key, name as value
        const categoriesIdNameMap = new Map();
        categoriesOfBudgetId?.forEach((category) =>
            categoriesIdNameMap.set(category.id, category.name)
        );

        // get transactions
        const allTransactions = await fetch(
            `http://localhost:3000/transactions`,
            {
                method: "GET",
            }
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error(String(res.status));
                }
                return res.json();
            })
            .catch((err) => {
                console.log(err);
            });

        // filter transactions with category_id within relevant budget_id
        const filteredTransactions = allTransactions.filter((transaction) =>
            Array.from(categoriesIdNameMap.keys()).includes(
                transaction.category_id
            )
        );

        // add category name to each transaction
        filteredTransactions.forEach(
            (transaction) =>
                (transaction.category_name = categoriesIdNameMap.get(
                    transaction.category_id
                ))
        );

        return filteredTransactions;
    };

    deleteTransaction = async (trans_id: number): Promise<boolean> => {
        // return status?

        return await fetch(`http://localhost:3000/transactions/${trans_id}`, {
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
    };

    postTransaction = (transaction: ITransaction): Promise<ITransaction> => {
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
                    throw new Error(res.status);
                }
                return res.json();
            })
            .catch((err) => {
                throw err;
            });
    };

    updateTransaction = async (
        transaction: ITransaction
    ): Promise<ITransaction> => {
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
                    throw res;
                }
                console.log("1: i just updated");
                return res.json();
            })
            .catch((err) => {
                throw err;
            });
    };

    getCategories = async (
        budgetId: number
    ): Promise<Category[] | undefined> => {
        try {
            const categoriesRaw = await fetch(
                "http://localhost:3000/categories"
            );
            const categoriesJson = await categoriesRaw.json();
            return categoriesJson.filter(
                (category) => category.budget_id == budgetId
            );
        } catch (error) {
            console.error(error);
        }
    };
}
