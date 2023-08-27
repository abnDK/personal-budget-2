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
            
            element.appendChild(child)
        }
        
    }
    
    return element

}


function deleteBudgetRow(row: HTMLElement): void {

    row.parentElement?.removeChild(row) // ?. returns undefined if either object accessed or function called is not available.
}
