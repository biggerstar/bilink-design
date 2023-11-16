import ModelMaterial from "../../common/db/model/Material.js";
import {isObject} from "is-what";
import {crawlMaterialDataDetail} from "./crawl-matericl-detail.js";
import {getLeafChildren, sleep} from "../../common/tool/tool.js";
import {fetchSourceTree} from "./fetch-source-tree.js";

let debugCont = process.env.ENV === 'development' ? 1 : Infinity

/**
 * @param {string | number} id 素材类型
 * @param {number=} startIndex 从某个索引的类型开始爬取,默认为数组起始点下标0开始
 * */
export async function crawlMaterialData(id, startIndex = 0) {
  const materialData = await fetchSourceTree(id)  // 获取该id下的树结构
  if (!materialData) return
  const leafTypeList = getLeafChildren(materialData.children)  // 获取叶子节点的最后最底层级分类列表
  console.log(`所有 ${materialData.name} 小类总个数为`, leafTypeList.length)
  for (const index in leafTypeList) {
    if (index >= debugCont) break
    const materialTypeItem = leafTypeList[index]
    if (isObject(materialTypeItem)) {
      if (index < startIndex) continue
      console.log('索引:', index, '当前获取类别:', materialTypeItem.name, 'id为:', materialTypeItem.id);
      let err_count = 0
      let page_num = 0
      let page_size = 300
      let maxLoop = 500
      let resultCont = 0
      while (++page_num <= maxLoop) {
        const materialData = await crawlMaterialDataDetail(materialTypeItem.id, materialTypeItem.parent_id, page_size, page_num)
        if (!Array.isArray(materialData) || !materialData.length) {
          page_num = 1
          break
        }
        resultCont = resultCont + materialData.length
        console.log('当前素材类型id', id, '已获取小组件个数', resultCont)
        for (const i in materialData) {
          const item = materialData[i]
          await ModelMaterial.findOrCreate({
            where: {
              id: item.id,
              parentId: materialTypeItem.id,
            },
            defaults: {
              id: item.id,
              parentId: materialTypeItem.id,
              parentName: materialTypeItem.name,
              detail: item,
              title: item.title,
              material_location: item.ext.material_location
            }
          }).then((res) => {
            const [_, created] = res
            if (!created) return err_count++ % 50 === 0 && console.log('已存在', materialTypeItem.name, '错误个数', err_count - 1)
            console.log('成功插入:', materialTypeItem.name, '位置:', item.ext?.material_location, 'pid为:', materialTypeItem.id, '名称:', item.title)
          }).catch((err) => console.log(err.message))
        }
        await sleep(2000)  // 每个请求间隔2秒，关爱稿定，不能太快太离谱
      }
      // await sleep(3000)
    }
  }
}
