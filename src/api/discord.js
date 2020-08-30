const axios = require('axios').default

module.exports = {
  getUser: (accessToken) => {
    return axios.get('https://discord.com/api/v6/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }).then(res => res.data)
  }
}
