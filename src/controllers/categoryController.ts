// router <> controller <> service <> postgres

import { Category } from "../models/1.4/category.js";
import { CategoryService } from "../services/categoryService.js";

export const getCategories = async (
    id?: number | undefined,
    filterDate?: Date | undefined
): Promise<Category[]> => {
    let categories = id
        ? [
              await CategoryService.getCategoryById(id).catch((err) => {
                  throw new Error(err.message);
              }),
          ]
        : await CategoryService.getCategories().catch((err) => {
              throw new Error(err.message);
          });

    return filterDate
        ? categories.filter((cat) => cat.createDate <= filterDate)
        : categories;
};

export const createCategory = () => {};

export const updateCategory = () => {};

export const deleteCategory = () => {};
