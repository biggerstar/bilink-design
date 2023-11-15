import {DataTypes} from "sequelize";
import sequelize from '../sequelize.js'
import fonts from "../../meta/fonts.js";

const ModelMeta = sequelize.define('meta', {
  // 在这里定义模型属性
  name: {
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

await ModelMeta.sync({
  force: process.env.ENV === 'development'
})

export const MetaEnum = {
  material: 'material',
  materialType: 'material-type',
  text: 'text',
  images: 'images',
  fonts: 'fonts',
}


export default ModelMeta
