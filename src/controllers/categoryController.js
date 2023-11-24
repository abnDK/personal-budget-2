// router <> controller <> service <> postgres
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Category } from "../models/1.4/category.js";
import { CategoryService } from "../services/categoryService.js";
export const getCategories = (id, filterDate) => __awaiter(void 0, void 0, void 0, function* () {
    let categories = id
        ? [
            yield CategoryService.getCategoryById(id).catch((err) => {
                throw new Error(err.message);
            }),
        ]
        : yield CategoryService.getCategories().catch((err) => {
            throw new Error(err.message);
        });
    return filterDate
        ? categories.filter((cat) => cat.createDate <= filterDate)
        : categories;
});
export const createCategory = () => { };
export const updateCategory = () => { };
export const deleteCategory = () => { };
