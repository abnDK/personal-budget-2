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
    budget_id?:number
    level?: number,
    children?: Category[],
    dom_element_ref?: object

}



class CategoryRow implements Category {
    name: string;
    amount: number;
    id: number;
    parent_id: number;
    level: number;
    budget_id: number | undefined;
    children: Category[] | undefined;
    to_be_deleted: boolean;
    //element: Element;
    dom_element_ref: object | undefined;
    frozen: boolean;


    constructor(name: string, amount: number, id: number, parent_id: number, level: number, budget_id?: number, children?: Category[]) {
        this.name = name;
        this.amount = amount;
        this.id = id;
        this.parent_id = parent_id;
        this.level = level;
        this.budget_id = budget_id;
        this.children = children;
        
        this.to_be_deleted = false;
        this._dom_element_ref = undefined;
        
    }

    get element(): Element {

        return this.renderFrozen();
    
    }

    get editableElement(): Element {

        return this.renderEditable();

    }

    get dom_element_ref(): object {
        // return dom element
        return this._dom_element_ref
    }

    set dom_element_ref(new_ref: object) {
        
        this._dom_element_ref = new_ref
    }

    replaceDomElementRef(new_ref: object): void {

        this.dom_element_ref.replaceWith(new_ref);

        this.dom_element_ref = new_ref;

    }

    removeDomElement = (): void => {

        this.dom_element_ref.remove(this.dom_element_ref)

    }


    renderFrozen() {

        this.frozen = true;
  
        return createBudgetRow(this);
    
    }

    renderEditable() {
        
        this.frozen = false;

        return createEditableBudgetRow(this);
    
    }

    readValuesFromDomElement(): void {

        if (this.dom_element_ref == undefined) {
            throw new Error('Object == undefined. Cannot extract values.')
        }
        
        if (this.frozen) {
            
            // extract values from frozen element

            const name: string = this.dom_element_ref.querySelector('.category-name').innerText;

            const amount: number = Number(this.dom_element_ref.querySelector('.category-amount').innerText);

            this.name = name;

            this.amount = amount;

        } else {
            
            // extract values from editable element

            const name: string = this.dom_element_ref.querySelector('.category-name').value;

            const amount: number = Number(this.dom_element_ref.querySelector('.category-amount').value);

            this.name = name;

            this.amount = amount;

        } 
    }

    async syncNameAmountParentIdWithDB(): Promise<void> {

        const updatedCategoryRow = await updateCategoryNameAmountRequest(this);

    }
}

const LevelClassMap = new Map([
    ["0", 'category-parent'],
    ["1", 'category-child'],
    ["2", 'category-grandchild'],
    ['category-parent', '0'],
    ['category-child', '1'],
    ['category-grandchild', '2']
])


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



class Budget {
    rows: CategoryRow[];
    root: Element;
    sum: number;
    private _editable: boolean;

    

    constructor(rows: Category[], budgetRowsRoot: Element) { 

        this.rows = this.parseCategoryArray(rows);
        
        this.sum = 0;
        
        this._editable = false; // make a setter, than when this is changed to true, will render all frozen rows as editable/input type

        this.root = budgetRowsRoot;
        
        this.populateRoot();



    }

    get editable(): boolean {
        
        return this._editable

    }

    set editable(state: boolean) {
                
        
        if (state) {
        
            this.renderEditableAll();
        
        } else {
        
            this.renderFrozenAll();
        
        }
        
        this._editable = state;


    }

    get toKeep() {
        
        return this.rows.filter(row => !row.to_be_deleted)

    }

    get toDelete() {
        
        return this.rows.filter(row => row.to_be_deleted)

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

    syncDB = () => {
        // write amounts to db
        // get parent_id's from db
        // maybe render elements?

        console.log('rows before syncing: ', this.rows)
        console.log('to keep before syncing: ', this.toKeep)

        for (const row of this.rows) {

            console.log("syncing this row now: ", row)

            row.syncNameAmountParentIdWithDB()

        }

    }

    addRow = (row: CategoryRow) => {
        
        this.rows.push(row)
    
    }

    rowById = (id: number) => {

        return this.rows.filter(row => row.id == id)[0]
    
    }

    parseCategoryArray = (categories: Category[]): CategoryRow[] => {
        
        const categoryRowsTree = BuildTree(categories, 'parent_id');
    
        const categoryRowsTreeAsArray = dfsTree(categoryRowsTree)

        this.rows = categoryRowsTreeAsArray.map(category => {
            let categoryRow = new CategoryRow(
                category['name'],
                category['amount'],
                category['id'],
                category['parent_id'],
                category['level'],
                category['budget_id'],
                category['children']
            )

            return categoryRow

        })

        

        return this.rows
        
    }

    populateRoot = (frozen: boolean = true): void => {
        /* Only for initial population of category rows to the budget */
        // Array.from(this.root.children).forEach(child=>child.remove(child)); // remove all children from budget-rows root node. Should not be necessary on initial population though
        
        this.toKeep.forEach(row => {

            if (frozen) {

                this.root.appendChild(row.renderFrozen());

            } else {

                this.root.appendChild(row.renderEditable());

            }
            
            row.dom_element_ref = this.root.lastElementChild // bind dom element ref to row object
        
        });

    }

    removeDeletable = (): void => {
        console.log('called removeDeletable')
        for (const row of this.toDelete) {
        
            console.log("NOW DELETING: ", row)

            console.log('before delete: ', this.rows)

            // removing row in BUDGET object
            const indexOfRow = this.rows.indexOf(row);

            this.rows.splice(indexOfRow, 1);

            console.log('after delete: ', this.rows)

            // removing row in DOM
            row.dom_element_ref.remove(row.dom_element_ref);

        

        }

    }

    /* DOM ELEMENTS */

    private clearDOM = (): void => {

        // clears dom
        for (const row of this.rows) {

            row.removeDomElement();

        }

        // renderfrozen all + render editable all: clear dom, first.

    }

    private renderFrozenAll = (): void => {
        
        this.clearDOM();

        this.populateRoot(true) 

    }

    private renderEditableAll = (): void => {

        this.clearDOM();
        
        this.populateRoot(false) 

    }

    syncFromDomElementToObject = (): void => {

        for (let row of this.rows) {
            
            row.readValuesFromDomElement()

        }

    }
    
    /* CALCULATE SUMS */
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
    
    
}
