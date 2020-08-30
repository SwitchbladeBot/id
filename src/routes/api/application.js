const {json} = require('express')
const {supported_scopes: supportedScopes} = require('../../../config.json')
const aes256 = require('aes256')
const cookieEncryptionKey = process.env.COOKIE_ENCRYPTION_PASSPHRASE
const {getUser} = require('../../api/discord')

/**
 * Application route
 * @description This route is used for the client to access information about a client
 * @param {Object} context - The context provided to the route
 */
module.exports = ({router, database}) => {
  /**
   * This endpoint receives a JSON object on the body and creates a new app, returning the new app.
   * It also needs an authorization to do so, passed on the Authorization header, with the value "Admin <ADMIN_PASSWORD env vai>"
   * @deprecated This endpoint is not secure and it's only used for testing. On prod this will be changed
   */
  router.post('/application', json(), async (req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).send('Missing authentication')
    }
    if (req.headers.authorization !== `Admin ${process.env.ADMIN_PASSWORD}`) {
      return res.status(401).send('Unauthorized')
    }

    try {
      console.log(req.body)
      const app = await database.createApplication(req.body)
      res.json(app)
    } catch (e) {
      res.status(400).json(e.toString())
    }
  })

  /**
   * This endpoint will be used by the front-end client to retrieve information about the application and the user to render on the website.
   * It also needs the discord authentication cookies to authorize the user and send it's information.
   * This endpoint also verifies the request, matching the callback URIs and the scopes.
   * @todo Make it return JSON errors, to better represent on the website
   */
  router.get('/application', async (req, res) => {
    if (req.cookies.discord_access_token && req.cookies.discord_refresh_token) {
      if (!req.query.client_id || !req.query.redirect_uri || !req.query.scope) return res.status(500).send('Bad Request')

      const app = await database.getApplication(req.query.client_id)

      if (!app) return res.status(404).send('Not found')
      if (!app.callback_uris.includes(req.query.redirect_uri)) return res.status(400).send('Invalid redirect URI')

      const scopes = req.query.scope.split(' ')

      if (!scopes.every(scope => app.allowed_scopes.includes(scope))) return res.status(400).send('Invalid scope')


      if (req.cookies.discord_access_token.length < 17) return res.status(400).send('Invalid authorization')
      const accessToken = aes256.decrypt(cookieEncryptionKey, req.cookies.discord_access_token)
      console.log(accessToken)
      const regex = /^[0-9a-zA-Z]+$/
      if (!accessToken.match(regex)) return res.status(400).send('Invalid authorization')
      // const refreshToken = aes256.decrypt(cookieEncryptionKey, req.cookies.discord_refresh_token)

      try {
        const user = await getUser(accessToken)
        res.json({
          user: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            discriminator: user.discriminator
          },
          application: {
            id: app.id,
            name: app.name,
            image: app.image,
            verified: app.verified
          }
        })
      } catch (e) {
        res.status(500).send('Something weird happened')
      }
    } else {
      res.status(401).send('Unauthorized')
    }
  })
}
