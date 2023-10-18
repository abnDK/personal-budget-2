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
    asyncErrorHandler(async (req, res, next) => {
        let transactions = await TransactionService.getTransactions();
        res.render("transactions", {
            transactions: transactions,
        });
    })
);

router.get("/add", async (req, res) => {
    const categories = await CategoryService.getCategories();
    res.render("add_transaction", {
        categories: categories,
    });
});

// CRUD
router.get(
    "/",
    asyncErrorHandler(async (req, res, next) => {
        let transactions = await TransactionService.getTransactions();
        res.status(200).json(transactions);
    })
);
router.get("/:id", async (req, res) => {
    let transaction = await TransactionService.getTransactionById(
        req.params.id
    );
    res.status(200).json(transaction);
});

router.post("/", async (req, res) => {
    const { name, amount, date, category_id, recipient, comment } = req.body;
    const transaction = await TransactionService.createTransaction(
        name,
        amount,
        date,
        category_id,
        recipient,
        comment
    );
    //res.status(res.statusCode).json(transaction);

    res.status(res.statusCode).send(transaction);

    /*
    const categories = await CategoryService.getCategories();
    if (res.statusCode === 200) {
        res.render('add_transaction', {
            "categories": categories,
            "prev_added_transaction": transaction
        })
    } else {
        res.status(res.statuseCode)
    }
    */
});

router.delete("/:id", async (req, res) => {
    let transaction = await TransactionService.deleteTransaction(req.params.id);
    res.status(200).json(transaction);
});

router.put("/:id", (req: Request, res: Response, next: any) => {
    console.log("entered the transaction PUT route");

    const id = req.params.id;
    const { name, amount, date, category_id, recipient, comment } = req.body;

    TransactionService.updateTransaction(
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
        .catch((err: Error) => {
            next(err);
        });
});

module.exports = router;
