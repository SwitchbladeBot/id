module.exports = ({router}) => {
  /**
   * Token Introspection Endpoint (RFC 7662 https://tools.ietf.org/html/rfc7662)
   */
  router.get('/token_information', (req, res) => {
    res.send('TODO')
  })
}
