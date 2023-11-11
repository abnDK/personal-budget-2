// NEEDS UPDATE FOR 1.4
throw new Error();

import Router from "@root/async-router";
const router = Router.Router();
import { TransactionService } from "../../services/transactionService.js";
import { CategoryService } from "../../services/categoryService.js";
import asyncErrorHandler from "../../controllers/asyncErrorHandler.js";

// VIEWS
router.get(
    "/show",
    asyncErrorHandler(async (req: Request, res: Response, next: any) => {
        let transactions = await TransactionService.getTransactions();
        res.render("transactions", {
            transactions: transactions,
        });
    })
);

router.get("/add", async (req: Request, res: Response, next: any) => {
    const categories = await CategoryService.getCategories();
    res.render("add_transaction", {
        categories: categories,
    });
});

// CRUD
router.get("/", async (req: Request, res: Response, next: any) => {
    await TransactionService.getTransactions()
        .then((transactions: Transaction[]) =>
            res.status(200).json(transactions)
        )
        .catch(next);
});

router.get("/:id", async (req: Request, res: Response, next: any) => {
    await TransactionService.getTransactionById(req.params.id)
        .then((transaction: Transaction) => {
            res.status(200).json(transaction);
        })
        .catch(next);
});

router.post("/", async (req: Request, res: Response, next: any) => {
    const { name, amount, date, category_id, recipient, comment } = req.body;
    await TransactionService.createTransaction(
        name,
        amount,
        date,
        category_id,
        recipient,
        comment
    )
        .then((transaction: Transaction) => {
            res.status(res.statusCode).send(transaction);
        })
        .catch(next);
});

router.delete("/:id", async (req: any, res: any, next: any) => {
    await TransactionService.deleteTransaction(req.params.id)
        .then((transaction: Transaction) => {
            res.status(200).json(transaction);
        })
        .catch(next);
});

router.put("/:id", async (req: Request, res: Response, next: any) => {
    const id = req.params.id;
    const { name, amount, date, category_id, recipient, comment } = req.body;

    await TransactionService.updateTransaction(
        id,
        name,
        amount,
        date,
        category_id,
        recipient,
        comment
    )
        .then((transaction: object) => {
            res.status(200).json(transaction);
        })
        .catch(next);
});

export default router;
