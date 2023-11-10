import DefaultEditorDetail from "@/components/design-canvas/CanvasDetail.vue";
import WTextDetail from "@/components/w-text/WTextDetail.vue";
import WText from "@/components/w-text/WText.vue";

export const widgetsDetailMap = {
  'dev': DefaultEditorDetail,
  'default': DefaultEditorDetail,
  'w-text': WTextDetail,
}

export const widgetsMap = {
  'w-text': WText,
}