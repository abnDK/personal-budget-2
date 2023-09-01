/* IS THIS EVER CALLED?*/
const getCategoriesAsTree = function() {
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

    let newCategoryId: number | null = null;

    const category: Category = categoryById(category_id);

    if (category.parent_id) {
        newCategoryId = parseInt(category.parent_id);
    }

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
    const childrenCategories: Category[] = await getCategoryChildren(category_id);
    
    // All transactions with relation to category_id has it changed to parent of category, or null if category is parent/root element
    await handleCategoryTransactionForeignKeyConstraint(category_id);

    // handle foreign key relation to other categories (parent_id)
    for (let child of childrenCategories) {
        child.parent_id = category.parent_id;
        updateCategoryRequest(child);
    }

    // Delete category after all relations from transactions and categories has been removed.
    return await deleteCategoryRequest(category_id);
    

   
}

const getCategoryChildren = async function(category_id: number): Promise<Category[]> {

    const categories: Category[] = await getCategories();

    return categories.filter(cat => cat.parent_id == category_id);

} 

const deleteCategories = async function(ids:number[]) {
    // array of id's (string)
    // create multiple promises (from deleteCategory) and
    // await all promises to resolve.
    // returning true means every delete request came back with status 200
    
    
    console.log('now trying to delete ids: ', ids)
    
    //const promisesToResolve = ids.map((id) => deleteCategoryAndHandleTransactionForeignKeyConstraint(id));
    const deletedCategoryObjects = [];
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

    const categoryRequestObject: Object = {
        name: category.name,
        amount: category.amount,
        parent_id: category.parent_id,
        budget_id: category.budget_id
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





