// sorts tables in order of generation.
// I.e. grandparents comes before parents, parents before children and so forth
// used for inserting data into database in an order
// that doesn't violate any foreign key constraints.


const fs = require('fs')
const { parse } = require('csv-parse/sync')

/*
// reading files
try {
    const random_tables = fs.readFileSync('./foreign_key_constraints.csv', 'utf-8')
    console.log(random_tables)
} catch (err) {
    console.log(err)
}


// writing files
try {
    fs.writeFileSync('tmp_write', 'Some random tmp content\n')

} catch (err) {
    console.log(err)
}

*/

class oldTable {
    constructor(name) {
        this.name = name;
        this.parent = null
        this.children = []
    }

    addChild(child) {
        // set parent/child relationship both ways
        // parent => child & child => parent
        child.parent = this;
        this.children.push(child);
        
    }

    addOnlyChild(child) {
        // drop current children
        this.children = [];
        // add child as the only child
        this.addChild(child)
    }

    dropChild(child) {
        // if this.children has child with same name, the child is removed from .children
        let newChildren = []

        for (let oldChild of this.children) {
            if (oldChild.name != child.name) {
                newChildren.push(oldChild)
            }
        }

        this.children = newChildren;
        
    }

    makeParent(newParent) {
        let oldParent = this.parent;
        newParent.parent = oldParent;
        newParent.addChild(this.parent)
        this.parent = newParent;

    }

    isParentOf(child) {
        if (child.parent.name == this.name) {
            return true
        }
        return false
    }

    isChildOf(parent) {
        // TODO: sammenligning virker ikke. Hvordan fungerer includes? Vi bør tjekke om den sammenligner på .name parameter.
        if (parent.children.includes(this)) {
            return true
        }
        return false
    }

    isEqualTo(table) {
        (table.name == this.name) ? true : false
    }

    findAncestor(table) {        
        
        if (this.children.length == 0) {
            return false
        }
        
        // hvis this er parent til table (table er child of this), return this
        if (table.isChildOf(this)) {
            return this
        }

        // hvis ikke table er direkte child a this og this har children,
        // så spørg om nogle af børnene har børn == table
        for (let child of this.children) {
                return child.findAncestor(table)
            }
            
    }

    

    


}

    



class oldTabletree {
    constructor(tablenamesPath, foreignKeyConstraintsPath) {
        this.tablenamesPath = tablenamesPath;
        this.readTablenames()
        this.makeTables()

        this.foreignKeyConstraintsPath = foreignKeyConstraintsPath;
        this.readForeignKeyConstraints()
        this.addParentAndChildren()

        this.root = new Table('root')

        this.queue = new Array();
        this.queue.push(this.root);
    }

    readTablenames() {
        try {
            // read in the tablenames file in order to parse
            const tablenamesString = fs.readFileSync(this.tablenamesPath, 'utf-8')
            
            // turn tablenames string into array. Empty rows will be filtered out (i.e. last line)
            const tablenames = tablenamesString.split('\n').filter(table => table? table : false)
            this.tablenames = tablenames
        } catch (err) {
            console.log(err)
        }
    }

    readForeignKeyConstraints() {
        try {
            const foreignKeyConstraintsCsv = fs.readFileSync(this.foreignKeyConstraintsPath, 'utf-8')
            const foreignKeyConstraints = parse(
                foreignKeyConstraintsCsv,
                {
                    delimiter: ";",
                    columns: true
                })
            this.foreignKeyConstraints = foreignKeyConstraints.filter(fkeyCon => fkeyCon.Child != fkeyCon.Parent)
        } catch (err) {
            console.log(err)
        }
    }

    makeTables() {
        // makes list of table objects with names from tablenames file
        this.tables = [];
        for (let tablename of this.tablenames) {
            this.tables.push(new Table(tablename))
        }
    }

    addParentAndChildren() {
        // add parent and children based on
        // the foreign key constraint relationships
        for (let table of this.tables) {
            for (const fkeyCon of this.foreignKeyConstraints) {
                if (fkeyCon.Parent == table.name) {
                    const child = new Table(fkeyCon.Child)
                    table.addChild(child)
                }
                if (fkeyCon.Child == table.name) {
                    const parent = new Table(fkeyCon.Parent)
                    parent.addChild(table)
                }

            }
        }

    }


