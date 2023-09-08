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
    return __awaiter(this, void 0, void 0, function* () {
        const categoriesRandomData = yield fetch('http://localhost:3000/categories');
        const categoriesRandomJson = yield categoriesRandomData.json();
        return BuildTree(categoriesRandomJson, 'parent_id');
        return;
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
    });
};
// TRANSACTION REQUESTS
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
const deleteCategoryRequest = function (category_id) {
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
// CATEGORY REQUESTS
const getCategories = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const categoriesRaw = yield fetch('http://localhost:3000/categories');
            return yield categoriesRaw.json();
        }
        catch (error) {
            console.error(error);
        }
    });
};
const handleCategoryTransactionForeignKeyConstraint = function (category_id) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const transactions = yield getTransactionsByCategoryId(category_id);
        const category = yield categoryById(category_id);
        let newCategoryId = (category.parent_id || null);
        console.log("cat id: ", category_id);
        console.log("category: ", category);
        console.log("cat parent id (true, type): ", category.parent_id, "(", (category.parent_id), typeof category.parent_id, ")");
        console.log((category.parent_id || "parent id not truthy"));
        // const newCategoryId = (category.parent_id || null)
        if (transactions.length) {
            for (const transaction of transactions) {
                yield updateCategoryIdOfTransaction(transaction.id, newCategoryId);
            }
        }
    });
};
// DELETE CATEGORIES / BUDGET ROWS
const deleteCategory = function (category_id) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const category = yield categoryById(category_id);
        if (!category) {
            throw new Error(`cannot deleted category not existing in db. Id = ${category_id}`);
        }
        // All transactions with relation to category_id has it changed to parent of category, or null if category is parent/root element
        yield handleCategoryTransactionForeignKeyConstraint(category_id);
        const childrenCategories = yield getCategoryChildren(category_id);
        console.log("children of ", category_id, " is ", childrenCategories);
        // handle foreign key relation to other categories (parent_id)
        for (let child of childrenCategories) {
            child.parent_id = category.parent_id;
            yield updateCategoryRequest(child);
        }
        // Delete category after all relations from transactions and categories has been removed.
        return yield deleteCategoryRequest(category_id);
    });
};
const getCategoryChildren = function (category_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const categories = yield getCategories();
        return categories.filter(cat => cat.parent_id == category_id);
    });
};
const deleteCategories = function (ids) {
    return __awaiter(this, void 0, void 0, function* () {
        // array of id's (string)
        // create multiple promises (from deleteCategory) and
        // await all promises to resolve.
        // returning true means every delete request came back with status 200
        //const promisesToResolve = ids.map((id) => deleteCategoryAndHandleTransactionForeignKeyConstraint(id));
        const deletedCategoryObjects = [];
        console.log(ids);
        for (let id of ids) {
            deletedCategoryObjects.push(yield deleteCategory(id));
        }
        return deletedCategoryObjects;
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
const updateCategoryRequest = function (category) {
    if (category.id == 17) {
        console.log("is this parent_id == null? ", category);
    }
    const categoryRequestObject = {
        name: category.name,
        amount: category.amount,
        parent_id: category.parent_id,
        budget_id: category.budget_id
    };
    console.log('now putting this: ', categoryRequestObject);
    return fetch(`http://localhost:3000/categories/${category.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryRequestObject)
    })
        .then((res) => {
        if (!res.ok) {
            throw new Error(String(res.status));
        }
        return res.json();
    })
        .catch((err) => { throw new Error(err); });
};
const updateCategoryNameAmountRequest = function (category) {
    const categoryRequestObject = {
        name: category.name,
        amount: category.amount,
        parent_id: null,
        budget_id: null
    };
    return fetch(`http://localhost:3000/categories/${category.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryRequestObject)
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
    // WHY? WE DO THIS IN PREV FUNC.
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
