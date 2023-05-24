// routes for envelope table
const express = require('express')
const router = express.Router()

const db = require('../models/envelope');


router.get('/', db.getEnvelopes)

router.get('/:id', db.getEnvelopeById)

router.post('/', db.createEnvelope)

// router.delete('/:id', db.deleteEnvelope)

router.put('/:id', db.updateEnvelope)


// GET /envelopes
// POST /envelopes
// GET /envelopes/{envelopeId}
// DELETE /envelopes/{envelopeId}


module.exports = router