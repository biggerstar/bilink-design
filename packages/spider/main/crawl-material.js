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
      await crawlMaterialDataDetail(materialTypeItem.id, async (widgetsData = []) => {
        for (const i in widgetsData) {
          const item = widgetsData[i]
          ModelMaterial.findByPk(item.id).then(res => {
            if (res) return err_count++ % 50 === 0 && console.log('已存在', materialTypeItem.name, '错误个数', err_count - 1)
            ModelMaterial.create({
              id: item.id,
              parentId: materialTypeItem.id,
              detail: item,
            }).then(() => {
              console.log('成功插入:', materialTypeItem.name, 'pid为:', materialTypeItem.id, 'id为:', item.id)
            }).catch((err) => console.log(err.message))
          }).catch((err) => console.log(err.message))
        }
      }).catch((err) => console.log(err.message))
      await sleep(3000)
    }
  }
}
