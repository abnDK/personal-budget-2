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

    addChild = (): CategoryRow => {
        
        if (this.level === 3) throw 'cannot add child to grandchild/level 3 category in budget'

        const newRow = new CategoryRow(
            
            "", 0, NaN, this.id, this.budget_id

        )

        newRow.level = this.level + 1;

        this.children.push(newRow);

        return newRow

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

        this.dom_element_ref = createBudgetRow(this);

        this.bindDomElementToObject();
  
        return this.dom_element_ref
    
    }

    renderEditable() {
        
        this.frozen = false;

        this.dom_element_ref = createEditableBudgetRow(this);

        this.bindDomElementToObject();

        return this.dom_element_ref
    
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

    async syncNameAmountParentIdWithDB(): Promise<void> { // POSSIBLY NOT IN USE - CONSIDER DELETE
        throw 'POSSIBLY NOT IN USE - CONSIDER DELETE - REMOVE MARK IF THIS IS THROWN'
        const updatedCategoryRow = await updateCategoryNameAmountRequest(this);

    }

    private bindDomElementToObject = (): void => {

        Object.defineProperty(
            this.dom_element_ref,
            'getObject',
            {
                value: () => this,
                writable: false
            }
                
        )

    }

    focusOnElement = (): void => {

        if (this.frozen) {

            throw 'can only focus on editable elements'

        }

        this.dom_element_ref.querySelector('.category-name').focus();

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
    private id: number;

    

    constructor(rows: Category[], budgetRowsDomElement: Element) { 

        this.root = BuildTree(rows);
                
        this.budgetRowsDomElement = budgetRowsDomElement;

        this.id = parseInt(window.location.href.split("/").at(-1)) ?? "unknowns budget_id"
        
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

            // show addRow button
            document.querySelector("#addRow").hidden = false;



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

            // hide addRow button when not editable any more
            document.querySelector("#addRow").hidden = true;


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
        
        // we dont keep rows marked to be deleted or with no name
        return this.rows.filter(row => !row.to_be_deleted && row.name != '')

    }

    get toDelete() {

        const toDelete = this.rows.filter(row => row.to_be_deleted)

        // sorted by level (i.e. child before parent) to avoid FK constraint errors on backend.
        return toDelete.toSorted((a, b) => b.level - a.level)
        
    }

    get newRows() {

        return this.rows.filter(row => !row.id && this.toKeep.includes(row))

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

        this.renderBudgetSum();



    }

    fetchDataFromDOM = (): void => {

        for (let row of this.rows.filter(row=>row.name != 'root')) {
            
            row.readValuesFromDomElement()

        }

    }

    renderCategories = (frozen: boolean = true): void => {

        /* Only for initial population of category rows to the budget */
        // Array.from(this.root.children).forEach(child=>child.remove(child)); // remove all children from budget-rows root node. Should not be necessary on initial population though
        
        // test "rootLevel" filter on rows:
        const levelOneTree: CategoryRow[] = this.rowsByLevel(1);

        levelOneTree.forEach(row => {
        //this.toKeep.forEach(row => {

            if (frozen) {

                //row.dom_element_ref = this.budgetRowsDomElement.appendChild(row.renderFrozen());
                this.budgetRowsDomElement.appendChild(row.renderFrozen());


            } else {

                // row.dom_element_ref = this.budgetRowsDomElement.appendChild(row.renderEditable());
                this.budgetRowsDomElement.appendChild(row.renderEditable());

            }

        });

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

    

    clearBudget = (): void => {

        for (const DOMChild of Array.from(this.budgetRowsDomElement.children)) {

            DOMChild.remove(DOMChild);

        }

    }
    
    renderNewRow = (newRow: CategoryRow): void => {

        newRow.dom_element_ref = newRow.renderEditable()

        // get parent element and add child node immediatly after this
        const childrenArray = Array.from(BUDGET.budgetRowsDomElement.children)
        const indexOfParent = childrenArray.findIndex((categoryRow) => categoryRow.dataset.id == newRow.parent_id)
        const parentElement = childrenArray[indexOfParent]
        
        parentElement.replaceWith(
            parentElement,
            newRow.dom_element_ref
            )
            
        
        // Set focus on the new child elements name-field
        newRow.focusOnElement()

    } 

    //// BUDGET MANIPULATION \\\\

    deleteCategoryRows = async (): Promise<void> => {

        for (const deletableRow of this.toDelete) {

            // skip new rows, that has not been saved to db yet and thus no id have
            if (!deletableRow.id) continue

            await this.handleTransactionCategoryForeignKeyConstraint(deletableRow.id, deletableRow.parent_id)

            await this.handleCategoryParentIdForeignKeyConstraint(deletableRow.id, deletableRow.parent_id)
            
            await this.deleteCategoryFromDB(deletableRow.id)

        }

    }

    updateCategoryRows = async () => {
        
        console.log('getting new rows: ', this.newRows)

        // add post new row function here
        // think the rest will work if BuildTree sets parent_id on children rows?
        for (const cat of this.newRows) {

            cat.id = await this.addNewCategoryToDB(cat)

            for (const child of cat.children) {

                child.parent_id = cat.id

            }

        }

        // get potentially updated parentIds
        const categoriesParentIds = await this.query.getCategoriesParentIds(this.root.budget_id);

        // write parentIds to CategoryRows
        for (const {id, parentId} of categoriesParentIds) {
            
            // filter out new rows (has id == NaN)
            if (!Number.isNaN(parentId)) {

                this.rowById(id).parent_id = parentId;

            }
            
        }

        /* ADDROW: rows wo parent_ids will have the id of their parent in the tree as parent_id */
        
        // rebuild budget tree only with the .toKeep rows
        this.root = BuildTree(this.toKeep);

        // calculate sums
        this.calculateBudgetSums();

        // update amount and value in db
        for (const cat of this.rows) {

            // if not new, update database with new values

            console.log('inside updateCategoryRows: Now updating cat: ', cat)


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

    addNewRow = (parent_id: number): void => {
        // both creates new row object and renders to dom, as
        // this will only be possible when in editable mode.

        const newRow = this.rowById(parent_id).addChild();

        BUDGET.renderNewRow(newRow)

    }

    //// DB QUERYING \\\\

    handleTransactionCategoryForeignKeyConstraint = async (oldCategoryId: number, newCategoryId: number): Promise<void> => {

        const transactionsWithCategoryId = await this.query.getTransactionsByCategoryId(oldCategoryId);

        for (const transaction of transactionsWithCategoryId) {
            
            await this.query.updateCategoryIdOfTransaction(transaction.id, newCategoryId)

        }

    }

    handleCategoryParentIdForeignKeyConstraint = async (categoryIdToBeDeleted: number, newParentId: number): Promise<void> => {

        const childrenOfDeletedCategory = await this.query.getCategoryChildren(categoryIdToBeDeleted);

        for (const categoryChild of childrenOfDeletedCategory) {

            try {

                await this.query.updateCategoryParentId(categoryChild.id, newParentId);

            } catch (err) {
                console.error(err)
            }

        }


    }

    deleteCategoryFromDB = async (categoryId: number): Promise<void> => {

        await this.query.deleteCategory(categoryId);

    }
    
    addNewCategoryToDB = async (category: CategoryRow): Promise<number> => {

        const newCat =  await this.query.postNewCategory(
            category.name,
            category.amount,
            category.parent_id,
            category.budget_id
        )

        console.log('newCat just posted: ', newCat)

        return newCat.id

    }







//// OLD - CONSIDER DELETE \\\\ 




    
    
    syncDB = () => {

        throw 'syncDB-deprecated, if not in use?'

        // write amounts to db
        // get parent_id's from db
        // maybe render elements?


        for (const row of this.toKeep) {

            row.syncNameAmountParentIdWithDB()

        }

    }

    addRow = (row: CategoryRow) => {

        throw 'addRow-deprecated, if not in use?'

        
        this.rows.push(row)
    
    }

    rowsByParentId = (parent_id: number): CategoryRow[] => {

        throw 'rowsByParentId-deprecated, if not in use?'


        return this.rows.filter(row => row.parent_id == parent_id);

    }

    parseCategoryArray = (categories: Category[]): CategoryRow[] => {

        throw 'parseCategoryArray-deprecated, if not in use?'

        
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
        throw 'removeDeletable-deprecated, if not in use?'

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
    
    /* 
    removeById = (id:number): void => {
        throw 'removeById-deprecated, if not in use?'


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
     */
    /* DOM ELEMENTS */

    /* 
    private clearDOM = (): void => {        
        throw 'clearDOM-deprecated, if not in use?'
        
        console.log('clearDOMthis: ', this)
        console.log('clearDOMrows: ', this.rows)

        

        // clears dom
        for (const row of this.rows.filter(row => row.name != 'root')) {

            console.log('clearDOMrow: ', row)

            row.removeDomElement();

        }

        // renderfrozen all + render editable all: clear dom, first.

    }
    */
   /* 
    private renderFrozenAll = (): void => {
        throw 'renderFrozenAll-deprecated, if not in use?'
        
        // this.clearDOM(); THIS ONE NEEDS TO BE FIXED...

        this.renderCategories(true) 

    }
    */
   /* 
    private renderEditableAll = (): void => {
        throw 'renderEditableAll-deprecated, if not in use?'

        // this.clearDOM();
        
        this.renderCategories(false) 

    }
     */
    /* 
    syncFromDomElementToObject = (): void => {
        throw 'syncFromDomElementToObject-deprecated, if not in use?'

        for (let row of this.rows.filter(row=>row.name != 'root')) {
            
            row.readValuesFromDomElement()

        }

    }
     */
    /* CALCULATE SUMS */ // #36: remake all of these, so they work with N levels of the tree. Total sum can be written to root-element
    
    /*
    calcSums = () => {
        throw 'calcSums-deprecated, if not in use?'

        this.calcBudgetSumsOfChildren();
        
        this.calcBudgetSumsOfParents();
        
        this.calcBudgetTotalSum();
        
    }

    private calcBudgetSumsOfChildrenMap = () => {
        throw 'deprecated, if not in use?'
        
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
        throw 'deprecated, if not in use?'
        
        const childrenSumMap = this.calcBudgetSumsOfChildrenMap();
        
        for (const [id, amount] of childrenSumMap) {
        
            this.rowById(id).amount = amount;
        
        }

    }
    
    private calcBudgetSumsOfParentsMap = () => {
        throw 'deprecated, if not in use?'

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
        throw 'deprecated, if not in use?'

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
        throw 'deprecated, if not in use?'

        let budgetTotalSum: number = 0;
        
        for (let parent of this.parents) {
            budgetTotalSum += parent.amount
        }
    
        this.sum = budgetTotalSum;
    }
    
    */

    renderBudgetSum = (): void => {

        // dont forget this

        console.log('rendering sum...')

        document.querySelector('.budget-sum').innerText = `Budget sum: ${this.sum}`;

    }



    
}
