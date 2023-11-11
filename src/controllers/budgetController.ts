import { Budget, VersionBudget, FlatBudget } from "../models/1.4/budget.js";
import { Category } from "../models/1.4/category.js";

import { BudgetService } from "../services/budgetService.js";
import { CategoryService } from "../services/categoryService.js";
import { CustomError } from "../utils/errors/CustomError.js";
import { ErrorTextHelper } from "../utils/errors/Texthelper/textHelper.js";
const ETH = new ErrorTextHelper();

export const getBudgets = async (
    id?: number | undefined,
    filterDate?: Date | undefined
): Promise<FlatBudget[] | FlatBudget> => {
    console.log("Hello from budgetController.getBudgets");

    const budgets: Budget[] = id
        ? [
              await BudgetService.getBudgetById(id).catch((err) => {
                  throw new Error(err.message);
              }),
          ]
        : await BudgetService.getBudgets().catch((err) => {
              throw new Error(err.message);
          });

    const categories: Category[] = await CategoryService.getCategories();

    if (budgets.length === 0) {
        throw new CustomError(ETH.get("BUDGET.READ.ERROR.NOBUDGETS"), 404);
    }

    for (let budget of budgets) {
        budget.categories = categories.filter(
            (cat) => cat.budgetId === budget.id
        );
    }

    const versionBudgets: VersionBudget[] = budgets.map((budget) =>
        budget.parseVersionBudget()
    );

    const flatBudgets: FlatBudget[] = versionBudgets.map((versionBudget) =>
        versionBudget.flattenBudget(filterDate)
    );

    // if id given, we expect a single flatBudget. Otherwise we expect an array of FlatBudgets
    return id ? flatBudgets[0] : flatBudgets;
};

export const createBudget = async (
    name: string,
    createDate: Date = new Date(),
    ownerName: string = "unknown"
): Promise<Budget> => {
    return await BudgetService.createBudget(name, createDate, ownerName).catch(
        (err) => {
            throw new Error(err.message);
        }
    );
};

export const updateBudget = async (
    id: number,
    name: string | undefined,
    ownerName: string | undefined
): Promise<FlatBudget> => {
    if (!name && !ownerName) {
        throw new CustomError(ETH.get("BUDGET.UPDATE.ERROR.NOINPUT"), 400);
    }

    const prevBudgetArray: FlatBudget[] = await getBudgets(id).catch((err) => {
        throw new Error(err.message);
    });
    const prevBudget = prevBudgetArray[0];

    const updatedBudget = await BudgetService.updateBudget(
        id,
        name ?? prevBudget?.name ?? ETH.get("BUDGET.UPDATE.ERROR.UNKNOWNNAME"),
        ownerName ??
            prevBudget.ownerName ??
            ETH.get("BUDGET.UPDATE.ERROR.UNKNOWNOWNERNAME")
    ).catch((err) => {
        throw new Error(err.message);
    });

    return updatedBudget.parseVersionBudget().flattenBudget();
};

export const deleteBudget = async (id: number): Promise<boolean> => {
    const budgets = await getBudgets(id).catch((err) => {
        throw new Error(err.message);
    });

    if (budgets.length === 1) {
        return await BudgetService.deleteBudgetById(id).catch((err) => {
            throw new Error(err.message);
        });
    }

    throw new CustomError(ETH.get("BUDGET.READ.ERROR.INVALIDID"), 404);
};

// add catch blocks to async functions...