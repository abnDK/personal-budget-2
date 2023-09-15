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
    /* ADDROW: new: boolean is added here */


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

    budgetRowsDomElement: Element;
    sum: number;
    private _editable: boolean;
    private _root: CategoryRow;
    private query: BudgetQueryService;

    

    constructor(rows: Category[], budgetRowsDomElement: Element) { 

        this.root = BuildTree(rows);
                
        this.budgetRowsDomElement = budgetRowsDomElement;
        
        this.query = new BudgetQueryService()

        this.sum = this.root.amount;

        this.initRenderBudget()

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
            this.deleteCategoryRows()
                .then(() => {
                    console.log('After deleting categories in object and db: ', this.rows)
                    console.log('Status: AWAITING')

                    // UPDATING EXISTING ROWS
                    return this.updateCategoryRows();
                     
                })
                .then(() => {
                    console.log('After updating categories with name, amount and parent_ids: ', this.rows)
                    console.log('Status: AWAITING')
        
                    // RENDER TO DOM
                    return this.renderFrozenBudget();
                })
                .finally(() => {
                    console.log('After rendering budget to the DOM: ', this.rows)
                    console.log('Status: SUCCESS')
                });

        }
        
        this._editable = state;


    }

    
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

        const toDelete = this.rows.filter(row => row.to_be_deleted)

        // sorted by level (i.e. child before parent) to avoid FK constraint errors on backend.
        return toDelete.toSorted((a, b) => b.level - a.level)
        
    }

    /* ADDROW: get newRows() {} is added here */

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

        this.renderBudgetSum()

    }

    fetchDataFromDOM = (): void => {

        for (let row of this.rows.filter(row=>row.name != 'root')) {
            
            row.readValuesFromDomElement()

        }

    }

    renderEditableBudget = (): void => {

        this.clearBudget();

        this.renderCategories(false)

        this.renderBudgetSum()

    }

    renderFrozenBudget = (): void => {

        this.clearBudget();

        this.renderCategories(true)

        this.renderBudgetSum()

    }

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

    clearBudget = (): void => {

        for (const DOMChild of Array.from(this.budgetRowsDomElement.children)) {

            DOMChild.remove(DOMChild);

        }

    }

    renderBudgetSum = (): void => {

        document.querySelector('.budget-sum').innerText = `Budget sum: ${this.sum}`;

    }


    /* ADDROW: renderNewRow() is added here */

    //// BUDGET MANIPULATION \\\\

    deleteCategoryRows = async (): Promise<void> => {

        for (const deletableRow of this.toDelete) {

            await this.handleTransactionCategoryForeignKeyConstraint(deletableRow.id, deletableRow.parent_id)

            await this.handleCategoryParentIdForeignKeyConstraint(deletableRow.id, deletableRow.parent_id)
            
            await this.deleteCategoryFromDB(deletableRow.id)

        }

    }

    updateCategoryRows = async () => {
        
        // get potentially updated parentIds
        const categoriesParentIds = await this.query.getCategoriesParentIds(this.root.budget_id);

        // write parentIds to CategoryRows
        for (const {id, parentId} of categoriesParentIds) {

            this.rowById(id).parent_id = parentId;

        }

        /* ADDROW: rows wo parent_ids will have the id of their parent in the tree as parent_id */
        
        // rebuild budget tree only with the .toKeep rows
        this.root = BuildTree(this.toKeep);

        // calculate sums
        this.calculateBudgetSums();

        // update amount and value in db
        for (const cat of this.rows) {

            await this.query.updateCategoryNameAmount(cat.id, cat.name, cat.amount)

        }
       
    }

    calculateBudgetSums = (): void => {
        
        let sum: number = NaN

        const calcChildrenSum = (element: CategoryRow): number => {

            if (element.children.length) {

                element.amount = 0;
                
                for (const child of element.children) {

                    calcChildrenSum(child)
    
                    element.amount += child.amount
    
                }

            }

            return element.amount

        }

        this.root.amount = calcChildrenSum(this.root)

        this.sum = this.root.amount

    }

    rowById = (id: number): CategoryRow => {

        return this.rows.filter(row => row.id == id)[0]
    
    }

    removeById = (categoryId: number, root: CategoryRow = this.root): void => {

        // Finds category and removes.
        // If category has children, the children will be lifted 1 generation

        for (const child of root.children) {
            
            if (child.id == categoryId) {

                root.children = [...root.children.filter(child => child.id != categoryId), ...child.children]
                
                return 
            
            }

            this.removeById(categoryId, root);
        
        }

    }

    /* ADDROW: addNewRow() is added here */

    //// DB QUERYING \\\\

    handleTransactionCategoryForeignKeyConstraint = async (oldCategoryId: number, newCategoryId: number) => {

        const transactionsWithCategoryId = await this.query.getTransactionsByCategoryId(oldCategoryId);

        for (const transaction of transactionsWithCategoryId) {
            
            await this.query.updateCategoryIdOfTransaction(transaction.id, newCategoryId)

        }

    }

    handleCategoryParentIdForeignKeyConstraint = async (categoryIdToBeDeleted: number, newParentId: number) => {

        const childrenOfDeletedCategory = await this.query.getCategoryChildren(categoryIdToBeDeleted);

        for (const categoryChild of childrenOfDeletedCategory) {

            await this.query.updateCategoryParentId(categoryChild.id, newParentId);

        }


    }

    deleteCategoryFromDB = async (categoryId: number) => {

        await this.query.deleteCategory(categoryId);

    }
    
    /* ADDROW: postNewCategory() is added here */







//// OLD - CONSIDER DELETE \\\\ 




    
    
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
