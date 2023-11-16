/**
 * 组件映射页面，使用名称字符串则能获得相应组件
 * */

import DefaultEditorDetail from "@/components/design-canvas/CanvasDetail.vue";
import WTextDetail from "@/components/w-text/WTextDetail.vue";
import WText from "@/components/w-text/WText.vue";
import Material from "@/components/aside/Material.vue";

export const widgetsDetailMap = {
  'default': DefaultEditorDetail,
  'w-text': WTextDetail,
}

export const widgetsMap = {
  'w-text': WText,
}

export const asideTagMap = {
  'material': Material,
}

