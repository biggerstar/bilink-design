import ModelMaterial from "./model/Material.js";
import ModelMeta from "./model/Meta.js";
import ModelResourceTree from "./model/ResourceTree.js";

export async function init_table() {
  const isDev = process.env.ENV === 'development'
  await ModelResourceTree.sync({force: isDev})
  await ModelMaterial.sync({force: isDev})
  await ModelMeta.sync({force: isDev})
}


