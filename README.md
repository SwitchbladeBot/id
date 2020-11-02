# id

Switchblade's OAuth 2.0 server

## Relevant RFCs

- [ ] **OAuth 2.0 Core** (RFC 6749) https://tools.ietf.org/html/rfc6749
  > Core spec of the OAuth 2.0 protocol
- [x] **Token Introspection** (RFC 7662) https://tools.ietf.org/html/rfc7662
  > Needed for our services to be able to query the OAuth server about tokens
- [ ] **Proof Key for Code Exchange** (RFC 7636) https://tools.ietf.org/html/rfc7636
  > Needed for mobile apps and static websites (places where we can't store the client secret safely)
- [ ] **Token Revocation** (RFC 7009) https://tools.ietf.org/html/rfc7009
  > Lets users revoke tokens and unauthorize apps

## Development Environment Setup

0. Clone this repository
1. Run `npm install`
2. Set environment variables
3. Set your Application's redirect_uri to `https://localhost:3000/api/callback` on the Discord developer portal
4. Manually create a `clients` collection in the `id` database of your MongoDB server and add one or more clients (see model example below)
5. Run `npm run dev` to start both the frontend and backend servers

You'll also need to manually  and add some clients for you to test with. Here's an example client:

### Client database entry example

```json
{
    "_id": "CcBS96VfStZby1x4",
    "secret": "mMX4TOhLEvxfdPtbMnlFRTgHc4wkgG9Q",
    "image": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Amazon_Alexa_App_Logo.png",
    "name": "Alexa",
    "redirect_uris": ["https://layla.amazon.com/api/skill/link/M1372REJTJ5N4Z", "https://alexa.amazon.co.jp/api/skill/link/M1372REJTJ5N4Z", "https://pitangui.amazon.com/api/skill/link/M1372REJTJ5N4Z", "http://localhost:3000/alexa/callback"],
    "verified": true
}
```