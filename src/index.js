const path = require('path')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const { MongoClient } = require('mongodb')
const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true })
const cryptoRandomString = require('crypto-random-string')

const DiscordAPI = require('./DiscordAPI')
const discord = new DiscordAPI()

const base64url = require('base64url')
const queryString = require('querystring')
const Manager = require('./Manager')
const { default: Axios } = require('axios')

let database
let manager = new Manager()

const validScopes = [
  'identify',
  'music.playback',
  'music.playlists'
]

const validResponseTypes = [
  'code',
  'token'
]

client.connect().then(() => {
  database = client.db('id')
  manager.setDatabase(database)
  console.log('Connected to the database')
  app.listen(process.env.PORT || 8080)
  console.log('Listening on port 8080!')
})

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(require('morgan')('tiny'))

app.use(async (req, res, next) => {
  if (!req.cookies['session']) return next()
  const session = await manager.getSession(req.cookies['session'])
  if (!session) return next()
  if (session.user_agent !== req.get('User-Agent')) return next()
  const discordTokens = await manager.getDiscordTokens(session.user_id)
  req.session = session
  req.discordTokens = discordTokens
  const user = await discord.getUser(discordTokens.access_token)
  req.user = user
  next()
})

app.get('/', (req, res) => {
  res.redirect('/login')
})

app.get('/api/login', (req, res) => {
  res.json({
    application,
    login_url: discord.getAuthorizeUrl()
  })
})

app.get('/api/callback', async (req, res) => {
  let redirectPath = '/authorize'

  if (req.query.state) {
    const decoded = JSON.parse(base64url.decode(req.query.state))
    if (decoded.redirect_to) {
        redirectPath = decoded.redirect_to
    } else {
      return res.status(500).send('Bad request, invalid state!')
    }
  }

  const response = await discord.exchangeCode(req.query.code)
  const user = await discord.getUser(response.access_token)
  const sessionId = await manager.createSession(user.id, req.get('User-Agent'))
  await manager.updateDiscordTokens(user.id, response.access_token, response.refresh_token, response.expires_in)

  res.cookie('session', sessionId, {
    maxAge: 1000000000000000
  }).redirect(redirectPath)
})

const requiredQueryParams = [
  'client_id',
  'scope',
  'response_type',
  'redirect_uri',
]

app.get('/api/authorize', async (req, res) => {
  if (!req.session) return res.json({ location: discord.getAuthorizeUrl(req.query) })
  for (const param of requiredQueryParams) {
    if (!req.query[param]) return res.json({ error: 'invalid_request', error_description: `Missing '${param}' parameter` })
  }
  
  const application = await manager.getClient(req.query.client_id)
  if (!application) return res.json({ error: `invalid client_id` })
  if (!application.redirect_uris.includes(req.query.redirect_uri)) return res.json({ error: `invalid redirect_uri` })

  if (!['code', 'token'].includes(req.query.response_type)) return res.json({ error: 'unsupported_response_type' })
  if (!req.query.scope.split(' ').every(s => validScopes.includes(s))) return res.json({ error: 'invalid_scope' })

  res.json({
    application: {
      name: application.name,
      image: application.image,
      verified: application.verified
    },
    user: req.user
  })
})

app.post('/api/authorize', async (req, res) => {
  if (!req.session) return res.json({ location: discord.getAuthorizeUrl(req.query) })
  for (const param of requiredQueryParams) {
    if (!req.query[param]) return res.json({ error: `missing ${param}` })
  }

  const application = await manager.getClient(req.query.client_id)
  if (!application) return res.json({ error: `invalid client_id` })
  if (!application.redirect_uris.includes(req.query.redirect_uri)) return res.json({ error: `invalid redirect_uri` })

  if (!req.query.scope.split(' ').every(s => validScopes.includes(s))) return res.json({ error: 'invalid_scope' })

  const state = req.query.state ? { state: req.query.state } : {}
  if (req.body.authorize) {
    switch (req.query.response_type) {
      case 'code':
        const authorizationCode = await manager.createAuthorizationCode(req.query.client_id, req.user.id, req.query.scope.split(' '), req.query.redirect_uri)
        res.json({ location: `${req.query.redirect_uri}?${queryString.stringify({
          code: authorizationCode,
          ...state
        })}` })
        break
      case 'token':
        const accessToken = await manager.createAccessToken(req.user.id, req.query.client_id, req.query.scope.split(' '))
        res.json({ location: `${req.query.redirect_uri}#${queryString.stringify({
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: manager.accessTokenTTL,
          ...state
        })}` })
        break
      default:
        res.json({ error: 'unsupported_response_type' })
        break
    }
  } else {
    res.json({ location: `${req.query.redirect_uri}?${queryString.stringify({
      error: 'access_denied',
      error_description: 'The user denied the request',
      ...state
    })}` })
  }
})

