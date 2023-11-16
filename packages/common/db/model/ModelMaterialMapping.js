import sequelize from "../sequelize.js";
import {DataTypes} from "sequelize";

const ModelMaterialMapping = sequelize.define('material-mapping', {  // 所有分类及其对应的素材，通过素材id可以在素材表中找到数据
  // 使用双主键，因为一个资源可能对应多个父级
  id: {
    type: DataTypes.INTEGER, allowNull: false, primaryKey: true,
  },
  parentId: {
    type: DataTypes.INTEGER, allowNull: false, primaryKey: true,
  },
  material_location: {
    type: DataTypes.INTEGER, allowNull: false,
  },
  parentName: {
    type: DataTypes.STRING, allowNull: false,
  },
  title: {
    type: DataTypes.STRING, allowNull: false,
  },
});


export default ModelMaterialMapping
