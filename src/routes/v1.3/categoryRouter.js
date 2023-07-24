const router = require('@root/async-router').Router();
const CategoryService = require('../../services/categoryService')


router.get('/', async (req, res) => {
    let categories = await CategoryService.getCategories();
    res.status(200).json(categories)

})
router.get('/:id', async (req, res) => {
    let category = await CategoryService.getCategoryById(req.params.id)
    res.status(200).json(category)
})

router.post('/', async (req, res) => {
    const { name, amount, parent_id, budget_id } = req.body;
    let newCategory = await CategoryService.createCategory(name, amount, parent_id, budget_id);
    res.status(200).json(newCategory)
})


router.delete('/:id', async (req, res) => {
    let budget = await CategoryService.deleteCategory(req.params.id)
    res.status(200).send(budget)
})


/**
router.put('/:id', db.updateExpense)


 */
module.exports = router