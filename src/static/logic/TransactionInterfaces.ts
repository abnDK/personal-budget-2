

interface ITransactionPage {
    container: ITransactionContainer,
    title: {
        value: string,
        element: HTMLElement
    }
    controls: { // this is the "subheader" section with different global controls such as "add row" etc.
        addRowBtn: HTMLElement
    },
    init(): void, // calls init on container and renders addRowBtn
    renderAddTransRowBtn(active: boolean): void,
    updateAddRowBtnState(): void,
    getTitleElement(): HTMLElement,
    getAddRowBtnElement(): HTMLElement
}




interface ITransactionContainer {
    _rows: TransactionRow[],
    dom_element_ref: Element,
    query: ITransactionQueries,
    renderer: ITransactionContainerRender,
    budget_id: number
    editing: boolean
    sortedBy: {key: string, asc: boolean}
    page: ITransactionPage

    // init
    init(): Promise<void>;

    // add/remove data
    addRow(): void; // init empty TransactionRow and add to rows. Render editable and add to dom.
    removeRow(row: TransactionRow): void; // delete in db. remove from rows. remove from dom.
    splitRow(id: number): void; // dont implement yet, but a CR for later
    saveRow(row: TransactionRow): void; // call saveRow on Transaction. Write to db. Render Trans frozen (returned from Trans.saveRow()) and return to dom.

    // rendering (on init) and dom interaction
    renderTransactions(): void; // call render frozen() and header() and return combined. Add to dom.
    renderHeader(): void;
    fetchTransactionDomElement(): void;

    // querying
    fetchTransactions(): Promise<TransactionRow[]>; // populate this.rows with Transaction data

    

    



}

interface ITransaction {
    id:number, 
    name:string, 
    amount:number, 
    date:Date, 
    category_id: number | undefined,
    category_name: string | undefined
}
    



interface ITransactionRow extends ITransaction {
    
    renderer: ITransactionRowRender
    dom_element_ref: HTMLElement;
    frozen: boolean;

    isValid(): boolean; // check if data is valid for writing to db.

    render(): HTMLElement; // reads dome_state, and render appropiate type
    renderFrozen(): HTMLElement;
    renderEditable(): HTMLElement;
    fetchEditableValues(): void; // fetches values from editable dom element and write to object

    bindDomElementToObject(): void; // 2 way binding 
}

interface ITransactionRowRender {
    frozen(row: TransactionRow): HTMLElement;
    editable(row: TransactionRow): HTMLElement;
}


interface ITransactionContainerRender {
    
    frozen(): Element; // render transactions in init state
    header(): Element;
    
}

interface ITransactionQueries {

    getTransactions(budget_id: number): Promise<ITransaction[]>; // GET request api, filters on budget_id

    deleteTransaction(trans_id: number): Promise<boolean>; // return status?

    postTransaction(transaction: ITransaction): {id: string, name: string, amount: string, date: string, category_id: string, recipient: string, comment:string}; // return status?

    updateTransaction(transaction: ITransaction): {id: string, name: string, amount: string, date: string, category_id: string, recipient: string, comment:string};

    getCategories(budgetId: number): Promise<Category[] | undefined>;

}


