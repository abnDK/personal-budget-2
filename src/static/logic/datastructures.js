function BuildTree(array, parent_id_key, outputStyle = undefined) {

    /**
     * From an array of objects with a parent id
     * this function returns an array of objects
     * with parent-child relationship built.
     * 
     * 
     * input:
     * an a array of seemingly random object 
     * with at least an attribute with name <id>
     * [a {name: a, parent: b}, b {name: b, parent: None}, ...]
     * 
     * 
     * output:
     * an array of the top level elements and
     * a children attribute holding the child elements.
     * This repeats for as many generations as
     * is needed to create the "familytree"
     * [b {name: b, parent: None, children[a{name: a, parent: b, children[]}]}, ...]
     */

    

    // make an object with id's as keys and objects as values
    let obj = new Object();
    array.forEach(element => {
        element.children = new Array();
        obj[element.id] = element;
    });

    output = obj;
    

    // Add children to parent elements
    for (const [key, value] of Object.entries(obj)) {
        
        if (obj[value[parent_id_key]]) {
            obj[value[parent_id_key]].children.push(value)
        }
    }

    // only add rows without a parent_id in the root layer, as everyone else will be a child or grandchild of the root layer elements
    let root = new Object();
    for (const [key, value] of Object.entries(obj)) {
        if (value[parent_id_key] === null) {
            root[key] = value
        }
        
    }

    // only need for returning an array of elements
    return Object.values(root);
    
}

const bfsTree = function(objectTree) {
    let bfsTree = new Array();
    let toVisit = Object.values(objectTree);

    
    while (toVisit.length > 0) {

        let next = toVisit.shift(); // pop makes it dfs, shift makes it bfs

        for (let c of next.children) {
            toVisit.push(c)
        }
        
        bfsTree.push(next)
    }
    


    return bfsTree
}

const dfsTree = function(objectTree) {
    let defTree = new Array();
    let toVisit = Object.values(objectTree);
    
    while (toVisit.length > 0) {
 
        let next = toVisit.pop(); // pop makes it dfs, shift makes it bfs

        for (let c of next.children) {
            toVisit.push(c)
        }
        
        defTree.push(next)
    }
    
    return defTree
}
