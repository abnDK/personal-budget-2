// sorts tables in order of generation.
// I.e. grandparents comes before parents, parents before children and so forth
// used for inserting data into database in an order
// that doesn't violate any foreign key constraints.


const fs = require('fs')
const { parse } = require('csv-parse/sync')


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



class Table {
    constructor(name) {
        this.name = name;
        this.children = []
    }

    addChild(child) {
        // TODO check if child with same name already exists. Then skip
        if (this.children.includes(existingChild => existingChild.name == child.name)) {
            return
        }
        this.children.append(child)
    }

    known(table) {
        this.children.includes(table.name) ? true : false
    }
}

class Tabletree {
    constructor(tablenamesPath, foreignKeyConstraintsPath) {
        this.tablenamesPath = tablenamesPath;
        this.foreignKeyConstraintsPath = foreignKeyConstraintsPath;
        this.tree = {}
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
            console.log(foreignKeyConstraints)
            this.foreignKeyConstraints = foreignKeyConstraints
        } catch (err) {
            console.log(err)
        }
    }

    writeFile() {
        console.log(this.tabletree)
    }

    known(newTable) {
        return (this.tree.includes(table => table.Parent == newTable.name) ? true : false)
    }



    sortByGeneration() {
        // build table tree from 2 files
        // tablenames
        // [A, B, C]
        // and
        // foreignKeyConstraints
        // | parent | child |
        

        for (const table of this.tablenames) {

            const newTable = new Table(table)

            // check if table has fkey relationship on it
            if (this.foreignKeyConstraints.includes(fkeyRel => fkeyRel.Parent == newTable.name)) {
                for (const fkeyCon of this.foreignKeyConstraints) {
                    if (fkeyCon.Parent == newTable.name) {
                        newTable.addChild(fkeyCon.Child)
                    }
                    
            }

            if (this.known(newTable)) {
                // if known, add child to known table
                let parent = this.tree.find(knownTable => knownTable.name == newTable.name)
                parent.addChild(newTable)

            } else {

                // if unknown, check if table is a parent in a fkey relationship
                if (this.foreignKeyConstraints.includes(fkeyRel => fkeyRel.Parent == table)) {
                    const fkeyRel = this.foreignKeyConstraints.find(fkeyRel => fkeyRel.Parent == table)
                    // append child to table
                    newTable.addChild(fkeyRel.Child)
                }

                // else table is a genereation 0 (no fkey constraints referencing it)
                this.knownTables.append(newTable)
                
            }
            

        }

    }
}

const tabletree = new Tabletree('./tablenames', './foreign_key_constraints.csv');
tabletree.readTablenames()
tabletree.readForeignKeyConstraints()