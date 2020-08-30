# Route directory

This directory is used to serve the endpoints for the Switchblade™ ID.

There are two directories: `api` and `frontend`. Each of them is served on different paths. Please read the `README.md` of them.

On each file of those directories, it's received a `Context` object.

The `Context` object has:

- `router` The [Express Router](http://expressjs.com/en/api.html#router) object to be used for serving the endpoints
- `logger` The winston logger object, defined on `/src/utils#setupLogger`
- `locale` The locale object for localisation.
> TODO: integrate crowdin and shit for that
- `database` The `DatabaseController` instance. For reference, go to `src/database/DatabaseController.js`

**Example:**

```js
module.exports = ({router}) => {

  router.get('/login', (req, res) => {
    res.sendFile(path.resolve('src', 'views', 'discordAuthorize.html'))
  })
}

```