    mergeFamily(foreignTable) {
        // matches foreignTable with this
        // if foreignTable has relations not know to this, 
        // they will me merged in.
        // In case of duplicate relatives,
        // this' relatives will be kept
        
        // identifying

        // establishing foreign table
        let foreignChild = foreignTable.child // what to do in case of multiple children?
        let foreignParent = foreignTable.parent

        // checking for match on table
        if (this.name == foreignTable.name) {
            if (this.parent != foreignParent && foreignParent) {

            }
        }


        // checking for match on parent


        // checking for match on child
    }   
    
    buildTablesArrayWithFkeyCons() {
        

        


    


        /**/
        /**
         * Cases:root
         * Root is empty
         * Root has one or more nodes
         * 
         * 
         * Cases:add table
         * added table can be
         *  no parent/children
         *  parent only
         *  children only
         *  parent and children
         * existing root can hold
         *  1 gen 
         *      no parent/children
         *      parent only
         *      children only
         *      parent and children
         *  
         * what if table has multiple children. 
         * We then look for children one at the time
         * how do we ensure, that table will become parent of all children
         * in root?
         * root
         * - child a
         * - child b
         * 
         * we look for child a, find it and make it child of table + make child.parent = table
         * we then look for child b, find it and it child of table + make child.parent = table
         * we then have to make table child of root (append to root.children)
         * 
         * if final tree is:
         * root
         * - table a
         * - table b
         * - - table c
         * - - - table d
         * 
         * and first table is d
         * 
         * root will be:
         * root
         * - table d
         * 
         * with above proces, when adding c:
         * c has d as child
         * we do root.findAncestor, and find d
         * make table_c.children.push(table_d)
         * make table_d.parent = table_c
         * make table_c.parent = table_d.parent (before assigning table_c as parent - in this case root, but could be other)
         * make table_c.parent.children.push(table_c) (making table_c a child of its parent (that was parent of table_d before))
         * 
         * new root
         * root
         * - table_c
         * - - table d
         * 
         * but what if we tried adding table b?
         * 
         * b has no parents, and table c as child
         * look for table_c, not found
         * 
         * root
         * - table b
         * - table d
         * 
         * if we then add table c:
         * c has b as parent and d as child
         * 
         * first look for parent, find table b
         * table_b.children.push(table_c)
         * table_c.parent = table_b
         * then look for child/table_d
         * table_c.children.push(table_d)
         * table_d.parent = table_c
         * 
         * new root:
         * root
         * - table b (orphan, child c)
         * - - table c (parent b, child d)
         * - - - tablde d (parent c, no children)
         * 
         */

        // for table, add to root
        // for each table, search through root to identify wether 

        /*
        hvis parent kan findes i root, så add table som child
        hvis child findes i root, så tilføj child til table og gør table.parent == child.parent (så indlejres den imellem dem)

        */

        // parent only table inserted into root, but without parent. Parent will be root.
        let ex_p_only = new Table('p_only')

        this.root.addChild(ex_p_only)
        
        let p_only = new Table('p_only')
        let p_of_p_only = new Table('p_of_p_only')
        p_of_p_only.addChild(p_only)
        this.tables.splice(0,0,p_only)

        for (let table of this.tables) {

            // looks for table with same name, or names of parent and/or children
            // tables already added to root will be prepended with 'existing'

            let existingTable = this.root.findAncestor(table)

            let existingChild;
            if (table.child) {existingChild = this.root.findAncestor(table.child)}
            
            let existingParent;
            if (table.parent) {existingParent = this.root.findAncestor(table.parent)}
            
            if (!table.parent && table.children.length == 0) {
                console.log('no kids, no parent - loner table: ')
                console.log(table)

                // if table has no child og parent - a loner
                if (!existingTable) {
                    // if table is not in root, add it to root
                    this.root.addChild(table)
                    continue

                }
            }

            if (!table.parent && table.children.length > 0) {
                console.log('kids only table: ')
                console.log(table)
                // if table has no parent, but child

                if (existingTable && !existingChild) {
                    // add kids to existing table
                    existingTable.addChild(table.child)
                    continue
                }

                if (!existingTable && existingChild) {
                    // set table to parent of existing child
                    // set table.parent to existing child current parent
                    table.parent = existingChild.parent
                    table.addChild(existingChild)
                    continue

                }

                // if neither table or child exist in root,
                // just add table (with its child already added) to root
                this.root.addChild(table)


            }

            if (table.parent && table.children.length == 0) {
                console.log('Parent only table: ')
                console.log(table)
                // if table has a parent, but no child
                if (existingTable && !existingParent) {
                    // if table exists but not parent
                    // make table.parent parent of existing table
                    // and make existing tables parent the parent of table.parent.
                    // in other words: insert table.parent between existingTable and existingTable.parent
                    // ASIS: root/existingTable.parent => existingTable
                    // TOBE: root/existingTable.parent => table.parent => existingTable
                    let grandParent = existingTable.parent // most like root
                    let newParent = table.parent;
                    newParent.addOnlyChild(existingTable)
                    grandParent.dropChild(existingTable)
                    grandParent.addChild(newParent)
                    console.log('inserted new parent ...')

                }
            }

            if (table.parent && table.children.length > 0) {
                // if table has both parent and child
                console.log('parent and child table: ')
                console.log(table)

            }

            

        }
        
        console.log(this.tables)
        console.log(this.root)

    }
        
