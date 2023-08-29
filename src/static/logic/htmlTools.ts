function createHTMLElement(tag: string, className?: string | undefined, innerText?: string | undefined, children?: HTMLElement[] | undefined): HTMLElement {
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

    const parent: HTMLElement | null = row.parentElement;
    if (parent.tag == 'body') {
        // we've gone to far without finding the budget row to delete
        return
    }

    if (row.className.includes('budget-row')) {
        row.parentElement?.removeChild(row)
        return
    }

    deleteBudgetRow(row);
    return 
}
