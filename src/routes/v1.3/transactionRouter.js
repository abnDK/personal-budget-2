// routes for envelope table
//const express = require('express')
const router = require('@root/async-router').Router();
const TransactionService = require('../../services/transactionService')


//let ts = new TransactionService()

//let b = ts.getTransactions()
//console.log(b)

// in order to do this either change getTransactions to (req, res) function or make some middle function and let getTransactions be a layer behind the (req, res) functions.
// see expense.js for how to model the functions for the routes.
// consider making getTransactions private and called by the (req, res) functions?
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
    let newTransaction = await TransactionService.createTransaction(name, amount, date, category_id);
    res.status(200).json(newTransaction)
})


router.delete('/:id', async (req, res) => {
    let transaction = await TransactionService.deleteTransaction(req.params.id)
    res.status(200).json(transaction)
})


/**
router.put('/:id', db.updateExpense)


 */
module.exports = router