"use strict";
// routes for envelope table
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//const express = require('express')
const router = require("@root/async-router").Router();
const TransactionService = require("../../services/transactionService");
const CategoryService = require("../../services/categoryService");
const asyncErrorHandler = require("../../controllers/asyncErrorHandler");
// VIEWS
router.get("/show", asyncErrorHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let transactions = yield TransactionService.getTransactions();
    res.render("transactions", {
        transactions: transactions,
    });
})));
router.get("/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield CategoryService.getCategories();
    res.render("add_transaction", {
        categories: categories,
    });
}));
// CRUD
router.get("/", asyncErrorHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let transactions = yield TransactionService.getTransactions();
    res.status(200).json(transactions);
})));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let transaction = yield TransactionService.getTransactionById(req.params.id);
    res.status(200).json(transaction);
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, amount, date, category_id, recipient, comment } = req.body;
    const transaction = yield TransactionService.createTransaction(name, amount, date, category_id, recipient, comment);
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
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let transaction = yield TransactionService.deleteTransaction(req.params.id);
    res.status(200).json(transaction);
}));
router.put("/:id", (req, res, next) => {
    console.log("entered the transaction PUT route");
    const id = req.params.id;
    const { name, amount, date, category_id, recipient, comment } = req.body;
    TransactionService.updateTransaction(id, name, amount, date, category_id, recipient, comment)
        .then((transaction) => {
        res.status(200).json(transaction);
    })
        .catch((err) => {
        next(err);
    });
});
module.exports = router;
