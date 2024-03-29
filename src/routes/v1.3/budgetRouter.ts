const router = require("@root/async-router").Router();
const BudgetService = require("../../services/budgetService");
const CategoryServic = require("../../services/categoryService");

// VIEWS
router.get("/show/:id", async (req: Request, res: Response, next: any) => {
    await BudgetService.getBudgetById(parseInt(req.params.id))
        .then((budget: Budget) => {
            res.render("budget", {
                budget: budget,
            });
        })
        .catch(next);
});

router.get("/", async (req: Request, res: Response, next: any) => {
    await BudgetService.getBudgets()
        .then((budgets: Budget[]) => {
            res.status(200).json(budgets);
        })
        .catch(next);
});
router.get("/:id", async (req: Request, res: Response, next: any) => {
    await BudgetService.getBudgetById(parseInt(req.params.id))
        .then((budget: Budget) => {
            res.status(200).json(budget);
        })
        .catch(next);
});

router.post("/", async (req: Request, res: Response, next: any) => {
    const { name, date_start, date_end } = req.body;
    await BudgetService.createBudget(name, date_start, date_end)
        .then((newBudget: Budget) => {
            res.status(200).json(newBudget);
        })
        .catch(next);
});

router.delete("/:id", async (req: Request, res: Response, next: any) => {
    await BudgetService.deleteBudget(parseInt(req.params.id))
        .then((budget: Budget) => {
            res.status(200).send(budget);
        })
        .catch(next);
});

module.exports = router;
