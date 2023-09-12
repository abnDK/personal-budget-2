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



class CategoryRow implements Category {
    name: string;
    amount: number;
    id: number;
    parent_id: number;
    budget_id: number;
    
    level: number;

    children: CategoryRow[];

    to_be_deleted: boolean;
    dom_element_ref: object | undefined;
    frozen: boolean;


    constructor(name: string, amount: number, id: number, parent_id: number, budget_id: number) {
        this.name = name;
        this.amount = amount;
        this.id = id;
        this.parent_id = parent_id;
        this.budget_id = budget_id;
        
        this.level = NaN;
        this.children = [];
        this.to_be_deleted = false;
        this.dom_element_ref = undefined;
        
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
        
        // why is this moved to the constructor?!
        this.dom_element_ref.remove(this.dom_element_ref);

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
    private _root: CategoryRow;
    private query: BudgetQueryService;

    

    constructor(rows: Category[], budgetRowsDomElement: Element) { 

        // # 36: just set rows directly..
        this.root = BuildTree(rows, 'parent_id');
                
        this.budgetRowsDomElement = budgetRowsDomElement;
        
        this.query = new BudgetQueryService()

        this.initRenderBudget()

        // # 36: Is this need anymore or should it be run automatically somewhere else?
        //this.renderCategories();



    }
    
    ///// GETTERS AND SETTERS \\\\\

    get editable(): boolean {
        
        return this._editable

    }

    set editable(state: boolean) {
                
        
        if (state) {
        
            this.renderEditableBudget();

        } else {
            
            /* 
            Freezing the budget in DOM consists of multiple steps
            1. fetching data from dom to budget object
            2. deleting any rows marked for deletion
            3. updating existing rows with values (while calculating sums as well)
            4. writing everything to the dom after db and budget object has been updated
            */


            // FETCHING DATA FROM DOM
            this.fetchDataFromDOM();

            console.log('After fetching data from DOM: ', this.rows)
            console.log('Status: SUCCESS')


            // DELETING ROWS
            this.deleteCategoryRows();

            console.log('After deleting categories in object and db: ', this.rows)
            console.log('Status: AWAITING')

            // UPDATING EXISTING ROWS
            this.updateCategoryRows();

            console.log('After updating categories with name, amount and parent_ids: ', this.rows)
            console.log('Status: AWAITING')

            // RENDER TO DOM
            this.renderFrozenBudget();

            console.log('After rendering budget to the DOM: ', this.rows)
            console.log('Status: SUCCESS')


        
        }
        
        this._editable = state;


    }

    
    // # 36: Reads this.root which is a tree. Should return the parsed array DFS. 
    get rows(): CategoryRow[] {

        return dfsTree(this.root)

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

    //// DOM INTERACTIONS \\\\

    

    initRenderBudget = (): void => {

        // inital rendering of budget when dom content has loaded.
        this.renderCategories(true);

    }

    fetchDataFromDOM = (): void => {

        console.log('called fetchDataFromDOM')

        for (let row of this.rows.filter(row=>row.name != 'root')) {
            
            row.readValuesFromDomElement()

        }

    }

    renderEditableBudget = (): void => {

        this.clearBudget();

        this.renderCategories(false)

    }

    renderFrozenBudget = (): void => {

        this.clearBudget();

        this.renderCategories(true)

    }

    clearBudget = (): void => {

        for (const DOMChild of Array.from(this.budgetRowsDomElement.children)) {

            DOMChild.remove(DOMChild)

        }

    }

    //// BUDGET MANIPULATION \\\\

    deleteCategoryRows = () => {

        console.log('waiting for some code to delete rows')

        for (const deletableRow of this.toDelete) {

            this.handleTransactionCategoryForeignKeyConstraint(deletableRow.id)

            this.handleCategoryParentIdForeignKeyConstraint(deletableRow.id, deletableRow.parent_id)

            this.deleteCategoryFromDB(deletableRow.id)

        }

        // either remove deletable rows from budget object, or make sure they will be filtered out



    }

    updateCategoryRows = () => {

        /* 
        
        get potentially updated parentIds

        write parentIds to CategoryRows

        rebuild tree with new parent_ids

        calculate sums

        update amount and value in db

        */


        console.log('waiting for some code to update rows')


    }

    //// DB QUERYING \\\\

    handleTransactionCategoryForeignKeyConstraint = async (categoryId: number) => {

        console.log('handling transaction category foreign key constraint')

        const transactionsWithCategoryId = await this.query.getTransactionsByCategoryId(categoryId);

        for (const transaction of transactionsWithCategoryId) {
            
            await this.query.updateCategoryIdOfTransaction(transaction.id, categoryId)

        }

    }

    handleCategoryParentIdForeignKeyConstraint = async (categoryIdToBeDeleted: number, newParentId: number) => {

        console.log('handling category parent_id foreign key constraint')

        const childrenOfDeletedCategory = await this.query.getCategoryChildren(categoryIdToBeDeleted);

        for (const categoryChild of childrenOfDeletedCategory) {

            await this.query.updateCategoryParentId(categoryChild.id, newParentId);

        }


    }

    deleteCategoryFromDB = (categoryId: number) => {

        console.log('deleting category from db')

    }
    












    
    
    syncDB = () => {
        // write amounts to db
        // get parent_id's from db
        // maybe render elements?


        for (const row of this.toKeep) {

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

        levelOneTree.forEach(row => {
        //this.toKeep.forEach(row => {

            if (frozen) {

                row.dom_element_ref = this.budgetRowsDomElement.appendChild(row.renderFrozen());

            } else {

                row.dom_element_ref = this.budgetRowsDomElement.appendChild(row.renderEditable());

            }

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

        // # 36: After change to .root tree as main datastructure,
        // this needs to be refactored in order to search for and 
        // delete a specific CategoryRow object.

        const removeCategoryRow = (root: CategoryRow[], id: number) => {

            for (const childIndex in root) {
                
                removeCategoryRow(root[childIndex].children, id)

                if (root[childIndex].id == id) {
                    return root.splice(Number(childIndex), 1);
                    
                }
            
            }

        }

        removeCategoryRow(this.root.children, id)

        //this.rows = this.rows.filter(row => row.id != id)

    }

    /* DOM ELEMENTS */

    
    private clearDOM = (): void => {        
        
        console.log('clearDOMthis: ', this)
        console.log('clearDOMrows: ', this.rows)

        

        // clears dom
        for (const row of this.rows.filter(row => row.name != 'root')) {

            console.log('clearDOMrow: ', row)

            row.removeDomElement();

        }

        // renderfrozen all + render editable all: clear dom, first.

    }

    private renderFrozenAll = (): void => {
        
        // this.clearDOM(); THIS ONE NEEDS TO BE FIXED...

        this.renderCategories(true) 

    }

    private renderEditableAll = (): void => {

        // this.clearDOM();
        
        this.renderCategories(false) 

    }

    syncFromDomElementToObject = (): void => {

        for (let row of this.rows.filter(row=>row.name != 'root')) {
            
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
