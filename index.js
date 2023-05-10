
// entrypoint for Personal Budget 2 @ Codecademy


const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded(
    {
        extended: true
    }
))


// setting env-variable.
// See https://www.npmjs.com/package/dotenv AND https://nodejs.dev/en/learn/how-to-read-environment-variables-from-nodejs/
// for more.
require('dotenv').config();
console.log(`Starting server with username ${process.env.USERNAME}`)


// setting up routes
const envelopes = require('./src/routes/envelopeRouter')
const expenses = require('./src/routes/expenseRouter')
const reports = require('./src/routes/reportsRouter')


app.use('/envelopes', envelopes)
app.use('/expenses', expenses)
app.use('/reports', reports)

app.get('/', (req, res) => {
    res.status(200).send(
        '<html><h1>Welcome to PB2</h1></html>'
    )
})


app.listen(port, ()=>{
    console.log(`Personal budget 2, ready for implementation on port ${port}`)
})

