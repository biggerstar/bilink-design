import express from "express";
import ModelFonts from "../../common/db/model/Fonts.js";
import {isString} from "is-what";

/**
 * 获取字体信息
 * 情况:
 *    1.返回列表,传入id返回该id的字体信息，只返回一条
 *    2.返回列表,传入name返回该name的字体信息，只返回一条
 *    3.返回列表,传入 page_num，page_size 返回当前页数和个数的信息
 *    3.返回列表,如果都没传入则获取第一页的100条信息，返回多条
 * */
export const router = express.Router();
// ModelFonts
router.get('/fonts', async (req, res) => {
  let {id, name, page_num = '1', page_size = '100'} = req.query
  if (isString(id)) {
    const found = await ModelFonts.findByPk(id)
    if (found) {
      return res.send({
        code: 200,
        message: '成功',
        data: [found.dataValues.data]
      })
    }
  }

  console.log(name)
  if (isString(name)) {
    name = decodeURIComponent(name.trim())
    //@ts-ignore
    const found = await ModelFonts.findOne({
      where: {
        name: name.toString().trim()
      }
    })
    if (found) {
      return res.send({
        code: 200,
        message: '成功',
        data: [found.dataValues.data]
      })
    }
  }
  const found = await ModelFonts.findAll({
    limit: Number(page_size),
    offset: Number(page_num)
  })
  if (found) {
    return res.send({
      code: 200,
      message: '成功',
      data: found.map(item => item.dataValues.data)
    })
  }
  res.send({
    code: 404,
    message: '资源不存在'
  })
})


