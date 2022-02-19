const request = require('superagent');

function ping(req, res) {
    res.send('hello world!');
}
  
function requestAccessToken(code,state) {
    return request.post('https://www.linkedin.com/oauth/v2/accessToken')
        .send('grant_type=authorization_code')
        .send(`redirect_uri=${process.env.EXPRESS_APP_REDIRECT_URI}`)
        .send(`client_id=${process.env.EXPRESS_APP_CLIENT_ID}`)
        .send(`client_secret=${process.env.EXPRESS_APP_CLIENT_SECRET}`)
        .send(`code=${code}`)
        .send(`state=${state}`)
}

function requestProfile(token) {
    return request.get('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))')
    .set('Authorization', `Bearer ${token}`)
}

function linkedin_token(req, res) {
    return requestAccessToken(req.params.code,req.params.state)
    .then((response) => {
      requestProfile(response.body.access_token)
      .then(response => {
        res.send(response.body)
        return Promise.resolve(response.body)
      })
    })
    .catch((error) => {
      res.status(500).send(`${error}`)
      console.error(error)
    })
}

module.exports = {ping, linkedin_token}