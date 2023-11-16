import ModelMaterial from '../common/db/model/Material.js'
import ModelMaterialMapping from "../common/db/model/ModelMaterialMapping.js";
import ModelAllMaterial from "../common/db/model/ModelAllMaterial.js";

/** 因为已经拿到数据，发现数据部分冗余，不想再重复爬取数据， 选择直接根据已有的数据进行分表 */

const size = 300
let page = 0
let complete = false

export async function pref_table() {
  do {
    const res = await ModelMaterial.findAll({
      limit: 300, offset: size * page++
    })
    if (!res.length) {
      complete = true
      console.log('工作结束')
      break
    }

    res.forEach(item => {
      const found = item.dataValues
      ModelMaterialMapping.create({
        id: found.id,
        parentId: found.parentId,
        material_location: found.material_location,
        parentName: found.parentName,
        title: found.title,
      })
        .then(_ => {
          console.log('映射插入成功', 'pid:', found.parentId, ' id:', found.id, '', found.parentName)
        })
        .catch((err) => console.log(err))

      ModelAllMaterial.findOrCreate({
        where: {
          id: found.id,
        },
        defaults: {
          id: found.id,
          data: found.detail
        }
      })
        .then(_ => {
          console.log('素材数据插入成功', 'pid:', found.parentId)
        })
        .catch((err) => console.log(err))
    })

  } while (!complete)
}






