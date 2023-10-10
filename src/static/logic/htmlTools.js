"use strict";
function createHTMLElement(tag, className, innerText, children) {
    let element = document.createElement(tag);
    // set className as id if start with # // should be renamed to selector!
    if (className && className[0] === '#') {
        element.id = className.substring(1);
    }
    else if (className) {
        element.className = className;
    }
    if (innerText && tag == 'input') {
        element.value = innerText;
    }
    else if (innerText) {
        element.innerText = innerText;
    }
    if (children) {
        for (const child of children) {
            element.appendChild(child);
        }
    }
    return element;
}
