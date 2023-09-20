

/* 

MAKE CLASS DIAGRAM BEFORE MOVING ON

*/




class Transaction implements ITransaction {
    id: number;
    name: string;
    amount: number;
    date: Date;
    category_id: string;
    render: ITransactionRender;
    dom_element_ref: Element;

    constructor(id: number, name: string, amount: number, date: Date, category_id: string, render: ITransactionRender) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.date = date;
        this.category_id = category_id;
        this.render = render;
        this.dom_element_ref = render.editable() // this also needs to be linked to the dom - how ?
    }



}


class TransactionRender implements ITransactionRender {

    frozen(): Element {
        
        return new Element

    }

    editable(): Element {
        
        return new Element

    }
}


class TransactionContainer implements ITransactionContainer {

    rows: Transaction[];
    dom_element_ref: Element;
    query: ITransactionQueries;
    budget_id: number;


    constructor(query: ITransactionQueries, budget_id: number) {
        this.query = query;
        this.budget_id = budget_id;
        this.rows = this.query.getTransactions(this.budget_id);
        this.dom_element_ref = this.query.getTransactionContainerDomElement()
    }   

}