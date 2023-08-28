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



const getCategoriesAsTree = function() {
    return fetch(
        'http://localhost:3000/categories'
    ).then((res) => {
        if (!res.ok) {
            throw new Error(res.status)
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

const getTransactionsByCategoryId = async function(category_id: string): Promise<Transaction[]> { 
    const transactions = await getTransactions();
    const filteredTransactions: Transaction[] = transactions.filter(transaction => transaction.category_id == category_id);
    return filteredTransactions
};

const deleteCategory = function(category_id: string) {

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

// DELETE CATEGORIES / BUDGET ROWS
const deleteCategoryAndHandleTransactionForeignKeyConstraint = async function(category_id: string): Promise<Array<object>> {
    
    // CHANGING ID OF ANY RELATED TRANSACTIONS
    // get transactions with category_id

    // should return true, if delete is successful...


    const transactionsPromise: Promise<Transaction[]> = getTransactionsByCategoryId(category_id)
    
    const categoryPromise: Promise<Category> = categoryById(category_id);
    
    const transactionsAndCategory: [Transaction[], Category] = await Promise.all([transactionsPromise, categoryPromise]);
 
    const transactions: Transaction[] = transactionsAndCategory[0];
    const category: Category = transactionsAndCategory[1];

    // if no transactions has relation to category, category can just be deleted
    if (!transactions.length) {
        return await deleteCategory(category_id)
    }

    // All transactions with relation to category_id has it changed to parent of category
    for (const transaction of transactions) {
        await updateCategoryIdOfTransaction(String(transaction.id), String(category.parent_id))
    }

    // Delete category after all relations from transaction has been removed.
    return await deleteCategory(category_id);
    

   
}

const deleteCategories = async function(ids:number[]) {
    // array of id's (string)
    // create multiple promises (from deleteCategory) and
    // await all promises to resolve.
    // returning true means every delete request came back with status 200
    
    
    
    
    //const promisesToResolve = ids.map((id) => deleteCategoryAndHandleTransactionForeignKeyConstraint(id));
    const deletedCategyObjects = [];
    for (let id of ids) {
        deletedCategyObjects.push(await deleteCategoryAndHandleTransactionForeignKeyConstraint(String(id)));
    }

    return deletedCategyObjects
    //return Promise.all(promisesToResolve)



}


// GET CATEGORY BY ID

const categoryById = function(categoryId:string): Promise<Category> {
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

const updateCategory = function(data: Object, id:string) {


    return fetch(`http://localhost:3000/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
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


const updateCategoryIdOfTransaction = function (transactionId:string, newCategoryId:string | null) {

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





