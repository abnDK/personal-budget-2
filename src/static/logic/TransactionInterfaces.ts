interface ITransactionContainer {
    rows: Transaction[],
    dom_element_ref: Element,
    query: ITransactionQueries,
    budget_id: number

}

interface ITransaction {
    id:number, 
    name:string, 
    amount:number, 
    date:Date, 
    category_id:string,
    render: ITransactionRender
    dom_element_ref: Element;
}

interface ITransactionRender {
    frozen(): Element;
    editable(): Element;
}

interface ITransactionQueries {

    getTransactionContainerDomElement(): Element;

    getTransactions(budget_id: number): Transaction[]; // GET request api, filters on budget_id

}


