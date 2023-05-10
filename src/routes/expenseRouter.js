// routes for envelope table
const express = require('express')
const router = express.Router()

const db = require('../models/expense');


router.get('/', db.getExpenses)

router.get('/:id', db.getExpenseById)

router.post('/', db.createExpense)

router.delete('/:id', db.deleteExpense)

router.put('/', db.updateExpense)


module.exports = router