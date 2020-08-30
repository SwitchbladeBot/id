const { generateRandomString } = require('../../utils')

module.exports = ({router}) => {
  /**
   * Hm, this is just an example. I think i don't need to explain this, right?
   * Btw, this random state is used for testing to check if the state is being transported in the right way
   */
  router.get('/example', (req, res) => {
    const exampleClient = '6EAtZAE5SfbRvmkqtO1JOCNtc9c8CHIg'
    const scopes = [
      "music.playback",
      "music.playlists_read",
      "music.playlists_write"
    ].join(' ')
    const callback = "https://localhost:8080/callback"
    const state = generateRandomString(32)

    const path = `/authorize?client_id=${exampleClient}&scope=${scopes}&redirect_uri=${encodeURIComponent(callback)}&state=${state}&response_type=code`

    res.send(`
<h4>State: ${state}</h4>
<a href="${process.env.BASE_URL}${path}">
    Please connect with Switchblade™ ️ to continue
</a>
    `.trimStart())
  })
}
