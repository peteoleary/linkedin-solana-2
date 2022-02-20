require('dotenv').config()
const express = require('express')
const app = express()
const { ping, linkedin_token } = require( './routes');
const path = require('path');

app.use(express.static('dist'))

app.get('/ping', ping)
app.get('/linkedin_token', linkedin_token)

app.get('*', (req,res) =>{
    res.sendFile(path.join(process.cwd() + '/dist/index.html'));
});

let port = process.env.PORT || 3001

app.listen(port, () => console.log(`Listening on port ${port}!`))