import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'

/**
 * 所有用户设计的模板数据
 * */
const AllUserDesign = sequelize.define('all-user-design', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  uid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: false
});

export default AllUserDesign
