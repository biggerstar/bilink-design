import * as allRouter from '../api/index.ts'

function createRoutes(app) {
  for (const name in allRouter) {
    app.use(allRouter[name])
  }
  return (req, resp, next) => next()
}

export default createRoutes

