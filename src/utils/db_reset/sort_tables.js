// sorts tables in order of generation.
// I.e. grandparents comes before parents, parents before children and so forth
// used for inserting data into database in an order
// that doesn't violate any foreign key constraints.


const fs = require('fs')
const { parse } = require('csv-parse/sync');

// Setting arguments for identifying path of tablenames and foreignkey constraints
const args = process.argv.slice(2)
console.log('sort_tables called with arguments: ')
console.log(args)
const tablenamesPath = args[0]
const foreignKeyConstraintsPath = args[1]


// MAIN CLASSES
class pgDatabase {
    constructor(tablenames, fkeyCons) {
        this.tablenames = tablenames;
        this.fkeyCons = fkeyCons
    }

    makeTree() {
        // build a tree with tables related to parent and child(ren)
        // All tables with no parent will be related to a root table
        let tables = new Array();
        let root = new Table('root');

        // make all tablenames into Table
        for (let tablename of this.tablenames) {
            tables.push(new Table(tablename))
        }

        // check Tables for fkey relationsips
        for (let fkey of this.fkeyCons) {
            let fkeyParent = tables.find(table => table.name == fkey.Parent);
            let fkeyChild = tables.find(table => table.name == fkey.Child);

            fkeyParent.addChild(fkeyChild)

        }


        // add all Table without parents to root
        let noParents = tables.filter(table => table.parent == null)
        for (let table of noParents) {
            root.addChild(table)
        }

        return new ForeignKeyTree(root)
    }
    
    sortTablesByGeneration
    
}

class Table {
    
    
    constructor(name, parent = null, children = []) {
        this.name = name;       
        this.parent = parent;
        this.children = children;
    }

    // PARENT

    get parent() {
        return this._parent;
    }

    set parent(newParent) {
        if (newParent == null) {
            this._parent = null;
            return
        }

        if (newParent.constructor.name != 'Table') {
            throw new Error('Parent must be type Table')
        }

        if (this._parent) {
            throw new Error('Parent already exists. Current parent name: ' + this._parent.name + '. New parent name: ' + newParent.name)
        }
           
        this._parent = newParent;

        if (!newParent.children.some(child => child.name == this.name)) {
            //console.log('after adding ' + newParent.name + ' as parent to ' + this.name + ' we find that')
            //console.log('parent ' + newParent.name + ' already has ' + this.name + ' as a child.')
            //console.log(newParent)
            //console.log(this)
            newParent._children.push(this)

        }

    }

    // CHILDREN

    get name() {
        return this._name;
    }

    set name(newName) {
        if (typeof newName != 'string') {
            throw new Error('Only strings can be accepted when changing name')
        }

        this._name = newName;
    }

    // CHILDREN

    get children() {
        return this._children
    }

    set children(children) {
        if (children.some(child => child.constructor.name != 'Table')) {
            throw new Error('Only arrays of Tables can be accepted as childen')
        }
        if (!this._children) {
            this._children = new Array();
        }

        // alt use: if (!Array.isArray(Children)) { throw new Error... };
        for (let child of children) {
            this.addChild(child)
        }
    }

    addChild(child) {
        if (child.constructor.name != 'Table') {
            throw new Error('Only child of type Table can be added')
        }

        // Setting relationship both ways in parent-table-child node
        if (!this.children.some(alreadyChild => alreadyChild.name == child.name)) {
            
            this.children.push(child)

            child.parent = this;

 
        }
    }

    hasChild(potentialChild) {
        // Still in use?

        // checks if a potential child actually is a child of this table
        // input must be of type Table
        
        return this.children.some(child => child.name == potentialChild.name)
    }
}

class ForeignKeyTree {
    constructor(root) {
        this.root = root
    }

    get root() {
        return this._root;
    }

    set root(newRoot) {
        if (newRoot.constructor.name != 'Table') {
            throw new Error('Root has to be of type Table')
        }

        this._root = newRoot;
    }

    
    #sortTables(method) {
        // will build tree with BFS or DFS approach
        let visited = new Array()
        let queue = new Array()

        queue.push(this.root)
        
        while (queue.length > 0) {
            let visitTable;
            if (method == 'bfs') {
                visitTable = queue.shift()
            } else if (method == 'dfs') {
                visitTable = queue.pop()
            }

            visitTable.children.forEach(child => queue.push(child))
            
            visited.push(visitTable)

        }

        return visited

    }

    sortByBranch() {
        // sorts tables by branch using Depth First Search
        return this.#sortTables('dfs')
    }

    sortByGeneration() {
        // sorts tables by generation using Bread First Search
        return this.#sortTables('bfs')
    }

    

    
}

// UTILS
class pgTableReader {
    constructor(tablenamesPath, foreignKeyConstraintsPath) {
        this.tablenames; // might introduce bug
        this.foreignKeyConstraints; // might introduce bug
        this.tablenamesPath = tablenamesPath
        this.readTablenames()
        this.foreignKeyConstraintsPath = foreignKeyConstraintsPath
        this.readForeignKeyConstraints()
        
    }

    // READING / WRITING TABLENAMES ETC

    readTablenames() {
        try {
            // read in the tablenames file in order to parse
            const tablenamesString = fs.readFileSync(this.tablenamesPath, 'utf-8')
            
            // turn tablenames string into array. Empty rows will be filtered out (i.e. last line)
            const tablenames = tablenamesString.split('\n').filter(table => table ? table : false)
            this.tablenames = tablenames
            console.log("======> CURRENT TABLENAMES IN SORT_TABLES.JS: ")
            console.log(tablenames)
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

    getDatabase() {
        let db = new pgDatabase(this.tablenames, this.foreignKeyConstraints)
        return db
    }

    
}

class pgTableWriter {
    /**
     * Class responsible for writing to files readable by 
     * the pb2 migrations system
     * 
     * 
     */

    constructor(tree) {
        this.tree = tree
    }

    write(writePath) {
        if (this.tree.constructor.name == 'ForeignKeyTree') {
            // sort tables by generation (fkey consistent)
            // and filter out root table - root is only in use
            // for this file/function, not when inserting to 
            // pg database.
            let sortedTables = this.tree.sortByGeneration()

            // concatenate tables in one string, separated by \n char
            // write it to tablenames for use before copying data 
            // in fkey consistent order
            let sortedTableNamesString = ""
            for (let table of sortedTables) {
                if (table.name != 'root') {
                    sortedTableNamesString += table.name
                    sortedTableNamesString += '\n'
                }
            }

            sortedTableNamesString = sortedTableNamesString.trim()

            try {
                fs.writeFileSync(writePath, sortedTableNamesString)
            } catch (err) {
                console.error(err)
            }
        }

    }
}




// RUN SCRIPT FOR READING TABLENAMES AND FKEY CONSTRAINTS
// ANALYZE AND BUILD TREE OF TABLES
// WRITE TABLEARRAY SORTED BY GENERATION (PARENTS BEFOE CHILDREN)

let reader = new pgTableReader(tablenamesPath, foreignKeyConstraintsPath)
db = reader.getDatabase()
let root = db.makeTree()
let writer = new pgTableWriter(root)
writer.write(tablenamesPath)

