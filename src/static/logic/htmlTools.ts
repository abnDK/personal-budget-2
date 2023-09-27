function createHTMLElement(tag: string, className?: string | undefined, innerText?: string | undefined, children?: HTMLElement[] | undefined): HTMLElement {
    
    let element: HTMLElement = document.createElement(tag)




    // set className as id if start with # // should be renamed to selector!
    if (className && className[0] === '#') {
        element.id = className.substring(1)
    } else if (className) {        
        element.className = className;
    }
    
    if (innerText && tag == 'input') {
        new HTMLInputElement()
        element.value = innerText
    }
    else if (innerText) {
        element.innerText = innerText;
    }
    

    if (children) {
        
        for (const child of children) {
            
            element.appendChild(child)
        }
        
    }
    
    return element

}