app.get('/api/@me', async (req, res) => {
  if (!req.headers.authorization) return res.status(401).send({ error: 'unauthorized' })
  const [ type, token ] = req.headers.authorization.split(' ')
  if (type !== 'Bearer') return res.status(401).json({ error: 'unauthorized' })
  const accessToken = await manager.getAccessToken(token)
  if (!accessToken || manager.getCurrentTimestamp() > accessToken.expires_at || !accessToken.scope.includes('identify')) return res.status(401).send({ error: 'unauthorized' })
  const discordTokens = await manager.getDiscordTokens(accessToken.user_id)
  const user = await discord.getUser(discordTokens.access_token)
  res.json({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    discriminator: user.discriminator,
    locale: user.locale
  })
})

app.get('/api/token_info', async (req, res) => {
  if (!req.headers.authorization) return res.status(401).send({ error: 'unauthorized' })
  const [ type, data ] = req.headers.authorization.split(' ')
  if (type !== 'Basic') return res.status(401).json({ error: 'unauthorized' })
  const [ serviceId, serviceSecret ] = Buffer.from(data, 'base64').toString('ascii').split(':')
  const service = await manager.getInternalService(serviceId)
  if (!service || serviceSecret !== service.secret || !service.introspect) return res.status(401).json({ error: 'unauthorized' })
  if (!req.body.token) return res.status(500).json({ error: 'bad_request' })
  const accessToken = await manager.getAccessToken(req.body.token)
  if (!accessToken || manager.getCurrentTimestamp() > accessToken.expires_at) return res.json({ active: false })
  res.json({
    active: true,
    scope: accessToken.scope.join(' '),
    client_id: accessToken.client_id,
    sub: accessToken.user_id,
    exp: accessToken.expires_at
  })
})

app.post('/api/token', async (req, res) => {
  console.log(req.body)
  console.log(req.headers)
  for (const param of [ 'grant_type', 'code', 'client_id' ]) {
    if (!req.body[param]) return res.json({
      error: 'invalid_request',
      error_description: `Missing '${param}' parameter`
    })
  }
  
  const client = await manager.getClient(req.body.client_id)
  const clientSecret = req.body.client_secret || Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('ascii').split(':')[1]
  if (!client || clientSecret !== client.secret) return res.status(401).json({ error: 'invalid_client' })

  const authorizationCode = await manager.getAuthorizationCode(req.body.code)
  if (!authorizationCode || authorizationCode.used || authorizationCode.expires_at < new Date().getTime() / 1000) return res.json({ error: 'invalid_grant' })
  if (authorizationCode.client_id !== req.body.client_id) return res.status(401).json({ error: 'invalid_client' })

  switch (req.body.grant_type) {
    case 'authorization_code':
      const accessToken = await manager.createAccessToken(authorizationCode.user_id, authorizationCode.client_id, authorizationCode.scope)
      const refreshToken = await manager.createRefreshToken(authorizationCode.user_id, authorizationCode.client_id, authorizationCode.scope)
      res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: manager.accessTokenTTL,
      })
      manager.useAuthorizationCode(req.body.code)
      break
    case 'refresh_token':
      res.send('TODO')
      break
    default:
      res.json({ error: 'unsupported_grant_type' })
      break
  }
})

app.use('/', express.static(path.join(__dirname, '..', 'frontend', 'build')))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html')))