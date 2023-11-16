import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'
import ResourceTree from "./ResourceTree.js";

const ModelTemplate = sequelize.define('template', {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  desc: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  detail: {
    type: DataTypes.JSON,
    allowNull: false,
  }
}, {
  // 这是其他模型参数
});

if (process.env.ENV === 'development') ModelTemplate.sync({force: true}).then()
else ResourceTree.sync().then()

export default ModelTemplate
