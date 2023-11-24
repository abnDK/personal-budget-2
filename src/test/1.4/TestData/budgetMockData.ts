import { Budget } from "../../../models/1.4/budget.js";
import { Period } from "../Utils/period.js";

export const MOCKBUDGETS = [
    new Budget("testbudget_a", Period.period_0(), "tester", 1),
    new Budget("testbudget_b", Period.period_0(), "tester", 2),
    new Budget("testbudget_c", Period.period_0(), "tester", 3),
];
