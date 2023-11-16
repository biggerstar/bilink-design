import ModelMeta, {MetaEnum} from '../../../common/db/model/Meta.js'
import material from '../../meta/material-left-tag-scouce.js'
import text from '../../meta/text-left-tag-source.js'
import images from '../../meta/images-left-tag-source.js'
import fonts from '../../meta/fonts.js'
import template from '../../meta/template-left-tag-source.js'
import ModelResourceTree from "../../../common/db/model/ResourceTree.js";

/**
 * 初始化爬虫起始的种子数据
 * */
export async function initMetaData() {

  await ModelMeta.findOrCreate({
    where: {name: MetaEnum.fonts},
    defaults: {
      name: MetaEnum.fonts,
      data: fonts
    }
  })

  await ModelMeta.findOrCreate({
    where: {name: MetaEnum.icon},
    defaults: {
      name: MetaEnum.icon,
      data: material
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
    where: {name: MetaEnum.template},
    defaults: {
      name: MetaEnum.template,
      data: template
    }
  })

  await loadResourceTreeDataToDb(template)
  await loadResourceTreeDataToDb(text)
  await loadResourceTreeDataToDb(images)
  await loadResourceTreeDataToDb(material)
}


async function loadResourceTreeDataToDb(Resource) {
  let flattenedData = Resource.children
    .reduce((pre, cur) => pre.concat(cur.children), [])
    .flatMap(item => [item, ...item.children])
    .flatMap(item => [item, ...item.children])
    .flatMap(item => [item, ...item.children])


  for (const item of flattenedData) {
    await ModelResourceTree.findOrCreate({
      where: {
        id: item.id
      },
      defaults: {
        id: item.id,
        parentId: item.parent_id,
        data: item
      }
    })
  }
}
