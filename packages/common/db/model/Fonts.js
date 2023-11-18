import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'

/** 素材小组件表 */
const ModelFonts = sequelize.define('fonts', {
  // 使用双主键，因为一个资源可能对应多个父级
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

export default ModelFonts
