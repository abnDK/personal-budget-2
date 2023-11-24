// NEEDS UPDATE FOR 1.4

import { Router } from "@root/async-router";
import { getCategories } from "../../controllers/categoryController.js";
const router = Router();

router.get("/", async (req: Request, res: Response, next: any) => {
    await getCategories()
        .then((categories: Category[]) => res.status(200).json(categories))
        .catch(next);
});

router.get("/:id", async (req: Request, res: Response, next: any) => {
    await getCategories(req.params.id)
        .then((category: Category) => res.status(200).json(category))
        .catch(next);
});

router.post("/", async (req: Request, res: Response, next: any) => {
    console.log("now posting: ", req.body);

    const { name, amount, parent_id, budget_id } = req.body;

    await CategoryService.createCategory(name, amount, parent_id, budget_id)
        .then((newCategory: Category) => res.status(200).json(newCategory))
        .catch(next);
});

router.delete("/:id", async (req: Request, res: Response, next: any) => {
    CategoryService.deleteCategory(parseInt(req.params.id))
        .then((category: Category) => res.status(200).send(category))
        .catch(next);
});

router.put("/:id", async (req: Request, res: Response, next: any) => {
    const { name, amount, parent_id, budget_id } = req.body;

    const id = req.params.id;

    await CategoryService.updateCategory(id, name, amount, parent_id, budget_id)
        .then((category: Category) => {
            res.status(200).json(category);
        })
        .catch(next);
});

export { router };
