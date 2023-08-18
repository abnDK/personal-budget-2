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
    console.log(row);
    console.log(row.parentElement);
    (_a = row.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(row); // ?. returns undefined if either object accessed or function called is not available.
}
