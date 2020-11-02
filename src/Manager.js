const cryptoRandomString = require('crypto-random-string')

/*
  {
    client_id: String,
    client_secret: String,
    verified: Boolean,
    name: String,
    image: String,
    redirect_uris: [String]
  }
*/

module.exports = class Manager {
  constructor (database) {
    this.database = database,

    this.authorizationCodeTTL = 300, // 5 minutes
    this.accessTokenTTL = 21600 // 6 hours
    this.refreshTokenTTL = 2628e+6 // 1 month
  }

  setDatabase (database) {
    this.database = database
  }

  generateRandomString () {
    return cryptoRandomString({ length: 32, type: 'alphanumeric' })
  }

  async updateDiscordTokens (userId, accessToken, refreshToken, expiresIn) {
    return this.database.collection('discord_tokens').updateOne({
      _id: userId
    }, {
      $set: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: this.getCurrentTimestamp() + expiresIn
      }
    }, {
      upsert: true
    })
  }

  async getDiscordTokens (userId) {
    return this.database.collection('discord_tokens').findOne({ _id: userId })
  }

  async createSession (userId, userAgent) {
    const sessionId = this.generateRandomString()
    await this.database.collection('sessions').insertOne({
      _id: sessionId,
      user_id: userId,
      user_agent: userAgent
    })
    return sessionId
  }

  async getSession (sessionId) {
    return this.database.collection('sessions').findOne({ _id: sessionId })
  }

  async createAuthorizationCode (clientId, userId, scope, redirectUri) {
    const authorizationCode = this.generateRandomString()
    await this.database.collection('authorization_codes').insertOne({
      _id: authorizationCode,
      client_id: clientId,
      user_id: userId,
      scope: scope,
      redirect_uri: redirectUri,
      expires_at: this.getCurrentTimestamp() + this.authorizationCodeTTL
    })
    return authorizationCode
  }

  async getAuthorizationCode (authorizationCode) {
    return this.database.collection('authorization_codes').findOne({ _id: authorizationCode })
  }

  async useAuthorizationCode (authorizationCode) {
    return this.database.collection('authorization_codes').updateOne({
      _id: authorizationCode
    }, {
      $set: {
        used: true
      }
    })
  }

  async getInternalService (serviceId) {
    return this.database.collection('internal_services').findOne({ _id: serviceId })
  }

  async createAccessToken (userId, clientId, scope) {
    const accessToken = this.generateRandomString()
    await this.database.collection('access_tokens').insertOne({
      _id: accessToken,
      client_id: clientId,
      user_id: userId,
      scope: scope,
      expires_at: this.getCurrentTimestamp() + this.accessTokenTTL
    })
    return accessToken
  }

  getAccessToken (accessToken) {
    return this.database.collection('access_tokens').findOne({ _id: accessToken })
  }

  async createRefreshToken (userId, clientId, scope) {
    const refreshToken = this.generateRandomString()
    await this.database.collection('refresh_tokens').insertOne({
      _id: refreshToken,
      client_id: clientId,
      user_id: userId,
      scope: scope,
      expires_at: this.getCurrentTimestamp() + this.refreshTokenTTL
    })
    return refreshToken
  }

  async getClient (clientId) {
    return this.database.collection('clients').findOne({ _id: clientId })
  }

  getCurrentTimestamp() {
    return Math.round(Date.now() / 1000)
  }
}