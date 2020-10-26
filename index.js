const express = require('express')
const path = require('path')
const app = express()

app.get('/api/login', (req, res) => {
  setTimeout(() => {
    res.json({
      application: {
        image: 'https://cdn-2.musicorumapp.com/apps/5YDasZrzHFXwEKKPr85n74rSVPDmqe4N.png',
        name: 'Musicorum',
        verified: true
      },
      login_url: '/callback'
    })
  }, 1800)
})

app.get('/api/callback', (req, res) => {
  setTimeout(() => {
    res.redirect('/authorize')
  }, 300)

})

app.get('/api/authorize', (req, res) => {
  setTimeout(() => {
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
  }, 800)
})

app.use('/', express.static(path.join(__dirname, 'frontend', 'build')))

app.listen(process.env.PORT || 8080)

console.log('Listening on port 8080!')
