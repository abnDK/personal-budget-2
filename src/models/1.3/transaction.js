"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
var Transaction = /** @class */ (function () {
    function Transaction(id, name, amount, date, category_id) {
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.date = date;
        this.category_id = category_id;
    }
    Object.defineProperty(Transaction.prototype, Symbol.toStringTag, {
        // for assertions of instances type.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
        get: function () {
            return 'Transaction';
        },
        enumerable: false,
        configurable: true
    });
    return Transaction;
}());
exports.Transaction = Transaction;
