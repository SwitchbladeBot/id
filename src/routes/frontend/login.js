const path = require('path')

module.exports = ({router}) => {
  // User interface where users will be prompted to login and then autorize the app
  router.get('/login', (req, res) => {
    res.sendFile(path.resolve('src', 'views', 'discordAuthorize.html'))
  })
}
