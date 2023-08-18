function createHTMLElement(tag: string, className?: string, innerText?: string | undefined, children?: HTMLElement[] | undefined): HTMLElement {
    let element: HTMLElement = document.createElement(tag);


    if (className) {
        element.className = className;
    }
    
    if (innerText) {
        console.log(element)
        element.innerText = innerText;
        console.log(element)
    }
    

    if (children) {
        
        for (const child of children) {
            
            element.appendChild(child)
        }
        
    }
    
    return element

}

