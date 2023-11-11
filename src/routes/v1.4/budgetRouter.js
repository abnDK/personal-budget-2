// NEEDS UPDATE FOR 1.4
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Router from "@root/async-router";
const router = Router.Router();
import { getBudgets, createBudget, updateBudget, deleteBudget, } from "../../controllers/budgetController.js";
import { FlatBudget } from "../../models/1.4/budget.js";
import { Budget } from "../../models/1.4/budget.js";
// VIEWS
router.get("/show/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield getBudgets(parseInt(req.params.id))
        .then((budgets) => {
        res.render("budget", {
            budget: budgets[0],
        });
    })
        .catch(next);
}));
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hello");
    yield getBudgets()
        .then((budgets) => {
        console.log("called GET budgets route:...");
        console.log(budgets);
        console.log(budgets[0]);
        console.log(budgets[0].root);
        console.log(budgets[0].root[0].children);
        res.status(200).json(budgets);
    })
        .catch(next);
}));
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    throw new Error("....error in router");
    yield getBudgets(parseInt(req.params.id))
        .then((budget) => {
        res.status(200).json(budget);
    })
        .catch(next);
}));
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, createDate, ownerName } = req.body;
    yield createBudget(name, createDate, ownerName)
        .then((newBudget) => {
        res.status(200).json(newBudget);
    })
        .catch(next);
}));
// update router???
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield deleteBudget(parseInt(req.params.id))
        .then((result) => {
        if (result) {
            res.status(200);
        }
        else {
            res.status(400);
        }
    })
        .catch(next);
}));
export { router };
