const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')

const { MongoClient } = require('mongodb')
const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true })

const queryString = require('querystring')

let database

client.connect().then(() => {
  database = client.db('id')
  console.log('Connected to the database')
  app.listen(process.env.PORT || 8080)
  console.log('Listening on port 8080!')
})

app.use(bodyParser.json())

app.get('/api/login', (req, res) => {
  res.json({
    application: {
      image: 'https://cdn-2.musicorumapp.com/apps/5YDasZrzHFXwEKKPr85n74rSVPDmqe4N.png',
      name: 'Musicorum',
      verified: true
    },
    login_url: `https://discord.com/api/oauth2/authorize?${queryString.stringify({
      client_id: process.env.DISCORD_CLIENT_ID,
      redirect_uri: `${process.env.BASE_URL}/api/callback`,
      response_type: 'code',
      scope: process.env.DISCORD_SCOPES.split(',').join(' ')
    })}`
  })
})

app.get('/api/callback', (req, res) => {
  res.redirect('/authorize')
})

app.get('/api/authorize', (req, res) => {
  res.json({
    application: {
      image: 'https://cdn-2.musicorumapp.com/apps/5YDasZrzHFXwEKKPr85n74rSVPDmqe4N.png',
      name: 'Musicorum',
      verified: true,
      scopes: ['playback_control', 'playlists_modify']
    },
    user: {
      image: 'https://cdn.discordapp.com/avatars/205873263258107905/a_df9b77a6ab32c92c03184b4156fc86ba.gif',
      name: 'metehus'
    }
  })
})

app.post('/api/authorize', (req, res) => {
  if (req.body.authorize) {
    res.json({ location: 'http://localhost:3000?code=tgr8uhvb94t65hb8043j58906jnko5e6m' })
  } else {
    res.json({ location: 'http://localhost:3000?error=invalid_grant' })
  }
})

app.use('/', express.static(path.join(__dirname, 'frontend', 'build')))
