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
import WImageDetail from "@/components/widgets/w-image/WImageDetail.vue";
import WGroupDetail from "@/components/widgets/w-group/WGroupDetail.vue";
import WGroup from "@/components/widgets/w-group/WGroup.vue";
import WSvg from "@/components/widgets/w-svg/WSvg.vue";
import MyDesign from "@/components/aside/my-design/MyDesign.vue";
import AddPanel from "@/components/aside/add-panel/AddPanel.vue";
import WMask from "@/components/widgets/w-mask/WMask.vue";

export const widgetsDetailMap = {
  'default': DefaultEditorDetail,
  'w-text': WTextDetail,
  'w-image': WImageDetail,
  'w-selected-group': WGroupDetail,
}
export const widgetsMap = {
  'group': WGroup,
  'text': WText,
  'effectText': WText,
  'threeText': WText,
  'image': WImage,
  'svg': WSvg,
  /* TODO 开发额外组件功能的 detail 配置页 */
  'mask': WImage,
  'ninePatch': WImage,
  'element': WImage,
  'Line arrow': WImage,
  'Picture container': WImage,
  'QR code': WImage,
  'dynamic_image': WImage,
  'poster': WImage,
}

export const asideTagMap = {
  'material': Material,
  'text': Text,
  'images': Images,
  'template': Template,
  'my-design': MyDesign,
  'add-panel': AddPanel,
}

export const githubUrl = 'https://github.com/biggerstar/bilink-design'
export const mockUserId = 123456
