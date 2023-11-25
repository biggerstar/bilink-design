import express from "express";
import {isNumber, isObject, isString} from "is-what";
import {crawlTemplateDetail} from "../../spider/main/crawl-template-detail.js";
import AllUserDesign from "../../common/db/model/AllUserDesign.js";
import ModelAllMaterial from "../../common/db/model/ModelAllMaterial.js";

/**
 * 获取资源具体信息
 * */
export const router = express.Router();
router.get('/detail', async (req, res) => {
  let {id, uid, page_num = '1', page_size = '20'} = req.query
  if (uid && (isString(uid) || isNumber(uid))) {
    const foundUserDetailList = await AllUserDesign.findAll({
      where: {  // 找某个用户的当前拥有的模板
        uid
      },
      order: [`createdAt`],
      limit: Math.min(40, Number(page_size)),  // 一次最大 40 条
      offset: (Math.max(0, Number(page_num)) - 1) * Number(page_size),  // 最小偏移量为 0，不能负数
    })
    /*---------------------------------------------------------------------------*/
    // 被点线保包围的这段代码目的为了返回一个预览图，这是不合理的，后面可以通过用户数据通过后端渲染生成预览图
    let allSourceIDList = foundUserDetailList.map(detail => detail.dataValues.sourceId)
    let allSourceIDMappingList = foundUserDetailList.map(detail => {
      return {
        id: detail.dataValues.id,
        sourceId: detail.dataValues.sourceId,
      }
    })
    allSourceIDList = [...new Set(allSourceIDList)]
    let foundOfficialDetailList
    if (allSourceIDList.length) {
      foundOfficialDetailList = await ModelAllMaterial.findAll({
        where: {
          id: allSourceIDList
        },
      })
    }
    if (foundOfficialDetailList?.length) {
      return res.send({
        code: 200,
        message: '成功',
        foundUserDetailList,
        data: foundOfficialDetailList.map(detail => {
          const found = allSourceIDMappingList.find(item => item.sourceId === detail.dataValues.id)
          detail.dataValues.data.id = found.id
          return detail.dataValues.data
        })
      })
    }
    /*---------------------------------------------------------------------------*/
  }
  if (isString(id)) {
    const userDetail = await AllUserDesign.findByPk(id)
    if (userDetail) {
      return res.send({   // 后面还需要加入用户鉴权才能获取自身设计图
        code: 200,
        message: '成功',
        data: userDetail.dataValues.data,
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
  res.status(200).send({
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
        sourceId: id,
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
