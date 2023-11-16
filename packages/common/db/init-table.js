import ModelMaterial from "./model/Material.js";
import ModelMeta from "./model/Meta.js";
import ModelResourceTree from "./model/ResourceTree.js";
import ModelMaterialMapping from "./model/ModelMaterialMapping.js";
import ModelAllMaterial from "./model/ModelAllMaterial.js";

export async function init_table() {
  const isDev = process.env.ENV === 'development'
  /*------------------------------------------------*/

  // ModelMaterialMapping.hasMany(ModelAllMaterial, {foreignKey: 'aid'})
  // ModelAllMaterial.belongsTo(ModelMaterialMapping, {foreignKey: 'aid'})
  /*------------------------------------------------*/

  await ModelResourceTree.sync({force: isDev})
  await ModelMaterial.sync({force: isDev})
  await ModelMeta.sync({force: isDev})
  await ModelMaterialMapping.sync({force: true})
  await ModelAllMaterial.sync({force: true})
}


