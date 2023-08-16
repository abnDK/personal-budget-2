function createHTMLElement(tag: string, className?: string, innerText?: string | undefined, children?: HTMLElement[] | undefined): HTMLElement {
    let element: HTMLElement = document.createElement(tag);


    if (className) {
        element.className = className;
    }

    if (innerText) {
        element.innerText = innerText;
    }

    if (children) {
        for (const child of children) {
            console.log(child)
            console.log(child.outerHTML)
            element.appendChild(child)
        }
    }

    return element

}
