var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Budget, VersionBudget, FlatBudget } from "../models/1.4/budget";
import { Category } from "../models/1.4/category";
import { BudgetService } from "../services/budgetService";
import { CategoryService } from "../services/categoryService";
import { CustomError } from "../utils/errors/CustomError";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper";
const ETH = new ErrorTextHelper();
export const getBudgets = (id, filterDate) => __awaiter(void 0, void 0, void 0, function* () {
    const budgets = id
        ? [
            yield BudgetService.getBudgetById(id).catch((err) => {
                throw new Error(err.message);
            }),
        ]
        : yield BudgetService.getBudgets().catch((err) => {
            throw new Error(err.message);
        });
    const categories = yield CategoryService.getCategories();
    if (budgets.length === 0) {
        throw new CustomError(ETH.get("BUDGET.READ.ERROR.NOBUDGETS"), 404);
    }
    for (let budget of budgets) {
        budget.categories = categories.filter((cat) => cat.budgetId === budget.id);
    }
    const versionBudgets = budgets.map((budget) => budget.parseVersionBudget());
    const flatBudgets = versionBudgets.map((versionBudget) => versionBudget.flattenBudget(filterDate));
    return flatBudgets;
});
export const createBudget = (name, createDate = new Date(), ownerName = "unknown") => __awaiter(void 0, void 0, void 0, function* () {
    return yield BudgetService.createBudget(name, createDate, ownerName).catch((err) => {
        throw new Error(err.message);
    });
});
export const updateBudget = (id, name, ownerName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!name && !ownerName) {
        throw new CustomError(ETH.get("BUDGET.UPDATE.ERROR.NOINPUT"), 400);
    }
    const prevBudgetArray = yield getBudgets(id).catch((err) => {
        throw new Error(err.message);
    });
    const prevBudget = prevBudgetArray[0];
    const updatedBudget = yield BudgetService.updateBudget(id, name ? name : prevBudget.name, ownerName ? ownerName : prevBudget.ownerName).catch((err) => {
        throw new Error(err.message);
    });
    return updatedBudget.parseVersionBudget().flattenBudget();
});
export const deleteBudget = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const budgets = yield getBudgets(id).catch((err) => {
        throw new Error(err.message);
    });
    if (budgets.length === 1) {
        return yield BudgetService.deleteBudgetById(id).catch((err) => {
            throw new Error(err.message);
        });
    }
    throw new CustomError(ETH.get("BUDGET.READ.ERROR.INVALIDID"), 404);
});
// add catch blocks to async functions...
