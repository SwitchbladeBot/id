const axios = require('axios').default

module.exports = {
  /**
   * Retrieve information from an user on Discord
   * @param {string} accessToken - The user access token
   * @returns {Promise<AxiosResponse<any>>} The user object. Reference: https://discord.com/developers/docs/resources/user#user-object
   */
  getUser: (accessToken) => {
    return axios.get('https://discord.com/api/v6/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }).then(res => res.data)
  }
}
