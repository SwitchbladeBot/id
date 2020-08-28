# id

Switchblade's OAuth 2.0 server

## Relevant RFCs

- [ ] **OAuth 2.0 Core** (RFC 6749) https://tools.ietf.org/html/rfc6749
  > Core spec of the OAuth 2.0 protocol
- [ ] **Token Introspection** (RFC 7662) https://tools.ietf.org/html/rfc7662
  > Needed for our services to be able to query the OAuth server about tokens
- [ ] **Proof Key for Code Exchange** (RFC 7636) https://tools.ietf.org/html/rfc7636
  > Needed for mobile apps and static websites (places where we can't store the client secret safely)
- [ ] **Token Revocation** (RFC 7009) https://tools.ietf.org/html/rfc7009
  > Lets users revoke tokens and unauthorize apps