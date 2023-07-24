"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Budget = void 0;
var Budget = /** @class */ (function () {
    function Budget(name, date_start, date_end, id) {
        this.name = name;
        this.date_start = date_start;
        this.date_end = date_end;
        this.id = id;
    }
    Object.defineProperty(Budget.prototype, Symbol.toStringTag, {
        // for assertions of instances type.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
        get: function () {
            return 'Budget';
        },
        enumerable: false,
        configurable: true
    });
    return Budget;
}());
exports.Budget = Budget;
