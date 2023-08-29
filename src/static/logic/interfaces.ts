interface Transaction {
    id:number, 
    name:string, 
    amount:number, 
    date:Date, 
    category_id:string
}

interface Category {
    name:string,
    amount:number, 
    id:number, 
    parent_id:number, 
    budget_id:number
}


interface HTMLElementBudgetRow extends HTMLElement {
    //tagName: string,
    //className: string,
    //innerText: string,
    dataset: {id: string, parent_id: string},
    type: string,

}

interface HTMLElementBudgetRowEditable extends HTMLElementBudgetRow {
    dataset: {id: string, parent_id: string, to_be_deleted: boolean}
}
