import {Sequelize} from "sequelize";
import {config} from 'dotenv'
import path from "path";
import process from "process";

let dotEnvFileDirPath = process.env.NODE_ENV === 'prod' ? path.dirname(new URL(import.meta.url).pathname) : path.resolve(process.cwd())
config({path: path.resolve(dotEnvFileDirPath, `.env.${process.env.NODE_ENV}`)})

let {SPIDER_ENV, DB_NAME, DB_LOG, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_DIALECT, DB_DEBUG_NAME} = process.env
if (SPIDER_ENV === 'development') DB_NAME = DB_DEBUG_NAME  // 如果爬虫是开发环境

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: DB_LOG === 'true',
  pool: {
    max: 50,          // 最大连接数
    min: 0,           // 最小连接数
    acquire: 30000,   // 获取连接的超时时间（毫秒）
    idle: 15000       // 连接的最大空闲时间（毫秒）
  },
  timezone: '+08:00'
});

sequelize.authenticate()
  .then(() => console.log('host=', DB_HOST, 'DB_NAME=', DB_NAME, 'Connection has been established successfully.'))
  .catch((error) => {
    throw new Error('连接失败: 错误信息为:' + error)
  })

export default sequelize
