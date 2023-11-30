import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import createRoutes from "./routes/index.ts";
import process from 'process'
import cors from 'cors'

const app = express()

app.set('views', path.join(process.cwd(), 'views'))
app.set('view engine', 'jade');

app.use(logger('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
// app.use(express.static(path.join(__dirname, 'public')))

app.use('/', createRoutes(app))  // 创建所有路由
app.use('/', (req, res) => res.send('<h1>瓜娃子别乱看</h1>'))
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  //@ts-ignore
  next(createError(404))
})

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
} as express.ErrorRequestHandler);

export default app
