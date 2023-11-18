/**
 * 组件映射页面，使用名称字符串则能获得相应组件
 * */

import DefaultEditorDetail from "@/components/design-canvas/CanvasDetail.vue";
import WTextDetail from "@/components/widgets/w-text/WTextDetail.vue";
import WText from "@/components/widgets/w-text/WText.vue";
import Material from "@/components/aside/material/Material.vue";
import Text from "@/components/aside/text/Text.vue";
import Images from "@/components/aside/images/Images.vue";
import Template from "@/components/aside/template/Template.vue";
import WImage from "@/components/widgets/w-image/WImage.vue";

export const widgetsDetailMap = {
  'default': DefaultEditorDetail,
  'w-text': WTextDetail,
}
export const widgetsMap = {
  'text': WText,
  'image': WImage,
}

export const asideTagMap = {
  'material': Material,
  'text': Text,
  'images': Images,
  'template': Template,
}

