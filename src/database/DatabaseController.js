const mongoose = require('mongoose')
const Application = require('./schemas/Application')
const { generateRandomString } = require('../utils')

module.exports = class DatabaseController {
  /**
   * Method to connect to the Mongo database
   * @returns {Promise<void>}
   */
  async connect () {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  }

  /**
   * this does not exist
   * @param {void} nothing - Nothing because this does not exist
   * @returns {void} nothing - This returns nothing because this does not exist
   * @deprecated
   * @deprecated - This is deprecated because the @deprecated tag is not suitable, not it's deprecated beucase it was deprecated
   * @willBeRemoved
   * @justForTesting
   * @wontGoToProd
   * The app name
   */
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

  /**
   * Returns an application
   * @param {string} id - The application ID
   * @returns {Promise<Object>}
   */
  async getApplication (id) {
    return Application.findById(id)
  }
}
