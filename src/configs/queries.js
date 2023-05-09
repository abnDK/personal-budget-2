const Pool = require('pg').Pool

const config = require('./db.config');

const pool = new Pool({
  user: config.USERNAME,
  host: 'localhost',
  database: config.DATABASE_NAME,
  password: config.PASSWORD,
  port: 5432,
})

module.exports = pool


// config = username etc
// queries = create pool file
// envelopeRouter = setup routes, export router
// index = app.use(router)