    logTree() {
        console.log(this)
        if (this.children) {
            for (let child of this.children) {
                child.logTree()
            }
        }
    }



    writeFile() {
        console.log(this.tabletree)
    }

    bfsGet(table) {
        // BFS get a table in the tree


        console.log('LETS LOOK FOR ' + table.name)

        // "pop" first elem of queue (if this is first run, it will be root)
        let existingTable = this.queue.shift()


        if (!existingTable) {
            // if we run out of items in tree without any hits
            console.log('QUEUE EMPTY WITHOUT ANY HITS')
            return false
        }

        console.log('Does ' + existingTable.name + ' == ' + table.name + ' ??')


        // check if hit
        if (existingTable.name == table.name) {
            console.log('NAME HIT')
            return existingTable
        } 

        console.log('NAME MISS')

        if (existingTable.name == table.child.name) {
            console.log('CHILD HIT')

        }

        // add children of existingTable to queue
        for (let child of existingTable.children) {
            console.log('ENQUEING ' + child.name)
            this.queue.push(child)
        }

        // get next element in queue and check for hit
        return this.bfsGet(table);

        


    }
    
    

    buildTree() {
        // DFS version of tree builder

        /**
         * Logic - Depth first search version with recursion
         * 
         * Tables will be parent/child relationship: {parent: 'parentName', child: 'childName'}
         * 
         * with table T as input and node in tree as N:
         * 
         * If !T.child:
         *   if N.name == 'root': 
         *      - Add to node.children
         *   if N.name != 'root':
         *      - query N.parent
         * 
         * if N.name == T.name
         *      - add T.child to N.children
         * 
         * if N.name != T.name:
         *      - if N.child.name == T.name:
         *          - deref T from T.parent, set N as parent of T, continue search for parent hit
         *      - if N.children:
         *          - query children
         *      - if !N.children:
         *          - if N.name == 'root':
         *              - add T to N.children
         *          - query parent until N.name == 'root' (only querying parent with same func will result in loop)
         * 
         * 
         * 
         * If !N.children:
         * - if N.name == T.name: add T.child to N.children
         * - if N.name != T.name: add to N.children (a base case for when nothing has hit...
         *      this needs to be specified)
         * 
         * If N.children:
         * - if N.name == T.name: Add T.child to N.children
         * - if N.name != T.name: Query N.children
         * 
         * 
         * 
         * if node hit:
         *   add
         * if child hit:
         *   ...
         * if node and child miss
         *      if node.children
         *          ...
         * 
         * 
         * 
         * 
         * get(table) {
         *   logic as above. When hit or no hit, return the node
         *   logic outside will do the actions.
         * }
         * 
         * 
         * 
         */
        


    }

}
/*
let tree = new Tabletree(
    '/Users/andersbusk/Programming/Codecademy/back-end-engineer-career-path/api-dev-with-swagger-and-openapi/personal_budget_2/src/models/tablenames_test',
    '/Users/andersbusk/Programming/Codecademy/back-end-engineer-career-path/api-dev-with-swagger-and-openapi/personal_budget_2/src/models/foreign_key_constraints_test.csv');



tree.buildTablesArrayWithFkeyCons();

//tree.logTree()
/*
let tableA = new Table('a')
let tableB = new Table('b')
let tableC = new Table('c')

tableB.parent = tableA;
console.log(tableB)
tableB.makeParent(tableC);
console.log(tableB)
*/

class Table {
    constructor(name, children = null) {
        this.name = name        
        this.children = children
    }

    addChild(child) {
        this.children.push(child)
    }
}


class ForeignKeyTree {
    constructor() {
        this.root = new Table('root')
        this.visitedQ = new Array()
        this.toVisitQ = new Array()
        this.toVisitQ.push(this.root)
    }

