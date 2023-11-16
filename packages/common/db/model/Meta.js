import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'
import fonts from "../../../spider/meta/fonts.js";

const ModelMeta = sequelize.define('meta', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});


export const MetaEnum = {  // 后面如果做后台管理考虑加入数据库中
  template: 'template',
  icon: 'icon',
  materialType: 'material-type',
  text: 'text',
  images: 'images',
  fonts: 'fonts',
}


export default ModelMeta
