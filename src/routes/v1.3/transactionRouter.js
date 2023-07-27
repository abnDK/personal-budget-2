// routes for envelope table
//const express = require('express')
const router = require('@root/async-router').Router();
const TransactionService = require('../../services/transactionService')
const CategoryService = require('../../services/categoryService')

// VIEWS
router.get('/show', async (req, res) => {
    let transactions = await TransactionService.getTransactions();
    res.render('transactions', {
        "transactions": transactions
    })
})

router.get('/add', async (req, res) => {
    const categories = await CategoryService.getCategories();
    res.render('add_transaction', {
        "categories": categories
    })
})

// CRUD
router.get('/', async (req, res) => {
    // CODE THAT CALLS SERVICE (THAT CALLS DATABASE)
    let transactions = await TransactionService.getTransactions();
    res.status(200).json(transactions)

})
router.get('/:id', async (req, res) => {
    let transaction = await TransactionService.getTransactionById(req.params.id)
    res.status(200).json(transaction)
})

router.post('/', async (req, res) => {
    const { name, amount, date, category_id } = req.body;
    const transaction = await TransactionService.createTransaction(name, amount, date, category_id);
    const categories = await CategoryService.getCategories();
    if (res.statusCode === 200) {
        res.render('add_transaction', {
            "categories": categories,
            "prev_added_transaction": transaction
        })
    } else {
        res.status(res.statuseCode)
    }
})


router.delete('/:id', async (req, res) => {
    let transaction = await TransactionService.deleteTransaction(req.params.id)
    res.status(200).json(transaction)
})


/**
router.put('/:id', db.updateExpense)


 */



module.exports = router