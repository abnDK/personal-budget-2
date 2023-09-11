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
    ["1", 'category-parent'],
    ["2", 'category-child'],
    ["3", 'category-grandchild'],
    ['category-parent', '1'],
    ['category-child', '2'],
    ['category-grandchild', '3']
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
    //rows: CategoryRow[];
    //root: Category
    budgetRowsDomElement: Element;
    sum: number;
    private _editable: boolean;

    

    constructor(rows: Category[], budgetRowsDomElement: Element) { 

        // # 36: just set rows directly..
        this.rows = rows;
        
        this.sum = 0;
        
        this._editable = false; // make a setter, than when this is changed to true, will render all frozen rows as editable/input type

        this.budgetRowsDomElement = budgetRowsDomElement;
        
        // # 36: Is this need anymore or should it be run automatically somewhere else?
        this.renderCategories();



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

    set rows(rows: Category[]) {
            // # 36: make buildtree run and write it to this.root as well.
            this._rows = rows;
            this._root = BuildTree(rows, 'parent_id')
        }
    
    // # 36: Reads this.root which is a tree. Should return the parsed array DFS. 
    get rows(): CategoryRow[] {

        const categoryRowsTreeAsArray = dfsTree(this.root)

        this._rows = categoryRowsTreeAsArray.map(category => {
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

    rowsByLevel = (rootLevel: number = 0) => {
        return this.rows.filter(row => row.level >= rootLevel)
    }

    set root(newRoot) {
        this._root = newRoot
    }

    get root() {

        return this._root

    }

    get toKeep() {
        
        return this.rows.filter(row => !row.to_be_deleted)

    }

    get toDelete() {
        
        return this.rows.filter(row => row.to_be_deleted)

    }

    get loners() {
        // return elements closest to the root and not having any children

        const parentIdsOfChildren = Array.from(new Set(this.children.map(child => child.parent_id)))

        return this.parents.filter(row => !parentIdsOfChildren.includes(row.id))
    }

    get parents() {

        return this.rows.filter(row => !row.to_be_deleted && row.level === Number(LevelClassMap.get('category-parent')))
        
    }

    get children() {

        return this.rows.filter(row => !row.to_be_deleted && row.level === Number(LevelClassMap.get('category-child')))
    
    }

    get grandChildren() {

        return this.rows.filter(row => !row.to_be_deleted && row.level === Number(LevelClassMap.get('category-grandchild')))

    }

    syncDB = () => {
        // write amounts to db
        // get parent_id's from db
        // maybe render elements?

        console.log('rows before syncing: ', this.rows)
        console.log('to keep before syncing: ', this.toKeep)

        for (const row of this.toKeep) {

            console.log("syncing this row now: ", row)

            row.syncNameAmountParentIdWithDB()

        }

    }

    addRow = (row: CategoryRow) => {
        
        this.rows.push(row)
    
    }

    rowById = (id: number): CategoryRow => {

        return this.rows.filter(row => row.id == id)[0]
    
    }

    rowsByParentId = (parent_id: number): CategoryRow[] => {

        return this.rows.filter(row => row.parent_id == parent_id);

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

    // # 36: when this is run - filter out root.
    renderCategories = (frozen: boolean = true): void => {
        /* Only for initial population of category rows to the budget */
        // Array.from(this.root.children).forEach(child=>child.remove(child)); // remove all children from budget-rows root node. Should not be necessary on initial population though
        
        // test "rootLevel" filter on rows:
        const levelOneTree = this.rowsByLevel(1);
        console.log(levelOneTree)

        levelOneTree.forEach(row => {
        //this.toKeep.forEach(row => {

            if (frozen) {

                this.budgetRowsDomElement.appendChild(row.renderFrozen());

            } else {

                this.budgetRowsDomElement.appendChild(row.renderEditable());

            }
            
            row.dom_element_ref = this.budgetRowsDomElement.lastElementChild // bind dom element ref to row object
        
        });

    }

    removeDeletable = (): void => {
        console.log('called removeDeletable')
        for (const row of this.toDelete) {
        
            console.log("NOW DELETING: ", row)

            console.log('before delete: ', this.rows)

            // removing row in BUDGET object
            this.removeById(row.id)

            console.log('after delete: ', this.rows)

            // removing row in DOM
            row.dom_element_ref.remove(row.dom_element_ref);

        

        }

    }

    removeById = (id:number): void => {

        this.rows = this.rows.filter(row => row.id != id)

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

        this.renderCategories(true) 

    }

    private renderEditableAll = (): void => {

        this.clearDOM();
        
        this.renderCategories(false) 

    }

    syncFromDomElementToObject = (): void => {

        for (let row of this.rows) {
            
            row.readValuesFromDomElement()

        }

    }
    
    /* CALCULATE SUMS */ // #36: remake all of these, so they work with N levels of the tree. Total sum can be written to root-element
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
            try {
                this.rowById(id).amount = amount;

            } catch(err) {
                console.log("rows: ", this.rows)
                console.log('root: ', this.root)
                throw `could not recognize id: ${id}`
            }
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
