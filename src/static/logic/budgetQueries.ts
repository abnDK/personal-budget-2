
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
const getTransactions = function(): Promise<Array<object>> {
    return fetch(`http://localhost:3000/transactions`, {
        method: 'GET'
    }).then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status))
        }
        return res.json()
    }).catch((err) => {throw new Error(err)})
}

const getTransactionsByCategoryId = function(category_id: string): Promise<Array<object>> { 
    return getTransactions().then(transactions => {return transactions.filter(transaction => transaction.category_id == category_id)})
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
            throw new Error(res.status)
        }

        return res.json()
    })
    .catch((err)=> {throw new Error(err)})
}

// DELETE CATEGORIES / BUDGET ROWS
const deleteCategoryAndHandleTransactionForeignKeyConstraint = function(category_id: string): Promise<Array<object>> {
    
    // CHANGING ID OF ANY RELATED TRANSACTIONS
    // get transactions with category_id

    // should return true, if delete is successful...


    const transactions: Promise<Array<Object>> = getTransactionsByCategoryId(category_id)
    
    const category = categoryById(category_id);

    const transactionsAndCategoriesByCategoryId: Promise<Array<object>> = Promise.all([transactions, category]);
    

    return transactionsAndCategoriesByCategoryId
        .then(transactionAndCategory => {

            const transactions: Array<{id:number}> = transactionAndCategory[0];
            const category: object = transactionAndCategory[1];
            
            
            if (!transactions.length) {
                return deleteCategory(category_id)
            }
            
            
            const changedCategoryIdOfTransactionsPromises: Array<Promise<object>> = transactions.map(
                (transaction) => {
                        return updateCategoryIdOfTransaction(transaction.id, category.parent_id)
                }
            )
            
            return Promise.all(changedCategoryIdOfTransactionsPromises)
                .then(() => {
                    return deleteCategory(category_id); // if return category object, that has been deleted
                }).catch((err) => {
                    throw new Error(err)
                })
        })

        
    

   
}

const deleteCategories = async function(ids:number[]) {
    // array of id's (string)
    // create multiple promises (from deleteCategory) and
    // await all promises to resolve.
    // returning true means every delete request came back with status 200
    
    
    
    
    //const promisesToResolve = ids.map((id) => deleteCategoryAndHandleTransactionForeignKeyConstraint(id));
    const deletedCategyObjects = [];
    for (let id of ids) {
        deletedCategyObjects.push(await deleteCategoryAndHandleTransactionForeignKeyConstraint(id));
    }

    return deletedCategyObjects
    //return Promise.all(promisesToResolve)



}


// GET CATEGORY BY ID

const categoryById = function(categoryId:string): Promise<Array<object>> {
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





