const request = require('superagent');
  
function requestAccessToken(code,state) {
    return request.post('https://www.linkedin.com/oauth/v2/accessToken')
        .send('grant_type=authorization_code')
        .send(`redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}/linkedin`)
        .send(`client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}`)
        .send(`client_secret=${process.env.EXPRESS_APP_CLIENT_SECRET}`)
        .send(`code=${code}`)
        .send(`state=${state}`)
}

function requestProfile(token) {
    return request.get('https://api.linkedin.com/v2/me?projection=(id,vanityName,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))')
    .set('Authorization', `Bearer ${token}`)
}

function requestEmail(token) {
  return request.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))')
  .set('Authorization', `Bearer ${token}`)
}

function linkedin_token(req, res) {
    return requestAccessToken(req.query.code,req.query.state)
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

module.exports = linkedin_token