// entrypoint for Personal Budget 2 @ Codecademy

// const path = import('path');
import { dirname } from 'path';
import path from 'path'
import { fileURLToPath } from 'url';
import express from 'express';
import bodyParser from 'body-parser';
// const morgan = import('morgan');
import morgan from 'morgan'
const app = express();
const port = 3000;
// const globalErrorHandler = import('./src/controllers/errorController')
import {globalErrorHandler} from './src/controllers/errorController.js'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded(
    {
        extended: true
    }
))

// set logging
app.use(morgan('common'));



// setting env-variable.
// See https://www.npmjs.com/package/dotenv AND https://nodejs.dev/en/learn/how-to-read-environment-variables-from-nodejs/
// for more.

import 'dotenv/config';
console.log(`Starting server with username ${process.env.USERNAME}`)
console.log(`Starting server in mode "${process.env.NODE_ENV}"`)
console.log("For running in either 'production' or 'development' mode: 'export NODE_ENV=<mode>' before running server")

// setting up views and view engine
//console.log(__dirname, __filename)


const __dirname = dirname(fileURLToPath(import.meta.url));
app.set('views', path.join(__dirname, './src/static/views'))
app.set('view engine', 'pug')
app.use(express.static('./src/static'))

// setting up routes
import transactionRouter from './src/routes/v1.3/transactionRouter.js';
import categoryRouter from './src/routes/v1.3/categoryRouter.js';
import budgetRouter from './src/routes/v1.3/budgetRouter.js';
//const reports = require('./src/routes/reportsRouter')


app.use('/categories', categoryRouter)
app.use('/transactions', transactionRouter)
app.use('/budgets', budgetRouter)
//app.use('/reports', reports) // TODO: UPDATE FOR 1.3

app.get('/', (req, res) => {
    res.status(200).send(
        '<html><h1>Welcome to PB2</h1></html>'
    )
})



// set up error messages (global error handling middleware)
app.use(globalErrorHandler);


app.listen(port, ()=>{
    console.log(`Personal budget 2, ready for implementation on port ${port}`)
})

