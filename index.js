
// entrypoint for Personal Budget 2 @ Codecademy


const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World\n')
})

app.get('/envelopes', (req, res) => {
    res.send(['A', 'B', 'C'])
})

app.listen(port, ()=>{
    console.log(`Personal budget 2, ready for implementation on port ${port}`)
})

