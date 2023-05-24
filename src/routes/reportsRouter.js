// router for getting reports


const Router = require('express-promise-router')
const router = new Router();

const db = require('../services/reports');

router.get('/:id', db.getReportByEnvelopeId)

router.get('/', db.reportTest)

module.exports = router