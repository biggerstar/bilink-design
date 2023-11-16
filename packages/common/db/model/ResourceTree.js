import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'

const ResourceTree = sequelize.define('resource-tree', {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  // 这是其他模型参数
});

if (process.env.ENV === 'development') ResourceTree.sync({force: true}).then()
else ResourceTree.sync().then()

export default ResourceTree
