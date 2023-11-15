import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'

/** 素材小组件表 */
const ModelMaterial = sequelize.define('material', {
  // 在这里定义模型属性
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  detail: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  // 这是其他模型参数
});

await ModelMaterial.sync({
  force: process.env.ENV === 'development'
})


export default ModelMaterial
