require('dotenv').config()
const express = require('express')
const app = express()
const { ping, linkedin_token } = require( './routes');

app.use(express.static('dist'))
app.get('/ping', ping)
app.post('/linkedin_token', linkedin_token)

let port = process.env.PORT || 3001

app.listen(port, () => console.log(`Listening on port ${port}!`))