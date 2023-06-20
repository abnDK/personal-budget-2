// sorts tables in order of generation.
// I.e. grandparents comes before parents, parents before children and so forth
// used for inserting data into database in an order
// that doesn't violate any foreign key constraints.


const fs = require('fs')
const { parse } = require('csv-parse/sync');
const { table } = require('console');

const args = process.argv.slice(2)
console.log('sort_tables called with arguments: ')
console.log(args)
const tablenamesPath = args[0]
const foreignKeyConstraintsPath = args[1]

class pgDatabase {
    constructor(tablenames, fkeyCons) {
        this.tablenames = tablenames;
        this.fkeyCons = fkeyCons
    }

    exportAs(datastructureType) {
        if (datastructureType == 'ForeignKeyTree') {
            /**
             * should export a tree like structure equivalent to the 
             * foreign key hierarchy of db.
             */
        }
    }

    tablesArrayFor(treeClass) {
        // this could be prep function for a function that build
        // the tree of fkey constraints
        // Use FkeyTree.sortByBranch for this
        let tables = new Array()
        if (treeClass == 'ForeignKeyTree') {
            // add fkey constraints as parent/child rel
            for (let fkeyCon of this.foreignKeyConstraints) {
                tables.push(new Table(fkeyCon.Parent, fkeyCon.Child))
            }
            
            for (let tablename of this.tablenames) {
                // add tables (who are not in a fkey constraint) as parent-null relationships
                if (tables.some(table => table.parent != tablename) && !tables.some(table => table.hasChild(tablename))) {
                    tables.push(new Table(tablename))
                }

                // add children in fkey constraints, who does not have a child themselves
                if (tables.some(table => table.parent != tablename) && tables.some(table => table.hasChild(tablename))) {
                    tables.push(new Table(tablename))
                }
            }

        }

        return tables

    }
}

class Table {
    constructor(parent, children = []) {
        this.parent = parent        
        this.children = children
    }

    get child() {
        if (this.children != null) {
            return this.children[0]
        }
        return null

    }

    get children() {
        return this._children
    }

    set children(children) {
        if (typeof children == null) {
            this._children = null;
        }

        if (typeof children == 'string') {
            this._children = new Array()
            this._children.push(children)
        }

        if (Array.isArray(children)) {
            this._children = children;
        }
    }

    addChild(child) {
        this.children.push(child)
    }

    hasChild(potentialChild) {
        // checks if a potential child actually is a child of this table
        // input must be a string name of the table
        if (this.parent == 'child_of_budget') {
            console.log()
        }
        return this.children.some(child => child == potentialChild)
    }
}


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
            let tables = this.tree.sortByGeneration()
            let sortedTablesNames = this.tree.sortByGeneration().map(table => table.parent).filter(table => table != 'root')

            // concatenate tables in one string, separated by \n char
            // write it to tablenames for use before copying data 
            // in fkey consistent order
            let sortedTableNamesString = ""
            for (let tableName of sortedTablesNames) {
                sortedTableNamesString += `${tableName}\n`
            }

            try {
                fs.writeFileSync(writePath, sortedTableNamesString)
            } catch (err) {
                console.error(err)
            }
        }

    }
}

class ForeignKeyTree {
    constructor(tables) {
        this.tables = tables;
        this.visited = new Array()
        this.queue = new Array()
        this.root = new Table('root')
        this.#addRootChildren()

    }

    // MAKING THE TREE

    #parents() {
        // return array of names of unique parents.
        let parentArray = this.tables.map(table => table.parent)
        let uniqueParents = [...new Set(parentArray)]
        return uniqueParents
    }

    #children() {
        // returns array of unique names of children.
        let childrenArray = this.tables.map(table => table.child)
        let uniqueChildren = new Array();
        for (let child of childrenArray) {
            if (child != null && !uniqueChildren.includes(child)) {
                uniqueChildren.push(child)
            }
        }
        return uniqueChildren
    }

    #addRootChildren() {
        // will return root with child notes, that have no parents
        let parents = this.#parents()

        let children = this.#children()

        // Add names of tables who is not itself a child of a node.
        // Tables correspond to first generation of the tree
        // and will thus be added to root
        for (let parent of parents) {
            if (!children.includes(parent)) {
                this.tables.push(new Table('root', parent))
            }
        }
    }
    
    #sortTables(method) {
        // will build tree with BFS approach
        let visited = []
        this.queue.push(this.root)
        
        while (this.queue.length > 0) {
            let visitTable;
            if (method == 'bfs') {
                visitTable = this.queue.shift()
            } else if (method == 'dfs') {
                visitTable = this.queue.pop()
            }
            
            let children = this.tables.filter(table => table.parent == visitTable.parent).map(table => table.child).filter(child => child != null)
                visitTable.children = children


            for (let child of visitTable.children) {
                this.queue.push(new Table(child))
            }
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

let pb2db = new pgTableReader(tablenamesPath, foreignKeyConstraintsPath)

tables = pb2db.tablesFor('ForeignKeyTree')

let fkTree = new ForeignKeyTree(tables)

let tableWriter = new pgTableWriter(fkTree)
tableWriter.write(tablenamesPath)





/**
 * TEST DATA FROM ForeignKeyTree SORTING ALGORITHMS
 * 
 * 
 * root
 * - b
 * - a
 * - - c
 * - - - d
 * - f
 * - - g
 * - - - h
 * - - - - i


let fkAC = new Table('a', 'c')
let fkAD = new Table('a', 'd')
let fkB = new Table('b')
let fkCE = new Table('c', 'e')
let fkFG = new Table('f', 'g')
let fkGH = new Table('g', 'h')
let fkHI = new Table('h', 'i')
let tables = [fkCE, fkAD, fkB, fkAC, fkGH, fkHI, fkFG, fkAC]

 */
