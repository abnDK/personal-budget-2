/* IS THIS EVER CALLED?*/
const getCategoriesAsTree = async function() {
    
    const categoriesRandomData = await fetch('http://localhost:3000/categories')
    const categoriesRandomJson = await categoriesRandomData.json()
    
    return BuildTree(categoriesRandomJson, 'parent_id');

    return 

    return fetch(
        'http://localhost:3000/categories'
    ).then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status))
        }
        return res.text()
    }).then((res) => {
            return BuildTree(JSON.parse(res), 'parent_id');
        }
    ).catch(
        (err) => {
            throw new Error(err);
        })
}

// TRANSACTION REQUESTS

// GET TRANSACTIONS
const getTransactions = function(): Promise<Array<Transaction>> {
    return fetch(`http://localhost:3000/transactions`, {
        method: 'GET'
    }).then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status))
        }
        return res.json()
    }).catch((err) => {throw new Error(err)})
}

const getTransactionsByCategoryId = async function(category_id: number): Promise<Transaction[]> { 
    const transactions = await getTransactions();
    const filteredTransactions: Transaction[] = transactions.filter(transaction => transaction.category_id == category_id);
    return filteredTransactions
};

const deleteCategoryRequest = function(category_id: number): Promise<Category> {

    return fetch(`http://localhost:3000/categories/${category_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then((res)=>{
        if (!res.ok) {
            throw new Error(String(res.status))
        }

        return res.json()
    })
    .catch((err)=> {throw new Error(err)})
}

// CATEGORY REQUESTS

const getCategories = async function(): Promise<Category[] | undefined> {
    try {
        const categoriesRaw = await fetch('http://localhost:3000/categories')
        return await categoriesRaw.json();
    } catch (error) {
        console.error(error)
    }
}

const handleCategoryTransactionForeignKeyConstraint = async function(category_id: number): Promise<void> {
    /**
     * when deleting a category, we first need to handle
     * any transactions who has a foreign key relation 
     * with the category.
     * 
     * If the category is a parent (with or without children), 
     * transactions will have their category_id set to null.
     * If category is a child or grandchild, the transactions
     * will have their category_id set to the parent of
     * the category. I.e child => parent and grandchild => child.
     */
    
    const transactions: Transaction[] = await getTransactionsByCategoryId(category_id)

    const category: Category = await categoryById(category_id);

    let newCategoryId: number | null = (category.parent_id || null);


    console.log("cat id: ", category_id)
    console.log("category: ", category)
    console.log("cat parent id (true, type): ", category.parent_id, "(", (category.parent_id), typeof category.parent_id, ")")
    console.log((category.parent_id || "parent id not truthy"))
    // const newCategoryId = (category.parent_id || null)

    if (transactions.length) {

        for (const transaction of transactions) {

            await updateCategoryIdOfTransaction(transaction.id, newCategoryId);

        }

    }



}

// DELETE CATEGORIES / BUDGET ROWS
const deleteCategory = async function(category_id: number): Promise<Category> {
    
    /**
     * Delete category and handle foreign key relationships
     * with transactions (first) and other categories (second).
     * 
     * If deleted catageory is a grandchild or child 
     * with no grandchildren, it is just deleted.
     * If is has children or grandchildren, they
     * will be related to the parent of the deleted
     * category. If the deleted category is a parent
     * node, no parent_id exists, thus children nodes
     * will become parent nodes with no parent_id
     * themselves.
     * 
     * | DELETED CATEGORY   | CHILDREN?         | ACTION                            |
     * ==============================================================================
     * | root/no children   | none              | delete instantly                  |
     * | parent             | child(ren)        | child.parent_id = null            |
     * | child              | none              | delete instantly                  |
     * | child              | grandchild(ren)   | grandchild.parent_id = parent.id  |
     * | grandchild         | none              | delete instantly                  |
     * 
     */

    const category: Category = await categoryById(category_id);

    if (!category) {
        throw new Error(`cannot deleted category not existing in db. Id = ${category_id}`)
    }
        
    // All transactions with relation to category_id has it changed to parent of category, or null if category is parent/root element
    await handleCategoryTransactionForeignKeyConstraint(category_id);

    const childrenCategories: Category[] = await getCategoryChildren(category_id);
    console.log("children of ", category_id, " is ", childrenCategories)

    // handle foreign key relation to other categories (parent_id)
    for (let child of childrenCategories) {

        child.parent_id = category.parent_id;
        
        await updateCategoryRequest(child);
    
    }

    // Delete category after all relations from transactions and categories has been removed.
    
    
    return await deleteCategoryRequest(category_id);
    

   
}

const getCategoryChildren = async function(category_id: number): Promise<Category[]> {

    const categories: Category[] = await getCategories();

    return categories.filter(cat => cat.parent_id == category_id);

} 

const deleteCategories = async function(ids:number[]): Promise<Category[]> {
    // array of id's (string)
    // create multiple promises (from deleteCategory) and
    // await all promises to resolve.
    // returning true means every delete request came back with status 200
        
    //const promisesToResolve = ids.map((id) => deleteCategoryAndHandleTransactionForeignKeyConstraint(id));
    const deletedCategoryObjects = [];

    console.log(ids)

    for (let id of ids) {

        deletedCategoryObjects.push(await deleteCategory(id));
    
    }

    return deletedCategoryObjects
    //return Promise.all(promisesToResolve)



}


// GET CATEGORY BY ID

const categoryById = function(categoryId: number): Promise<Category> {
    
    return fetch(`http://localhost:3000/categories/${categoryId}`, {
        method: 'GET'
    }).then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status))
        }
        return res.json()
    }).catch((err) => {throw new Error(err)})
}




