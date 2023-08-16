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