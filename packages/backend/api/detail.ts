import express from "express";
import {isNumber, isObject, isString} from "is-what";
import {crawlTemplateDetail} from "../../spider/main/crawl-template-detail.js";
import AllUserDesign from "../../common/db/model/AllUserDesign.js";

/**
 * 获取资源具体信息
 * */
export const router = express.Router();
router.get('/detail', async (req, res) => {
  let {id} = req.query
  if (isString(id)) {
    const userDetail = await AllUserDesign.findByPk(id)
    if (userDetail) {
      return res.status(200).send({   // 后面还需要加入用户鉴权才能获取自身设计图
        code: 200,
        message: '成功',
        data: userDetail.dataValues.data
      })
    }

    const detail = await crawlTemplateDetail(id)  // 直接同步抓取官方接口数据
    if (detail) {
      return res.status(200).send({
        code: 200,
        message: '成功',
        data: detail
      })
    }
  }
  res.send({
    code: 404,
    message: '资源不存在'
  })
})

router.post('/detail', async (req, res) => {
  let {id, uid, data} = req.body || {}
  if ((isNumber(uid) || isString(uid)) && uid && data && isObject(data)) {  // uid 和 data 是必要的
    let userTemplateId = null    // 返回前端的该用户模板的新id,如果是执行更新，原样返回
    if ((isNumber(id) || isString(id)) && id) {   // 传入id说明意图更新模板数据，尝试找找有没有在数据库中
      const userDetail = await AllUserDesign.findByPk(id)
      if (userDetail) {
        await AllUserDesign.update({data}, {   // 找到直接更新
          where: {
            id,
            uid
          } as any
        })
        userTemplateId = id
      }
    }
    if (!userTemplateId) {
      const createdDetail = await AllUserDesign.create({   // 没找到就创建
        uid,
        data
      })
      userTemplateId = createdDetail.dataValues.id
    }
    if (userTemplateId) {
      return res.send({
        code: 200,
        message: '成功',
        data: {
          id: userTemplateId
        }
      })
    }
  }

  res.send({
    code: 400,
    message: '参数错误, uid, data'
  })
})

router.delete('/detail', async (req, res) => {
  let {id} = req.body || {}
  if (isNumber(id) || isString(id)) {
    const deletedCount = await AllUserDesign.destroy({
      where: {
        id
      }
    } as any)
    if (deletedCount > 0) {
      return res.send({
        code: 200,
        message: '删除成功'
      })
    } else {
      return res.send({
        code: 400,
        message: '资源不存在'
      })
    }
  }
  res.send({
    code: 400,
    message: '删除失败,请指定删除id'
  })
})
