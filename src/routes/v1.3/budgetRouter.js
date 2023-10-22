"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const router = require("@root/async-router").Router();
const BudgetService = require("../../services/budgetService");
const CategoryServic = require("../../services/categoryService");
// VIEWS
router.get("/show/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield BudgetService.getBudgetById(parseInt(req.params.id))
        .then((budget) => {
        res.render("budget", {
            budget: budget,
        });
    })
        .catch(next);
}));
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield BudgetService.getBudgets()
        .then((budgets) => {
        res.status(200).json(budgets);
    })
        .catch(next);
}));
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield BudgetService.getBudgetById(parseInt(req.params.id))
        .then((budget) => {
        res.status(200).json(budget);
    })
        .catch(next);
}));
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, date_start, date_end } = req.body;
    yield BudgetService.createBudget(name, date_start, date_end)
        .then((newBudget) => {
        res.status(200).json(newBudget);
    })
        .catch(next);
}));
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield BudgetService.deleteBudget(parseInt(req.params.id))
        .then((budget) => {
        res.status(200).send(budget);
    })
        .catch(next);
}));
module.exports = router;
