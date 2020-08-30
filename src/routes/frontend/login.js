const path = require('path')

module.exports = ({router}) => {
  /**
   * This just send the html file to show the "Please login with discord" interface
   * UI Reference: https://www.figma.com/proto/cISNtq4J0xFYKsSas0mpEa/Switchblade-ID?node-id=3%3A25&scaling=min-zoom
   */
  router.get('/login', (req, res) => {
    res.sendFile(path.resolve('src', 'views', 'discordAuthorize.html'))
  })
}
