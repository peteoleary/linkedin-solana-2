// routes/default.js
function ping(req, res) {
    res.send('hello world!');
}

function linkedin_token(req, res) {
    const name = req.params.name ?? "world";
    res.send(`hello ${name}!`);
}

module.exports = {ping, linkedin_token}