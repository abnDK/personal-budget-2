var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// NEEDS UPDATE FOR 1.4
throw new Error();
import Router from "@root/async-router";
const router = Router.Router();
import { CategoryService } from "../../services/categoryService.js";
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield CategoryService.getCategories()
        .then((categories) => res.status(200).json(categories))
        .catch(next);
}));
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield CategoryService.getCategoryById(req.params.id)
        .then((category) => res.status(200).json(category))
        .catch(next);
}));
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("now posting: ", req.body);
    const { name, amount, parent_id, budget_id } = req.body;
    yield CategoryService.createCategory(name, amount, parent_id, budget_id)
        .then((newCategory) => res.status(200).json(newCategory))
        .catch(next);
}));
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    CategoryService.deleteCategory(parseInt(req.params.id))
        .then((category) => res.status(200).send(category))
        .catch(next);
}));
router.put("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, amount, parent_id, budget_id } = req.body;
    const id = req.params.id;
    yield CategoryService.updateCategory(id, name, amount, parent_id, budget_id)
        .then((category) => {
        res.status(200).json(category);
    })
        .catch(next);
}));
export default router;
