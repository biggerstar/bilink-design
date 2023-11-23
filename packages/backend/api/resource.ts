import express from "express"
import ModelMeta from "../../common/db/model/Meta.js"
import {isString} from "is-what";
import ModelResourceTree from "../../common/db/model/ResourceTree.js";

export const router = express.Router();

/**
 * type 获取类型 数据库 meta 表 中的数据，type 默认为 Meta 文件中的 MetaEnum 枚举类型
 * */
router.get('/resource', async function (req, res, next) {
  const {type, id} = req.query
  if (isString(id)) {
    //@ts-ignore
    const found = await ModelResourceTree.findByPk(id)
    if (found) {
      return res.json({
        code: 200,
        message: '成功',
        data: found.dataValues?.data
      })
    }
  }
  if (!isString(id) && isString(type)) {
    // @ts-ignore
    const found = await ModelMeta.findOne<any>({
      where: {
        name: type
      },
    })
    if (found) {
      return res.json({
        code: 200,
        message: '成功',
        data: found?.data
      })
    }
  }
  res.json({
    code: 404,
    message: '资源不存在'
  })
});



