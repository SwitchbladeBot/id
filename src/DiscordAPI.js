const axios = require('axios').default
const { default: base64url } = require('base64url')
const queryString = require('querystring')

module.exports = class DiscordAPI {
  constructor () {
    this.clientId = process.env.DISCORD_CLIENT_ID
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET
    this.scopes = process.env.DISCORD_SCOPES.split(',')
    this.discordBaseUrl = 'https://discord.com/api/v6'
    this.serverBaseUrl = process.env.BASE_URL
    this.redirectUri = `${process.env.BASE_URL}/api/callback`

    this.axios = axios.create({ 
      baseURL: this.discordBaseUrl
    })
  }

  getAuthorizeUrl (query) {
    return `${this.discordBaseUrl}/oauth2/authorize?${queryString.stringify({
      client_id: this.clientId,
      redirect_uri: `${this.serverBaseUrl}/api/callback`,
      response_type: 'code',
      scope: this.scopes.join(' '),
      state: query ? base64url.encode(JSON.stringify({ redirect_to: `/authorize?${queryString.encode(query)}` })) : null
    })}`
  }

  exchangeCode (code) {
    const body = queryString.stringify({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      code
    })

    return this.axios.post('/oauth2/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => res.data)
  }

  // TODO: Attempt to refresh access tokens when this request fails
  getUser (accessToken) {
    return this.axios.get('/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }).then(res => res.data)
  }
}