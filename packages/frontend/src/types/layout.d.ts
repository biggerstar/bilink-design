export type LayoutWidget = {
  uuid: string,
  type: 'image' | 'text' | 'svg' | 'group',
  title: string,
  opacity: number,
  padding: [number, number, number, number],
  width: number,
  height: number,
  left: number,
  top: number,
  transform: {
    a: number,
    b: number,
    c: number,
    d: number,
    tx: number,
    ty: number
  },
  elements: LayoutWidget[]
  boxShadow: null,
  dragable: boolean,
  color: string,
  textAlign: string,
  content: string,
  contents: any[],
  rotatable: boolean,
  editable: boolean,
  fontSize: number,
  fontFamily: string,
  hidden: boolean,
  lock: boolean,
  borderRadius: number,
  filter: {
    contrast: number,
    sharpness: number,
    hueRotate: number,
    saturate: number,
    brightness: number,
    gaussianBlur: number,
    temperature: number,
    tint: number
  },
  watermarkEnable: boolean,
  groupable: boolean,
  backgroundColor: unknown,
  backgroundEffect: unknown,
  border: null,
  blendMode: string,
  url: string;
  imageUrl: string,
  naturalWidth: number,
  naturalHeight: number,
  quality: 80,
}

export type LayoutConfig = {
  title: string;
  width: number;
  height: number;
  backgroundMask: {
    color: string,
    opacity: number
  },
  background: {
    color: string,
    image: any
  },
  backgroundColor: string,
  backgroundImage: string,
  elements: LayoutWidget[]
}

export type LayoutConfigs = LayoutConfig[]

export type CurrentTemplate = {
  /* 当前使用的模板信息 */
  // global: object,
  /** 小组件信息集合 */
  layouts: LayoutConfigs
}

export type PageConfig = {
  /** 品牌名，左上角的名称，TODO 后面可以支持使用图片 */
  brand: string,
  /** 左侧导航面板配置，每个标签对应其使用的组件 */
  asideTag: any[],
  /** 指定右下角缩放大小 */
  scaleSizeList: number[],
  /** 组件详情面板配置信息 */
  widgetsDetail: Record<any, any>
  /** 颜色选择器预设颜色 */
  predefineColors: string[]
  header: {
    moreOperation: Array<{
      text: string,
      icon: string
    }>
  }
}

export type Material = {
  id: number,
  ext: {
    dist_id: string,
    dist_code: string,
    base_score: number,
    material_location: number
  },
  type: string,
  price: number,
  title: string,
  format: string,
  is_new: number,
  status: number,
  item_id: number,
  preview: {
    hex: string,
    url: string,
    width: number,
    height: number,
    extends: any[],
    gif_url: string,
    duration: number,
    webpage_url: string
  },
  group_id: number,
  mask_num: number,
  group_ids: any [],
  item_price: number,
  updated_at: number,
  description: string,
  payment_tag: string,
  rules_count: number,
  is_recommended: number,
  user_over_role: number,
  distribution_id: number,
  authorization_id: any[],
  composite_preview: {
    hex: string,
    url: string,
    width: number,
    height: number
  },
  content_updated_at: number,
  design_category_id: number,
  channel_category_id: number,
  design_category_ids: any[],
  user_over_role_list: any[],
  channel_category_ids: any[],
  industry_category_id: number,
  industry_category_ids: any[]
}

