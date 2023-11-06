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
//const express = require('express')
// const router = require("@root/async-router").Router();
import Router from "@root/async-router";
const router = Router.Router();
import { TransactionService } from "../../services/transactionService.js";
import { CategoryService } from "../../services/categoryService.js";
import asyncErrorHandler from "../../controllers/asyncErrorHandler.js";
// VIEWS
router.get("/show", asyncErrorHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let transactions = yield TransactionService.getTransactions();
    res.render("transactions", {
        transactions: transactions,
    });
})));
router.get("/add", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield CategoryService.getCategories();
    res.render("add_transaction", {
        categories: categories,
    });
}));
// CRUD
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield TransactionService.getTransactions()
        .then((transactions) => res.status(200).json(transactions))
        .catch(next);
}));
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield TransactionService.getTransactionById(req.params.id)
        .then((transaction) => {
        res.status(200).json(transaction);
    })
        .catch(next);
}));
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, amount, date, category_id, recipient, comment } = req.body;
    yield TransactionService.createTransaction(name, amount, date, category_id, recipient, comment)
        .then((transaction) => {
        res.status(res.statusCode).send(transaction);
    })
        .catch(next);
}));
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield TransactionService.deleteTransaction(req.params.id)
        .then((transaction) => {
        res.status(200).json(transaction);
    })
        .catch(next);
}));
router.put("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { name, amount, date, category_id, recipient, comment } = req.body;
    yield TransactionService.updateTransaction(id, name, amount, date, category_id, recipient, comment)
        .then((transaction) => {
        res.status(200).json(transaction);
    })
        .catch(next);
}));
export default router;
