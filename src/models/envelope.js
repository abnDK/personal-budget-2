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

    const id = parseInt(req.params.id);

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

    if (!name || !amount) {
        res.status(400).json({"message": "Name and/or amount needed in order to update envelope."});
        return;
    }

    if (!id) {
        res.status(400).json({"message": "Id needed in order to update envelope."});
        return;
    }

    pool.query('UPDATE envelope SET name = $1, amount = $2 WHERE id = $3', [name, amount, id], (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).send(`Envelope modified with ID: ${id}`)
    })


}

const deleteEnvelope = (req, res, next) => {
    const id = parseInt(req.params.id);

    pool.query('DELETE FROM envelope WHERE id = $1 RETURNING *', [id], (error, results) => {
        
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
    getEnvelopes,
    getEnvelopeById,
    createEnvelope,
    updateEnvelope,
    deleteEnvelope
}