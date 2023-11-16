import express from "express"
import ModelMeta from "../../common/db/model/Meta.js"

export const router = express.Router();

/**
 * type 获取类型 数据库 meta 表 中的数据，type 默认为 Meta 文件中的 MetaEnum 枚举类型
 * */
router.get('/getResource?:type', async function (req, res, next) {
  if (req.query.type) {
    // @ts-ignore
    const found = await ModelMeta.findOne<any>({
      where: {
        name: req.query.type
      },
    })
    if (found) {
      return res.json({
        code: 200,
        message: 'success',
        data: found.data
      })
    }
  }
  res.json({
    code: 404,
    message: '资源不存在'
  })
});



