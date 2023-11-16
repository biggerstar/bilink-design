import sequelize from "../sequelize.js";
import {DataTypes} from "sequelize";

const ModelAllMaterial = sequelize.define('all-material', {   // 所有素材列表，不会重复
  id: {
    type: DataTypes.INTEGER, allowNull: false, primaryKey: true,
  },
  data: {
    type: DataTypes.JSON, allowNull: false,
  },
});

export default ModelAllMaterial
