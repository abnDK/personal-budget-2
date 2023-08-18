"use strict";
function createHTMLElement(tag, className, innerText, children) {
    let element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (innerText) {
        console.log(element);
        element.innerText = innerText;
        console.log(element);
    }
    if (children) {
        for (const child of children) {
            element.appendChild(child);
        }
    }
    return element;
}