// UPDATE CATEGORIES / BUDGET ROW SUMS

const updateCategoryRequest = function(category: Category) {

    if (category.id == 17) {
        console.log("is this parent_id == null? ", category)
    }

    const categoryRequestObject: Object = {
        name: category.name,
        amount: category.amount,
        parent_id: category.parent_id,
        budget_id: category.budget_id
    }

    console.log('now putting this: ', categoryRequestObject)


    return fetch(`http://localhost:3000/categories/${category.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryRequestObject)
    })
    .then((res)=>{
        if (!res.ok) {
            throw new Error(String(res.status))
        }
        return res.json()
    })
    .catch((err)=> {throw new Error(err)}) 
}

const updateCategoryNameAmountRequest = function(category: CategoryRow): Promise<{name: string, amount: number, parent_id: number}> {

    const categoryRequestObject: Object = {
        name: category.name,
        amount: category.amount,
        parent_id: null,
        budget_id: null
    }


    return fetch(`http://localhost:3000/categories/${category.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryRequestObject)
    })
    .then((res)=>{
        if (!res.ok) {
            throw new Error(String(res.status))
        }
        return res.json()
    })
    .catch((err)=> {throw new Error(err)}) 
}



// GET TRANSACTIONS BY ID


const updateCategoryIdOfTransaction = function (transactionId: number, newCategoryId: number | null) {

    // WHY? WE DO THIS IN PREV FUNC.
    newCategoryId = newCategoryId ? newCategoryId : null

    return fetch(`http://localhost:3000/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'category_id':newCategoryId})
    }).then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status))
        }
        return res.json()
    }).catch((err) => {throw new Error(err)})
}




class BudgetQueryService {

    constructor() {
        // nothing here yet
    }
    

    // CATEGORIES



    updateCategoryNameAmount = function(categoryId: number, name: string, amount: number): Promise<{id: number, name: string, amount: number}> {

    
        return fetch(`http://localhost:3000/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: name, amount: amount})
        })
        .then((res)=>{
            if (!res.ok) {
                throw new Error(String(res.status))
            }
            return res.json()
        })
        .catch((err)=> {throw new Error(err)}) 
    }

    updateCategoryParentId = function(categoryId: number, parentId: number): Promise<{id: number, parentId: number}> {

    
        return fetch(`http://localhost:3000/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({parent_id: parentId})
        })
        .then((res)=>{
            if (!res.ok) {
                throw new Error(String(res.status))
            }
            return res.json()
        })
        .catch((err)=> {throw new Error(err)}) 
    }

    getCategoriesParentIds = async function(budgetId: number = 0): Promise<{id: number, parentId: number}[] | undefined> {
        try {
            
            const categories = await fetch('http://localhost:3000/categories')
            
            let categoriesJson = await categories.json();

            if (budgetId != 0) {

                categoriesJson = categoriesJson.filter(cat => cat.budget_id == budgetId)

            }

            return categoriesJson.map(cat => {

                return {id: Number(cat.id), parentId: Number(cat.parent_id)}

            })

        } catch (error) {
            
            console.error(error)

        }
    }

    getCategoryChildren = async function(category_id: number): Promise<Category[]> {

        const categories: Category[] = await getCategories();
    
        return categories.filter(cat => cat.parent_id == category_id);
    
    }

    getCategoryParentIds = (): {id: number, categoryId: number} => {

        return {id: NaN, categoryId: NaN}

    }

    deleteCategory = (category_id: number): Promise<Category> => {

        return fetch(`http://localhost:3000/categories/${category_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res)=>{
            if (!res.ok) {
                throw new Error(String(res.status))
            }
    
            return res.json()

        })
        .catch((err)=> {throw new Error(err)})
    }




    
    // TRANSACTIONS
    updateCategoryIdOfTransaction = function (transactionId: number, newCategoryId: number) {
        
        const transactionObject = {
            name: null,
            amount: null,
            date: null,
            category_id: newCategoryId,
            recipient: null, 
            comment: null
        }

        console.log(`Updating transaction with id: ${transactionId} with following data: `, transactionObject)

        return fetch(`http://localhost:3000/transactions/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionObject)
        }).then((res) => {
            if (!res.ok) {
                throw new Error(String(res.status))
            }
            console.log('After update, this transaction was returned: ' res)
            return res.json()
        }).catch((err) => {throw new Error(err)})
    }

    getTransactions = function(): Promise<Array<Transaction>> {
        return fetch(`http://localhost:3000/transactions`, {
            method: 'GET'
        }).then((res) => {
            if (!res.ok) {
                throw new Error(String(res.status))
            }
            return res.json()
        }).catch((err) => {throw new Error(err)})
    }
    
    getTransactionsByCategoryId = async function(category_id: number): Promise<Transaction[]> { 
        
        const transactions = await getTransactions();
        
        const filteredTransactions: Transaction[] = transactions.filter(transaction => transaction.category_id == category_id);
        
        return filteredTransactions

    };


}




