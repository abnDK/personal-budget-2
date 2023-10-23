// routes for envelope table

import CustomError from "../../utils/errors/CustomError";

//const express = require('express')
const router = require("@root/async-router").Router();
const TransactionService = require("../../services/transactionService");
const CategoryService = require("../../services/categoryService");
const asyncErrorHandler = require("../../controllers/asyncErrorHandler");

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

module.exports = router;
