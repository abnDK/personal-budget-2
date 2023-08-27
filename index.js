// entrypoint for Personal Budget 2 @ Codecademy

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const port = 3000;
 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded(
    {
        extended: true
    }
))
app.use(morgan('common'));


// setting env-variable.
// See https://www.npmjs.com/package/dotenv AND https://nodejs.dev/en/learn/how-to-read-environment-variables-from-nodejs/
// for more.
require('dotenv').config();
console.log(`Starting server with username ${process.env.USERNAME}`)

// setting up views and view engine
//console.log(__dirname, __filename)
app.set('views', path.join(__dirname, './src/static/views'))
app.set('view engine', 'pug')
app.use(express.static('./src/static'))

// setting up routes
const transactionRouter = require('./src/routes/v1.3/transactionRouter')
const categoryRouter = require('./src/routes/v1.3/categoryRouter')
const budgetRouter = require('./src/routes/v1.3/budgetRouter')
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



app.listen(port, ()=>{
    console.log(`Personal budget 2, ready for implementation on port ${port}`)
})

