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
logger.info('Connecting to the database...')
controller.connect()
  .then(() => {
    logger.info('Database connected!')
    loadRoutes({
      database: controller
    })
      .catch(() => {
        logger.error('Could not connect to database')
      })
  })

async function loadRoutes(ctx) {
  logger.info('Loading routes...')

  // Files on the /routes/frontend will be served on /
  app.use(await loadPath('frontend', ctx))

  // Files on the /routes/api will be served on /oauth2/
  app.use('/oauth2', await loadPath('api', ctx))

  logger.info('API Routes ready')
}


/**
 * Function to load all files from a directory and return a Router, representing all the endpoints of this directory
 * @param {string} path - The directory name inside /routes
 * @param {Object?} ctx - Additional context to pass to the router files
 * @returns {Promise<Router>} - The router
 */
async function loadPath(path, ctx) {
  path = `./src/routes/${path}`
  const files = await readDirAsync(path)
  const router = express.Router()
  for (let file of files) {
    if (!file.endsWith('.js')) continue
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

const port = process.env.PORT || 3000

app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`)
})


