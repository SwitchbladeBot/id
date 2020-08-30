const express = require('express')
const app = express()

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const base64url = require('base64url')
const axios = require('axios').default
const querystring = require('querystring')

const aes256 = require('aes256')
const cookieEnctryptionKey = process.env.COOKIE_ENCRYPTION_PASSPHRASE

const winston = require('winston')
const { query, urlencoded } = require('express')
const logger = winston.createLogger()

const redirectUri = `${process.env.BASE_URL}/callback`

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({ level: process.env.LOGGING_LEVEL || 'silly' }))
} else {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        info => `${info.timestamp} ${info.level}${info.label ? ` [${info.label || ''}]` : ''}: ${info.message}`
      )
    ),
    level: process.env.LOGGING_LEVEL || 'silly'
  }))
}

app.get('/', (req, res) => {
  res.send('<a href="/login">Authorize</a>')
})

app.get('/authorize', async (req, res) => {
  if (req.headers.authorization) {
    res.send({
      ok: true
    })
  } else {
    if (req.cookies.discord_access_token && req.cookies.discord_refresh_token) {
      const tokens = {
        access: aes256.decrypt(cookieEnctryptionKey, req.cookies.discord_access_token),
        refresh: aes256.decrypt(cookieEnctryptionKey, req.cookies.discord_refresh_token)
      }
      const user = await getUser(tokens.access, tokens.refresh)
      res.json(user)
    } else {
      res.redirect(`/login?redirect_to=${querystring.escape(`${process.env.BASE_URL}${req.path}?${querystring.stringify(req.query)}`)}`)
    }
  }
})

function getUser (accessToken, refreshToken) {
  return axios.get('https://discord.com/api/v6/users/@me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).then(res => res.data)
}

// User interface where users will be prompted to login and then autorize the app
app.get('/login', (req, res) => {
  let state = {}

  if (req.query.redirect_to) {
    state.redirect_to = req.query.redirect_to
  }

  res.redirect(`https://discord.com/api/oauth2/authorize?${querystring.stringify({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: process.env.DISCORD_SCOPES.split(',').join(' '),
    state: base64url.encode(JSON.stringify(state))
  })}`)
})

app.get('/success', (req, res) => {
  res.send('ayy you\'re logged in')
})

// The URL Discord will redirect users to after they login
app.get('/callback', (req, res) => {
  const body = querystring.stringify({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: redirectUri,
    scope: process.env.DISCORD_SCOPES.split(',').join(' ')
  })
  axios.post('https://discord.com/api/oauth2/token', body, {
    headers: {
      'content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(({ data }) => {
    let redirectPath = '/success'

    if (req.query.state) {
      const decoded = JSON.parse(base64url.decode(req.query.state))

      if (decoded.redirect_to) {
        if (decoded.redirect_to.startsWith(process.env.BASE_URL)) {
          redirectPath = decoded.redirect_to
        } else {
          // Only redirect to the same BASE_URL
          return res.status(500).send('Bad Request')
        }
      }
    }

    res
      .cookie('discord_access_token', aes256.encrypt(cookieEnctryptionKey, data.access_token))
      .cookie('discord_refresh_token', aes256.encrypt(cookieEnctryptionKey, data.refresh_token))
      .redirect(redirectPath)
  })
})

// Token Introspection Endpoint (RFC 7662 https://tools.ietf.org/html/rfc7662)
app.get('/oauth2/token_information', (req, res) => {
  res.send('ok')
})

// Authorization Server Metadata Endpoint (RFC 8414 https://tools.ietf.org/html/rfc8414)
// This can contain a signed_metadata field containing the same information but signed as a JSON Web Token (See Section 2.1 of RFC 8114)
app.get('/oauth2/server_metadata', (req, res) => {
  res.json({
    hello: 'world'
  })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`)
})