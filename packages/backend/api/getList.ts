import express from "express"
import {isString} from "is-what";
import ResourceTree from "../../common/db/model/ResourceTree.js";
import {getLeafChildren} from "../../common/tool/tool.js";
import ModelMaterialMapping from "../../common/db/model/ModelMaterialMapping.js";
import ModelAllMaterial from "../../common/db/model/ModelAllMaterial.js";

export const router = express.Router();
/**
 * API query支持的参数: id, page_num, page_size
 * */
router.get('/getList', async function (req, res, next) {
  let {id, page_num = '1', page_size = '20'} = req.query
  // console.log(page_num, page_size, id)
  if (isString(id) && isString(page_num) && isString(page_size)) {
    // 找到该 id 的数据，判断是不是叶子节点,如果不是叶子节点
    const found = await ResourceTree.findByPk(id)

    if (found) {
      const leftItemList = getLeafChildren(found.dataValues.data?.children || [])
      if (Array.isArray(leftItemList) && leftItemList[0]) {   // 如果不是叶子节点，则获取该大类的叶子节点，并选择第一个 分类id
        id = leftItemList[0].id || id
      }
    }
    const fountPageList = await ModelMaterialMapping.findAll({
      where: {
        parentId: id
      },
      order: ['material_location'],
      limit: Math.min(100, Number(page_size)),  // 一次最大 100 条
      offset: (Math.max(1, Number(page_num)) - 1) * Number(page_size),  // 最小偏移量为 0，不能负数
    })

    if (Array.isArray(fountPageList) && fountPageList.length) {
      const ids = fountPageList.map(item => item.dataValues.id)
      const result = await ModelAllMaterial.findAll({
        where: {
          id: ids
        }
      })
      return res.send({
        code: 200,
        message: 'success',
        data: result.map(item => item.dataValues.data)
      })
    }
  }

  res.send({
    code: 404,
    message: '资源不存在'
  })
})

