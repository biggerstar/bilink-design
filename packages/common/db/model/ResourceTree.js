import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'

const ModelResourceTree = sequelize.define('resource-tree', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

export default ModelResourceTree
