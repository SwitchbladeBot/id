const queryString = require('querystring')
const axios = require('axios').default
const base64url = require('base64url')
const aes256 = require('aes256')
const cookieEncryptionKey = process.env.COOKIE_ENCRYPTION_PASSPHRASE

module.exports = ({router, logger}) => {
  // The URL Discord will redirect users to after they login
  router.get('/callback', async (req, res) => {
    const redirectUri = `${process.env.BASE_URL}${process.env.DISCORD_CALLBACK_PATH}`

    const body = queryString.stringify({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: redirectUri,
      scope: process.env.DISCORD_SCOPES.split(',').join(' ')
    })


    try {
      const { data } = await axios.post('https://discord.com/api/oauth2/token', body, {
        headers: {
          'content-Type': 'application/x-www-form-urlencoded'
        }
      })
      let redirectPath = '/success'

      if (req.query.state) {
        const decoded = JSON.parse(base64url.decode(req.query.state))
        if (decoded.redirect_to) {
            redirectPath = decoded.redirect_to
        } else {
          res.status(500).send('Bad request!')
        }
      }


      res
        .cookie('discord_access_token', aes256.encrypt(cookieEncryptionKey, data.access_token))
        .cookie('discord_refresh_token', aes256.encrypt(cookieEncryptionKey, data.refresh_token))
        .redirect(`${process.env.BASE_URL}${redirectPath}`)
    } catch (e) {
      console.error(e)
      res.send('something wrong happened')
    }
  })
}
