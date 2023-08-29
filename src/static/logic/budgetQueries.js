"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* IS THIS EVER CALLED?*/
const getCategoriesAsTree = function () {
    return fetch('http://localhost:3000/categories').then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status));
        }
        return res.text();
    }).then((res) => {
        return BuildTree(JSON.parse(res), 'parent_id');
    }).catch((err) => {
        throw new Error(err);
    });
};
// GET TRANSACTIONS
const getTransactions = function () {
    return fetch(`http://localhost:3000/transactions`, {
        method: 'GET'
    }).then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status));
        }
        return res.json();
    }).catch((err) => { throw new Error(err); });
};
const getTransactionsByCategoryId = function (category_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactions = yield getTransactions();
        const filteredTransactions = transactions.filter(transaction => transaction.category_id == category_id);
        return filteredTransactions;
    });
};
const deleteCategory = function (category_id) {
    return fetch(`http://localhost:3000/categories/${category_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status));
        }
        return res.json();
    })
        .catch((err) => { throw new Error(err); });
};
// DELETE CATEGORIES / BUDGET ROWS
const deleteCategoryAndHandleTransactionForeignKeyConstraint = function (category_id) {
    return __awaiter(this, void 0, void 0, function* () {
        // CHANGING ID OF ANY RELATED TRANSACTIONS
        // get transactions with category_id
        // should return true, if delete is successful...
        const transactionsPromise = getTransactionsByCategoryId(category_id);
        const categoryPromise = categoryById(category_id);
        const transactionsAndCategory = yield Promise.all([transactionsPromise, categoryPromise]);
        const transactions = transactionsAndCategory[0];
        const category = transactionsAndCategory[1];
        // if no transactions has relation to category, category can just be deleted
        if (!transactions.length) {
            return yield deleteCategory(category_id);
        }
        // All transactions with relation to category_id has it changed to parent of category
        for (const transaction of transactions) {
            yield updateCategoryIdOfTransaction(String(transaction.id), String(category.parent_id));
        }
        // Delete category after all relations from transaction has been removed.
        return yield deleteCategory(category_id);
    });
};
const deleteCategories = function (ids) {
    return __awaiter(this, void 0, void 0, function* () {
        // array of id's (string)
        // create multiple promises (from deleteCategory) and
        // await all promises to resolve.
        // returning true means every delete request came back with status 200
        //const promisesToResolve = ids.map((id) => deleteCategoryAndHandleTransactionForeignKeyConstraint(id));
        const deletedCategyObjects = [];
        for (let id of ids) {
            deletedCategyObjects.push(yield deleteCategoryAndHandleTransactionForeignKeyConstraint(String(id)));
        }
        return deletedCategyObjects;
        //return Promise.all(promisesToResolve)
    });
};
// GET CATEGORY BY ID
const categoryById = function (categoryId) {
    return fetch(`http://localhost:3000/categories/${categoryId}`, {
        method: 'GET'
    }).then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status));
        }
        return res.json();
    }).catch((err) => { throw new Error(err); });
};
// UPDATE CATEGORIES / BUDGET ROW SUMS
const updateCategory = function (data, id) {
    return fetch(`http://localhost:3000/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status));
        }
        return res.json();
    })
        .catch((err) => { throw new Error(err); });
};
// GET TRANSACTIONS BY ID
const updateCategoryIdOfTransaction = function (transactionId, newCategoryId) {
    newCategoryId = newCategoryId ? newCategoryId : null;
    return fetch(`http://localhost:3000/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'category_id': newCategoryId })
    }).then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status));
        }
        return res.json();
    }).catch((err) => { throw new Error(err); });
};