    find(table, match) {
        // find notes in tree using BFS approach
        // params: 
        // - table: the table we are looking for
        // - match: the param we want to match on - can be 'name' or 'child'
        //   - table will never have more than one child, thus children[0] is used

        // first run will start with this.root
        for (let toVisitTable of this.toVisitQ) {
            

            // add children to queue
            for (let child of toVisitTable.children) {
                this.toVisitQ.push(child)
            }


            // look for match on name - return table
            if (toVisitTable.name == table.name && match == 'name') {
                return toVisitTable
            }


            // look for match on child - return as child and parent
            if (match == 'child') {
                for (let child of toVisitTable.children) {
                    if (child.name == table.children[0].name) {                
                        return {'child': child, 'parent': toVisitTable}
                        }
                }
            }
                
            

        }

    }

    build(tables) {
        // try to find match on either name og child
        // if no - add (see logic on gh)
        for (let tableToAdd of tables) {
            if (!tableToAdd.children) {
                this.root.children.push(table)
            }

            let hit = this.find(tableToAdd, 'name')
            if (hit) {
                hit.addChild(tableToAdd.children[0])
            } else {
                this.root.addChild(tableToAdd)
            }

            let childHit = this.find(tableToAdd, 'child') 
            if (childHit) {
                // in order to make this, we need
                // to know parent of childHit
                // Change this in the .find()
                // is return in object: {child, parent}
                

                // remove child from parent with name hit
                childHit['parent'].children = childHit['parent'].children.filter(child => child.name != childHit['child'].name)
                
                // add child to tableToAdd.children
                tableToAdd.addChild(childHit['child'])

                // this is blind to the case where 
                // link between grandparent and parent
                // is inserted and link between child
                // and grandchild is inserted, but not between
                // parent and child.
                // How do we "rewire" or "move" child-grandchild
                // to grandparent-parent relation after a child
                // hit?

                // # 1
                // instead of rewire parent, find can be called again with macth 'name' in order to reinsert it.
                // should default to root if not hit is found though (needs to be added above)

                // # 2
                // if parents, who are also not children of someone (in an array of parent-child relationship)
                // is added to root.children, you can do BFS and get
                // the tables in the right order for inserting data.
                // as simple as that.
                // this needs an array of tables as the main datastructure
                // this can BFS function can afterwards be used to create 
                // a root tree structure, but i technically not 
                // critical in order to return the desired output.

            }

            


        }



        
        for (let item of this.queue) {
            if (this.root.children.length == 0) {
                this.root.children.push(item)
            }

            let hit = this.bfsGet(item);
            
        }

    }

    bfsGet(table) {
        // BFS get a table in the tree


        console.log('LETS LOOK FOR ' + table.name)

        // "pop" first elem of queue (if this is first run, it will be root)
        let existingTable = this.queue.shift()


        if (!existingTable) {
            // if we run out of items in tree without any hits
            console.log('QUEUE EMPTY WITHOUT ANY HITS')
            return false
        }

        console.log('Does ' + existingTable.name + ' == ' + table.name + ' ??')


        // check if hit
        if (existingTable.name == table.name) {
            console.log('NAME HIT')
            return existingTable
        } 

        console.log('NAME MISS')

        if (existingTable.name == table.child.name) {
            console.log('CHILD HIT')

        }

        // add children of existingTable to queue
        for (let child of existingTable.children) {
            console.log('ENQUEING ' + child.name)
            this.queue.push(child)
        }

        // get next element in queue and check for hit
        return this.bfsGet(table);

        


    }
}



/**
 * root
 * - b
 * - a
 * - - c
 * - - - d
 */

let fkAC = new ForeignKeyRelation('a', 'c')
let fkCD = new ForeignKeyRelation('c', 'd')
let fkA = new ForeignKeyTable('a')
let fkB = new ForeignKeyTable('b')
let fkC = new ForeignKeyTable('c')
let fkD = new ForeignKeyTable('d')



let fkTree = new ForeignKeyTree(tables = [fkB], relations = [fkCD, fkAC])
console.log(fkTree.tables)
console.log(fkTree.relations)
let fkTreeRes = fkTree.bfsGet()
console.log(fkTreeRes)

/*
let testTable = new Table('category1');
let result = tree.bfsGet(testTable);
console.log(result)

*/





// break down the problem
/**
 * 
 * 1. finding an element in a tree
 * 2. performing logic according to results of searching the tree
 * 
 * 
 * 
 * 
 * 
 */

