const { Schema, model } = require('mongoose');

const Application = new Schema({
  _id: String,
  secret: String,
  allowed_scopes: [String],
  name: String,
  image: String,
  verified: Boolean,
  callback_uris: [String]
}, {
  _id: false
});

module.exports = model('Application', Application)
