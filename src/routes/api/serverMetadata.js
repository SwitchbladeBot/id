module.exports = ({router}) => {
  /**
   * Authorization Server Metadata Endpoint (RFC 8414 https://tools.ietf.org/html/rfc8414)
   * This can contain a signed_metadata field containing the same information but signed as a JSON Web Token (See Section 2.1 of RFC 8114)
   */
  router.get('/server_metadata', (req, res) => {
    res.send('TODO')
  })
}
