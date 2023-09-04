"use strict";
const LevelClassMap = new Map([
    ["0", 'parent'],
    ["1", 'child'],
    ["2", 'grandchild'],
    ['parent', '0'],
    ['child', '1'],
    ['grandchild', '2']
]);
class CategoryTree {
    constructor() {
        this.addRow = (row) => {
            this.rows.push(row);
        };
        this.rowById = (id) => {
            return this.rows.filter(row => row.id === id)[0];
        };
        this.renderFrozen = () => {
        };
        this.renderEditable = () => {
            for (const row of this.rows) {
                let frozenElement = createBudgetRow({
                    name: row.name,
                    amount: row.amount,
                    id: row.id,
                    parent_id: row.parent_id
                }, 2);
                row.element = frozenElement;
                console.log(row);
            }
        };
        this.calcSums = () => {
            this.calcBudgetSumsOfChildren();
            this.calcBudgetSumsOfParents();
            this.calcBudgetTotalSum();
        };
        this.calcBudgetSumsOfChildrenMap = () => {
            const childrenSumsMap = new Map();
            for (const grandChild of this.grandChildren) {
                if (childrenSumsMap.has(grandChild.parent_id)) {
                    let prevVal = childrenSumsMap.get(grandChild.parent_id);
                    childrenSumsMap.set(grandChild.parent_id, prevVal += grandChild.amount);
                }
                else {
                    childrenSumsMap.set(grandChild.parent_id, grandChild.amount);
                }
            }
            return childrenSumsMap;
        };
        this.calcBudgetSumsOfChildren = () => {
            const childrenSumMap = this.calcBudgetSumsOfChildrenMap();
            for (const [id, amount] of childrenSumMap) {
                this.rowById(id).amount = amount;
            }
        };
        this.calcBudgetSumsOfParentsMap = () => {
            const parentsSumsMap = new Map();
            for (const child of this.children) {
                if (parentsSumsMap.has(child.parent_id)) {
                    let prevVal = parentsSumsMap.get(child.parent_id);
                    parentsSumsMap.set(child.parent_id, prevVal += child.amount);
                }
                else {
                    parentsSumsMap.set(child.parent_id, child.amount);
                }
            }
            return parentsSumsMap;
        };
        this.calcBudgetSumsOfParents = () => {
            const parentsSumMap = this.calcBudgetSumsOfParentsMap();
            for (const [id, amount] of parentsSumMap) {
                this.rowById(id).amount = amount;
            }
        };
        this.calcBudgetTotalSum = () => {
            let budgetTotalSum = 0;
            for (let parent of this.parents) {
                budgetTotalSum += parent.amount;
            }
            this.sum = budgetTotalSum;
        };
        this.rows = [];
        this.sum = 0;
    }
    get roots() {
        const parentIdsOfChildren = Array.from(new Set(this.children.map(child => child.parent_id)));
        return this.parents.filter(row => !parentIdsOfChildren.includes(row.id));
    }
    get parents() {
        return this.rows.filter(row => !row.to_be_deleted && row.level === 0);
    }
    get children() {
        return this.rows.filter(row => !row.to_be_deleted && row.level === 1);
    }
    get grandChildren() {
        return this.rows.filter(row => !row.to_be_deleted && row.level === 2);
    }
}
