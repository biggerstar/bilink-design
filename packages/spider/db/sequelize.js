import {Sequelize} from "sequelize";
import {config} from 'dotenv'

config()
let {ENV, DB_NAME, DB_LOG, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_DIALECT, DB_DEBUG_NAME} = process.env
if (ENV === 'development') {  // 如果是开发环境
  DB_NAME = DB_DEBUG_NAME
}

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: DB_LOG === 'true',
  pool: {
    max: 50,          // 最大连接数
    min: 0,           // 最小连接数
    acquire: 30000,   // 获取连接的超时时间（毫秒）
    idle: 15000       // 连接的最大空闲时间（毫秒）
  }
});

try {
  await sequelize.authenticate();
  console.log('host=', DB_HOST, 'DB_NAME=', DB_NAME, 'Connection has been established successfully.');
} catch (error) {
  throw new Error('Unable to connect to the database:' + error)
}

export default sequelize
