const router = require('@root/async-router').Router();
const BudgetService = require('../../services/budgetService')
const CategoryService = require('../../services/categoryService')


// VIEWS
router.get('/show', async (req, res) => {
    let budget_id = 3;
    let budget = await BudgetService.getBudgetById(budget_id);
    let categories = await CategoryService.getCategories();
    //console.log(categories)

    let filteredCategories = categories.filter((category) => {
        if (parseInt(category['budget_id']) == budget_id) 
        {
            return category
        }
    })
    console.log(filteredCategories)
    res.render('budget', {
        "budget": budget,
        "categories": filteredCategories
    })
})


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