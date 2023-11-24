import { Category } from "../../../models/1.4/category.js";
import { Period } from "../Utils/period.js";

export const MOCKCATEGORIES = [
    // testbudget A
    new Category("A1", 1, false, Period.period_0(), 11, 1, undefined, 13),
    new Category("A3x", 3, true, Period.period_1(), 13, 1, 11, 14),
    new Category("A4 (A3)", 4, false, Period.period_2(), 14, 1, 13, 12),
    new Category("A2", 2, false, Period.period_3(), 12, 1, 14, 15),
    new Category("A5x", 5, true, Period.period_4(), 15, 1, 12),
    // testbudget B
    new Category("A1", 1, false, Period.period_0(), 21, 2, undefined, 24),
    new Category("A4", 4, false, Period.period_2(), 24, 2, 21, 22),
    new Category("A2", 2, false, Period.period_3_medio(), 22, 2, 24, 23),
    new Category("A3x", 2, true, Period.period_4(), 23, 2, 22),
    // testbudget C
    new Category("A1", 1, false, Period.period_0(), 31, 3, undefined, 32),
    new Category(
        "A2",
        2,
        false,
        Period.period_2(),
        32,
        3,
        31,
        33,
        undefined,
        [321, 322]
    ),
    new Category(
        "A3",
        3,
        false,
        Period.period_4(),
        33,
        3,
        32,
        undefined,
        undefined,
        [331]
    ),
    new Category(
        "B1",
        1,
        false,
        Period.period_2(),
        321,
        3,
        undefined,
        undefined,
        32
    ),
    new Category(
        "C1",
        1,
        false,
        Period.period_3(),
        322,
        3,
        undefined,
        undefined,
        32
    ),
    new Category(
        "D1",
        1,
        false,
        Period.period_4(),
        331,
        3,
        undefined,
        undefined,
        33
    ),
];
