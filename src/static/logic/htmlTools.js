"use strict";
function createHTMLElement(tag, className, innerText, children) {
    let element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (innerText) {
        element.innerText = innerText;
    }
    if (children) {
        for (const child of children) {
            element.appendChild(child);
        }
    }
    return element;
}
function deleteBudgetRow(row) {
    var _a;
    const parent = row.parentElement;
    if (parent.tag == 'body') {
        // we've gone to far without finding the budget row to delete
        return;
    }
    if (row.className.includes('budget-row')) {
        (_a = row.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(row);
        return;
    }
    deleteBudgetRow(row);
    return;
}
