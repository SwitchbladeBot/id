const express = require('express')
const fs = require('fs')
const {setupLogger} = require('./utils')
const cookieParser = require('cookie-parser')
const DatabaseController = require('./database/DatabaseController')
const {promisify} = require('util')
const readDirAsync = promisify(fs.readdir)

const app = express()
const locale = require('./locales/en-US.json')
const logger = setupLogger()

app.use(cookieParser())


const controller = new DatabaseController()
controller.connect().then(() => {
  loadRoutes({
    database: controller
  })
})

async function loadRoutes(ctx) {
  logger.info('Loading routes...')

  app.use(await loadPath('frontend', ctx))
  app.use('/oauth2', await loadPath('api', ctx))

  logger.info('API Routes ready')
}

async function loadPath(path, ctx) {
  path = `./src/routes/${path}`
  const files = await readDirAsync(path)
  const router = express.Router()
  for (let file of files) {
    const route = require(`.${path}/${file}`)
    route({
      router,
      logger,
      locale,
      ...ctx
    })
  }

  return router
}


// Token Introspection Endpoint (RFC 7662 https://tools.ietf.org/html/rfc7662)
app.get('/oauth2/token_information', (req, res) => {
  res.send('ok')
})

// Authorization Server Metadata Endpoint (RFC 8414 https://tools.ietf.org/html/rfc8414)
// This can contain a signed_metadata field containing the same information but signed as a JSON Web Token (See Section 2.1 of RFC 8114)
app.get('/oauth2/server_metadata', (req, res) => {
  res.json({
    hello: 'world'
  })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`)
})


