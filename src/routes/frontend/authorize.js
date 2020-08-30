const queryString = require('querystring')
const path = require('path')
const { supported_scopes: supportedScopes } = require('../../../config.json')

module.exports = ({router}) => {
  router.get('/authorize', async (req, res) => {
    if (req.headers.authorization) {
      res.send({
        ok: true
      })
    } else {
      if (req.cookies.discord_access_token && req.cookies.discord_refresh_token) {
        if (!req.query.scope) return res.status(500).send('Bad Request')
        if (!req.query.scope.split(' ').every(s => supportedScopes.includes(s))) return res.status(500).send('Invalid scopes')

        // const accessToken = aes256.decrypt(cookieEnctryptionKey, req.cookies.discord_access_token)
        // const refreshToken = aes256.decrypt(cookieEnctryptionKey, req.cookies.discord_refresh_token)

        res.sendFile(path.resolve('src', 'views', 'authorize.html'))

      } else {
        res.redirect(`/login?${queryString.stringify({
          redirect_to: req.originalUrl
        })}`)
      }
    }
  })
}
