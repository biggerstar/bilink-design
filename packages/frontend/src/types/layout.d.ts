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
  rotatable: boolean,
  editable: boolean,
  frozen: boolean,
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
