interface Transaction {
    id:number, 
    name:string, 
    amount:number, 
    date:Date, 
    category_id:string
}

// for use when getting category data from db
interface Category {
    name:string,
    amount:number, 
    id:number, 
    parent_id:number, 
    budget_id:number
}

// for use when handling budget-row elements in the dom
interface CategoryRow extends Category {
    level?: number,
    to_be_deleted?: boolean,
    element?: HTMLElement
}


/* 
class CategoryRow {
    id: number;
    name: string;
    level: number;
    amount: number;
    parent_id: number;
    to_be_deleted: boolean;
    element: HTMLElement;

    constructor(id: number, name: string, level: number, amount: number, parent_id: number, to_be_deleted: boolean, element: HTMLElement) {
        this.id = id
        this.name = name
        this.level = level
        this.amount = amount
        this.parent_id = parent_id
        this.to_be_deleted = to_be_deleted
        this.element = element
    }
}

 */

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



class CategoryTree {
    rows: CategoryRow[];
    sum: number;


    constructor() {
        this.rows = [];
        this.sum = 0;
    }

    addRow = (row: CategoryRow) => {
        this.rows.push(row)
    }

    rowById = (id: number) => {

        return this.rows.filter(row => row.id === id)[0]
    }

    renderFrozen = () => {

    }

    renderEditable = () => {
        for (const row of this.rows) {
            let frozenElement = createBudgetRow({
                name: row.name,
                amount: row.amount,
                id: row.id,
                parent_id: row.parent_id
            }, 2)
            row.element = frozenElement
            console.log(row);
            
        }
    }

    calcSums = () => {
        this.calcBudgetSumsOfChildren();
        this.calcBudgetSumsOfParents();
        this.calcBudgetTotalSum();
        
    }

    private calcBudgetSumsOfChildrenMap = () => {
        const childrenSumsMap: Map<number, number> = new Map();
        
        for (const grandChild of this.grandChildren) {
            if (childrenSumsMap.has(grandChild.parent_id)) {
                let prevVal: number = childrenSumsMap.get(grandChild.parent_id);
                childrenSumsMap.set(grandChild.parent_id, prevVal += grandChild.amount)
            } else {
                childrenSumsMap.set(grandChild.parent_id, grandChild.amount)
            }
        }
    
        return childrenSumsMap;
    }

    private calcBudgetSumsOfChildren = () => {
        const childrenSumMap = this.calcBudgetSumsOfChildrenMap();
        
        for (const [id, amount] of childrenSumMap) {
            this.rowById(id).amount = amount;
        }

    }
    
    private calcBudgetSumsOfParentsMap = () => {
        const parentsSumsMap: Map<number, number> = new Map();
        
        for (const child of this.children) {
            if (parentsSumsMap.has(child.parent_id)) {
                let prevVal = parentsSumsMap.get(child.parent_id);
                parentsSumsMap.set(child.parent_id, prevVal += child.amount)
            } else {
                parentsSumsMap.set(child.parent_id, child.amount)
            }
        }
    
        return parentsSumsMap;
    }

    private calcBudgetSumsOfParents = () => {
        const parentsSumMap = this.calcBudgetSumsOfParentsMap();

        for (const [id, amount] of parentsSumMap) {
            this.rowById(id).amount = amount;
        }
    }
    
    private calcBudgetTotalSum = (): void => {
        let budgetTotalSum: number = 0;
        
        for (let parent of this.parents) {
            budgetTotalSum += parent.amount
        }
    
        this.sum = budgetTotalSum;
    }
    
    

    get roots() {
        const parentIdsOfChildren = Array.from(new Set(this.children.map(child => child.parent_id)))

        return this.parents.filter(row => !parentIdsOfChildren.includes(row.id))
    }

    get parents() {

        return this.rows.filter(row => !row.to_be_deleted && row.level === 0)

        
    }

    get children() {
        return this.rows.filter(row => !row.to_be_deleted && row.level === 1)
    }

    get grandChildren() {


        return this.rows.filter(row => !row.to_be_deleted && row.level === 2)

    }
}
