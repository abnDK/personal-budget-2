// NEEDS UPDATE FOR 1.4

import Router from "@root/async-router";
const router = Router.Router();
import {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
} from "../../controllers/budgetController.js";
import { FlatBudget } from "../../models/1.4/budget.js";
import { Budget } from "../../models/1.4/budget.js";

// VIEWS
router.get("/show/:id", async (req: Request, res: Response, next: any) => {
    await getBudgets(parseInt(req.params.id))
        .then((budgets: FlatBudget[]) => {
            res.render("budget", {
                budget: budgets[0],
            });
        })
        .catch(next);
});

router.get("/", async (req: Request, res: Response, next: any) => {
    console.log("hello");
    await getBudgets()
        .then((budgets: FlatBudget[]) => {
            console.log("called GET budgets route:...");

            res.status(200).json(budgets);
        })
        .catch(next);
});
router.get("/:id", async (req: Request, res: Response, next: any) => {
    await getBudgets(parseInt(req.params.id))
        .then((budget: FlatBudget[]) => {
            res.status(200).json(budget[0]);
        })
        .catch(next);
});
router.get(
    "/:id/:year/:month",
    async (req: Request, res: Response, next: any) => {
        const id = parseInt(req.params.id);
        const filterDate = new Date(
            parseInt(req.params.year),
            parseInt(req.params.month),
            0
        ); // TODO! FIX LAST DATE!
        await getBudgets(id, filterDate)
            .then((budget: FlatBudget[]) => {
                res.status(200).json(budget[0]);
            })
            .catch(next);
    }
);

router.post("/", async (req: Request, res: Response, next: any) => {
    const { name, createDate, ownerName } = req.body;
    await createBudget(name, createDate, ownerName)
        .then((newBudget: Budget) => {
            res.status(200).json(newBudget);
        })
        .catch(next);
});

// update router???

router.delete("/:id", async (req: Request, res: Response, next: any) => {
    await deleteBudget(parseInt(req.params.id))
        .then((result: Boolean) => {
            if (result) {
                res.status(200);
            } else {
                res.status(400);
            }
        })
        .catch(next);
});

export { router };
