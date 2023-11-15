import ModelMeta, {MetaEnum} from '../../db/model/Meta.js'
import material from '../../meta/material-left-tag-scouce.js'
import text from '../../meta/text-left-tag-source.js'
import images from '../../meta/images-left-tag-source.js'
import fonts from '../../meta/fonts.js'

/**
 * 初始化爬虫起始的种子数据
 * */
export async function initMetaData() {
  await ModelMeta.findOrCreate({
    where: {name: MetaEnum.material},
    defaults: {
      name: MetaEnum.material,
      data: material
    }
  })
  let flattenedData = material.children
    .reduce((pre, cur) => pre.concat(cur.children), [])
    .flatMap(item => [item, ...item.children])

  await ModelMeta.findOrCreate({
    where: {name: MetaEnum.materialType},
    defaults: {
      name: MetaEnum.materialType,
      data: flattenedData
    }
  })

  await ModelMeta.findOrCreate({
    where: {name: MetaEnum.text},
    defaults: {
      name: MetaEnum.text,
      data: text
    }
  })

  await ModelMeta.findOrCreate({
    where: {name: MetaEnum.images},
    defaults: {
      name: MetaEnum.images,
      data: images
    }
  })

  await ModelMeta.findOrCreate({
    where: {name: MetaEnum.fonts},
    defaults: {
      name: MetaEnum.fonts,
      data: fonts
    }
  })
}
