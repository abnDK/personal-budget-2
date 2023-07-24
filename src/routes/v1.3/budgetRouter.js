// REWRITE FROM TRANSACTION TO BUDGET
// DONE?


// routes for envelope table
//const express = require('express')
const router = require('@root/async-router').Router();
const BudgetService = require('../../services/budgetService')


router.get('/', async (req, res) => {
    let budgets = await BudgetService.getBudgets();
    res.status(200).json(budgets)

})
router.get('/:id', async (req, res) => {
    let budget = await BudgetService.getBudgetById(req.params.id)
    res.status(200).json(budget)
})

router.post('/', async (req, res) => {
    const { name, amount, date, category_id } = req.body;
    let newTransaction = await TransactionService.createTransaction(name, amount, date, category_id);
    res.status(200).json(newTransaction)
})


router.delete('/:id', async (req, res) => {
    let transaction = await TransactionService.deleteTransaction(req.params.id)
    res.status(200).send(transaction)
})


/**
router.put('/:id', db.updateExpense)


 */
module.exports = router