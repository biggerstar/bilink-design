import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'

/** 素材小组件表 */
const ModelMaterial = sequelize.define('material', {
  // 使用双主键，因为一个资源可能对应多个父级
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  material_location: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  detail: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

export default ModelMaterial
