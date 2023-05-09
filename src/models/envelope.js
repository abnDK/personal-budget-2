const pool = require("../configs/queries.js");



const getEnvelopes = (req, res) => {
    pool.query('SELECT * FROM envelope ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
}

const getEnvelopeById = (req, res, next) => {

    const id = req.params.id;

    pool.query('SELECT * FROM envelope WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
}


const createEnvelope = (req, res) => {
    const { name, amount } = req.body;
    
    pool.query('INSERT INTO envelope (name, amount) VALUES ($1, $2) RETURNING *', [name, amount], (error, results) => {
        if (error) {
            throw error
        }
        res.status(201).send(`Envelope added with ID: ${results.rows[0].id}`);
    })
}


const updateEnvelope = (req, res) => {

    const id = parseInt(req.params.id);
    const { name, amount } = req.body;

    pool.query('UPDATE envelope SET name = $1, amount = $2 WHERE id = $3', [name, amount, id], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).send(`Envelope modified with ID: ${id}`)
    })


}

const deleteEnvelope = (req, res) => {

}


// EXPORT FUNCTIONS... or router entirely?

module.exports = {
    getEnvelopes,
    getEnvelopeById,
    createEnvelope,
    updateEnvelope,
    deleteEnvelope
}