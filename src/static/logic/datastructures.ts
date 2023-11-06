import { CategoryRow } from "./interfaces.js";

export function BuildTree(
    array: Category[],
    parent_id_key: string = "parent_id"
): CategoryRow {
    function addChildren(element: CategoryRow) {
        let children: Category[] = array.filter(
            (child) => child[parent_id_key] == element.id
        );

        let childrenRows: CategoryRow[] = children.map((child) => {
            const childRow = new CategoryRow(
                child["name"],
                child["amount"],
                child["id"],
                child["parent_id"],
                child["budget_id"]
            );

            childRow.level = element.level + 1;

            return childRow;
        });

        for (let childRow of childrenRows) {
            addChildren(childRow);
        }

        element.children = childrenRows;

        return;
    }

    // first get root elements
    let root = array.filter(
        (element) => !element[parent_id_key] && element.name == "root"
    )[0];

    const rootRow = new CategoryRow(
        root["name"],
        root["amount"],
        root["id"],
        root["parent_id"],
        root["budget_id"]
    );

    rootRow.level = 0;

    addChildren(rootRow);

    return rootRow;
}

const bfsTree = function (root: Category) {
    let bfsTree = new Array();
    let toVisit = Object.values(root);

    while (toVisit.length > 0) {
        let next = toVisit.shift(); // pop makes it dfs, shift makes it bfs

        for (let c of next.children) {
            toVisit.push(c);
        }

        bfsTree.push(next);
    }

    return bfsTree;
};

export const dfsTree = function (root: CategoryRow): CategoryRow[] {
    let catTree = new Array();
    let toVisit = [root];

    while (toVisit.length > 0) {
        let next = toVisit.pop(); // pop makes it dfs, shift makes it bfs

        // sorts children by id, to ensure same order when rendering it to the budget
        for (let c of next.children.sort(
            (childA, childB) => childB.id - childA.id
        )) {
            toVisit.push(c);
        }

        catTree.push(next);
    }

    // sort category tree by id
    //catTree.sort((catA, catB) => catA.id - catB.id);

    return catTree;
};
