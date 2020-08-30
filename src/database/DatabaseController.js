const mongoose = require('mongoose')
const Application = require('./schemas/Application')
const { generateRandomString } = require('../utils')

module.exports = class DatabaseController {
  async connect () {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  }

  async createApplication (data) {
    const app = new Application({
      _id: generateRandomString(32),
      secret: generateRandomString(32),
      allowed_scopes: data.allowed_scopes,
      name: data.name,
      image: data.image,
      verified: data.verified,
      callback_uris: data.callback_uris
    })

    await app.save()

    return app
  }

  async getApplication (id) {
    return Application.findById(id)
  }
}
