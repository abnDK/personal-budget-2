import Pool from 'pg';
import config from './db.config.js';
export const pool = new Pool.Pool({
    user: config.USERNAME,
    host: 'localhost',
    database: config.DATABASE_NAME,
    password: config.PASSWORD,
    port: 5432,
});
// config = username etc
// queries = create pool file
// envelopeRouter = setup routes, export router
// index = app.use(router)
