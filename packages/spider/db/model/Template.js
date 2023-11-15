import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'

const ModelTemplate = sequelize.define('template', {
  // 在这里定义模型属性
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

await ModelTemplate.sync({
  force: process.env.ENV === 'development'
})


export default ModelTemplate
