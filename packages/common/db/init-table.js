import ModelMaterial from "./model/Material.js";
import ModelMeta from "./model/Meta.js";
import ModelResourceTree from "./model/ResourceTree.js";
import ModelMaterialMapping from "./model/ModelMaterialMapping.js";
import ModelAllMaterial from "./model/ModelAllMaterial.js";
import ModelFonts from "./model/Fonts.js";
import AllUserDesign from "./model/AllUserDesign.js";
import sequelize from "./sequelize.js";

export async function init_table() {
  const isDev = process.env.ENV === 'development'
  /*------------------------------------------------*/

  // ModelMaterialMapping.hasMany(ModelAllMaterial, {foreignKey: 'aid'})
  // ModelAllMaterial.belongsTo(ModelMaterialMapping, {foreignKey: 'aid'})
  /*------------------------------------------------*/

  await ModelResourceTree.sync({force: isDev})
  await ModelMaterial.sync({force: isDev})
  await ModelMeta.sync({force: isDev})
  await ModelMaterialMapping.sync()
  await ModelAllMaterial.sync()
  await ModelFonts.sync()
  await AllUserDesign.sync()
  await sequelize.query('ALTER TABLE `all-user-designs` AUTO_INCREMENT = 2600000000');   // 设置自增用户设计图表起始编号
}

if(process.env.INIT_TABLE === 'true') await init_table()
