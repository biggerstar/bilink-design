import {MoveableManager} from "@/common/moveable/moveable";
import {CSS_DEFINE, DESIGN_OPTIONS, DESIGN_SET_STATE} from "@/constant";
import {toRaw} from "vue";
import {deepmerge} from "@biggerstar/deepmerge";
import {loadFont} from "@/utils/method";
import {isNumber} from "is-what";
import {LineGuides} from "@/common/line-guides/line-guides";

type CanvasConfig = {
  scale: number | null,
  scaleWheelStep: number,
  width: number;
  height: number;
  padding: number;
  bgColor: string; //  背景颜色
  color: string;   // 文字颜色
  fontId: string   // canvas 内所有元素默认使用的字体
  watermark?: string;
  guideline?: boolean;
}

/**
 * 设计页面(/design) 的store
 * 为何不使用pinia ? 因为尝试了使用 pinia , 认为太重了影响性能，多处使用容易造成数据不清，并且部分无需代理的对象被代理并无法使用Object.freeze
 * */
class EditorStore {
  /** moveable 管理器 */
  public moveableManager: MoveableManager
  public lineGuides: LineGuides
  /** 所有字体 */
  allFont: object[]
  public
  /** 当前正在编辑的工程文件 */
  public currentProject: {
    /* 画布信息 */
    scaleSizeList: number[],
    canvas: CanvasConfig,
    /** 小组件信息集合 */
    items: []
  } = {
    canvas: void 0,
    items: [],
    scaleSizeList: [],
  }
  /** 组件详情面板配置信息 */
  public widgetsDetailConfig: {}

  /** 获取当前活跃小组件的配置信息 */
  public getCurrentOptions(): Record<any, any> {
    const currentWidget = editorStore.moveableManager.currentWidget
    if (!currentWidget) return
    return currentWidget[DESIGN_OPTIONS]
  }

  /** 载入当前要编辑的工程配置信息 */
  public loadEditorProject(projectInfo) {
    this.currentProject = projectInfo
  }

  /** 设置当前正在活跃的小组件配置,会自动更新源currentProject.items中的配置,是否直接覆盖整个对象(值)
   * safe 安全合并，在源对象上若没有的不会被合并, 默认 false
   * effectDom 本次设置的值是否对应到dom并影响dom效果 ， 默认 true
   * */

  public updateActiveWidgetsState<T extends Record<any, any>>(activeInfo: T, options: { safe?: boolean, effectDom?: boolean } = {}): void {
    const {effectDom = true} = options
    const currentWidget = editorStore.moveableManager.currentWidget
    if (!currentWidget) return
    /* 通过activeOptions引用更新在 currentProject.items 中的配置  */
    deepmerge(this.getCurrentOptions(), activeInfo, options)
    this.moveableManager?.moveable?.updateRect()
    if (effectDom) currentWidget[DESIGN_SET_STATE](activeInfo)
  }

  public designCanvasTarget: HTMLElement
  public editorAreaBoxTarget: HTMLElement
  public editorAreaTarget: HTMLElement

  /**
   * 更新当前正在编辑的工程文件信息和相关状态,同步到当前工程( currentProject )使用的配置中
   * 并应用到当前的 canvas 画布中
   * safe 安全合并，在源对象上若没有的不会被合并, 默认 false
   * */
  public updateCanvasStyle<T extends Record<any, any>>(canvasInfoOptions: T & Partial<CanvasConfig>, options: { safe?: boolean } = {}): void {
    if (!this.currentProject) return
    if (!this.designCanvasTarget || !this.editorAreaTarget) throw new Error('designCanvas 未挂载')
    const canvasInfo: CanvasConfig = <any>canvasInfoOptions
    let {width, height, scale, padding, bgColor, color, fontId} = canvasInfo
    const bodyStyle = document.body.style
    const has = (key: keyof CanvasConfig) => Reflect.has(canvasInfo, key)
    has('width') && bodyStyle.setProperty(CSS_DEFINE["--canvas-width"], `${width}px`)
    has('height') && bodyStyle.setProperty(CSS_DEFINE["--canvas-height"], `${height}px`)
    has('padding') && bodyStyle.setProperty(CSS_DEFINE["--canvas-padding"], `${padding}px`)
    has('bgColor') && (this.editorAreaTarget.style.backgroundColor = bgColor)
    has('color') && (this.editorAreaTarget.style.color = color)
    has('fontId') && (this.setFontFamily(this.designCanvasTarget, fontId))
    if (has('scale')) {
      if (!scale || isNumber(scale) && scale <= 0) {
        const DC_Rect = this.designCanvasTarget.getBoundingClientRect()
        const canvasInfo = this.currentProject.canvas
        scale = Number(Math.min((DC_Rect.width - 60 * 2) / canvasInfo.width, (DC_Rect.height - 60 * 2) / canvasInfo.height).toFixed(2))       // 获取最佳比例
      }
      bodyStyle.setProperty(CSS_DEFINE["--canvas-scale"], String(scale))  // 设置当前尺寸，未设置 scale 或者 scale 为 null 自动设置最佳尺寸
    }
    this.moveableManager?.moveable?.updateRect?.()
    this.lineGuides?.updateGuidesStyle?.()
    deepmerge(this.currentProject.canvas, canvasInfo, options)
  }

  /**
   * 更新当前正在编辑的工程文件信息和相关状态
   * safe 安全合并，在源对象上若没有的不会被合并, 默认 false
   * */
  public updateCurrentProjectState<T extends Record<any, any>>(projectInfo: T, options: { safe?: boolean } = {}): void {
    projectInfo = toRaw(projectInfo)
    if (!this.currentProject) return
    deepmerge(this.currentProject, projectInfo, options)
  }

  /** 通过 id 获取字体信息  */
  public getFont4Id(id: string) {
    if (!id) return
    return this.allFont.find(item => item.id === id)
  }

  /** 为指定元素设置字体  */
  public setFontFamily(el: HTMLElement, id: string): any {
    const fontData = this.getFont4Id(id)
    if (!fontData) return
    loadFont({
      url: fontData.content.woff,
      family: fontData.content.family,
    }).then(() => {
      el.style.fontFamily = fontData.content.family
    })
  }

  /** 为指定元素设置大小  */
  public setFontSize(el: HTMLElement, size: string | number) {
    el.style.fontSize = isNumber(size) ? `${size}px` : size
  }

  /** 为指定元素设置大小和字体  */
  public setFont(el: HTMLElement, options: { id?: string, size?: string }) {
    const {id, size} = options
    if (id) this.setFontFamily(el, id)
    if (size) this.setFontSize(el, size)
  }

  /** 获取某个组件详情页的配置信息  */
  public getWidgetsDetailConfig(w_name: string): any {
    return this.widgetsDetailConfig?.[w_name]
  }

  /** 获取当前画布缩放级别  */
  public getCurScaleValue = () => Number(document.body.style.getPropertyValue(CSS_DEFINE["--canvas-scale"]))

  /** 是否显示标尺  */
  public displayLineGuides(isShow: boolean = true) {
    if (isShow) {
      if (!this.designCanvasTarget) return
      this.lineGuides = new LineGuides()
      this.lineGuides.mount(this.designCanvasTarget)
    } else {
      this.lineGuides && this.lineGuides.destroy()
      this.lineGuides = void 0
    }
  }
}

export const editorStore = new EditorStore()
