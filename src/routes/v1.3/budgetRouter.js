const router = require('@root/async-router').Router();
const BudgetService = require('../../services/budgetService')
const CategoryService = require('../../services/categoryService')

// VIEWS
router.get('/show/:id', async (req, res) => {
    let budget_id = req.params.id;
    let budget = await BudgetService.getBudgetById(budget_id);
    
    /**
     * based on parent_id attribute.
     * 
     * all nodes without parent_id == parent
     * 
     * for each parent
     *      find all children
     * 
     * for all children
     *      find all grandchildren
     * 
     * set a level attribute [1, 2, 3] == [parent, child, grandchild] used for rendering in dom
     */



    res.render('budget', {
        "budget": budget
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