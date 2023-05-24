const pool = require("../configs/queries.js");



const getExpenses = (req, res) => {
    pool.query('SELECT * FROM expense ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
}

const getExpenseById = (req, res) => {

    const id = parseInt(req.params.id);

    pool.query('SELECT * FROM expense WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
}


const createExpense = (req, res) => {
    const { name, amount, date, envelope_id } = req.body;
    
    pool.query('INSERT INTO expense (name, amount, date, envelope_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, amount, date, envelope_id], (error, results) => {
        if (error) {
            throw error
        }
        res.status(201).send(`expense added with ID: ${results.rows[0].id}`);
    })
}


const updateExpense = (req, res) => {

    const id = parseInt(req.params.id);
       
    const { name, amount, date, envelope_id } = req.body;

    if (!name || !amount || !date ) {
        res.status(400).json({"message": "Name, amount and/or date needed in order to update expense."});
        return;
    }

    if (!id) {
        res.status(400).json({"message": "Id needed in order to update expense."});
        return;
    }

    if (!envelope_id) {
        res.status(400).json({"message": "Envelope id needed in order to update expense."});
        return;
    }

    pool.query('UPDATE expense SET name = $1, amount = $2, date = $3 WHERE id = $4', [name, amount, date, id], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).send(`Expense modified with ID: ${id}`)
    })


}

const deleteExpense = (req, res) => {

    const id = parseInt(req.params.id);

    pool.query('DELETE FROM expense WHERE id = $1 RETURNING *', [id], (error, results) => {
        
        if (error) {
            throw error
        }

        if (results.rows.length != 0) {
            res.status(200).send(`Envelope deleted with ID: ${id}`)
        } else {
            res.status(400).send(`No envelope found with id: ${id}`)
        }
    })

    

}


module.exports = {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense
}