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
    const { name, date_start, date_end } = req.body;
    let newBudget = await BudgetService.createBudget(name, date_start, date_end);
    res.status(200).json(newBudget)
})


router.delete('/:id', async (req, res) => {
    let budget = await BudgetService.deleteBudget(req.params.id)
    res.status(200).send(budget)
})


/**
router.put('/:id', db.updateExpense)


 */
module.exports = router