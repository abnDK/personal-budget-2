"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
var Category = /** @class */ (function () {
    function Category(name, amount, parent_id, budget_id) {
        this.name = name;
        this.amount = amount;
        this.parent_id = parent_id;
        this.budget_id = budget_id;
    }
    Object.defineProperty(Category.prototype, Symbol.toStringTag, {
        // for assertions of instances type.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
        get: function () {
            return 'Category';
        },
        enumerable: false,
        configurable: true
    });
    return Category;
}());
exports.Category = Category;
