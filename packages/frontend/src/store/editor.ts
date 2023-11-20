import {MoveableManager} from "@/common/moveable/moveable";
import {CSS_DEFINE, DESIGN_OPTIONS, DESIGN_SET_STATE} from "@/constant";
import {toRaw} from "vue";
import {deepmerge} from "@biggerstar/deepmerge";
import {loadFont} from "@/utils/method";
import {isNumber} from "is-what";
import {LineGuides} from "@/common/line-guides/line-guides";
import {CurrentTemplate, LayoutConfig, PageConfig} from "@/types/layout";
import {apiGetFonts} from "@/api/getFonts";
import {SelectoManager} from "@/common/selecto/selecto";
import {isNil} from "lodash-es";

/**
 * 设计页面(/design) 的store
 * 为何不使用pinia ? 因为尝试了使用 pinia , 认为太重了影响性能，多处使用容易造成数据不清，并且部分无需代理的对象被代理并无法使用Object.freeze
 * */
class EditorStore {
  /** moveable 管理器 */
  public moveableManager: MoveableManager
  public selectoManager: SelectoManager
  public lineGuides: LineGuides
  /** 所有字体 */
  allFont: object[]
  public
  /** 当前正在编辑的工程文件 */
  public pageConfig: PageConfig = {
    brand: '',
    asideTag: [],
    scaleSizeList: [],
    widgetsDetail: {},
    predefineColors: [],
    header: {
      moreOperation: []
    }
  }

  public currentTemplate: CurrentTemplate

  /** 获取当前活跃小组件的配置信息 */
  public getCurrentOptions(): Record<any, any> {
    const currentWidget = editorStore.moveableManager.currentWidget
    if (!currentWidget) return
    return currentWidget[DESIGN_OPTIONS]
  }

  public getCurrentTemplateLayout(): LayoutConfig {
    return this.currentTemplate.layouts[0]
  }

  /** 载入当前要编辑的工程配置信息 */
  public loadEditorProject(projectInfo) {
    this.currentTemplate = projectInfo
  }

  /** 设置当前正在活跃的小组件配置,会自动更新源currentProject.items中的配置,是否直接覆盖整个对象(值)
   * safe 安全合并，在源对象上若没有的不会被合并, 默认 false
   * effectDom 本次设置的值是否对应到dom并影响dom效果 ， 默认 true
   * */

  public updateActiveWidgetsState<T extends Record<any, any>>(activeInfo: T, options: { safe?: boolean, effectDom?: boolean } = {}): void {
    const {effectDom = true} = options
    const currentWidget = editorStore.moveableManager.currentWidget
    if (!currentWidget) return
    /* 通过activeOptions引用更新在 currentTemplate.items 中的配置  */
    deepmerge(this.getCurrentOptions(), activeInfo, options)
    this.moveableManager?.moveable?.updateRect()
    this.lineGuides?.updateGuidesStyle?.()
    if (effectDom) currentWidget[DESIGN_SET_STATE](activeInfo)
  }

  public designCanvasTarget: HTMLElement  // #design-canvas
  public editorAreaBoxTarget: HTMLElement  // #editor-area-box
  public editorAreaTarget: HTMLElement  // #editor-area

  /** 获取当前画布缩放级别  */
  public getCurScaleValue = () => Number(document.body.style.getPropertyValue(CSS_DEFINE["--canvas-scale"]))

  /** 设置当前画布缩放级别，若传入为空或者null，则表示计算当前画布的最佳缩放比例，需要在首次加载画板功能时调用一次将画布设置到最佳尺寸  */
  public updateCanvasScale(scale: number | null | void = null) {
    const bodyStyle = document.body.style
    if (!scale || isNumber(scale) && scale <= 0) {
      const canvasInfo = this.currentTemplate.layouts[0]
      const DC_Rect = this.designCanvasTarget.getBoundingClientRect()
      scale = Number(Math.min((DC_Rect.width - 60 * 2) / canvasInfo.width, (DC_Rect.height - 60 * 2) / canvasInfo.height).toFixed(2))       // 获取最佳比例
    }
    bodyStyle.setProperty(CSS_DEFINE["--canvas-scale"], String(scale))  // 设置当前尺寸，未设置 scale 或者 scale 为 null 自动设置最佳尺寸
    this.moveableManager?.moveable?.updateRect?.()
    this.lineGuides?.updateGuidesStyle?.()
  }

  /**
   * 更新当前正在编辑的工程文件信息和相关状态,同步到当前工程( currentTemplate )使用的配置中
   * 并应用到当前的 canvas 画布中
   * safe 安全合并，在源对象上若没有的不会被合并, 默认 false
   * */
  public updateCanvasStyle<T extends Record<any, any>>(canvasInfoOptions: T & Partial<LayoutConfig>, options: { safe?: boolean } = {}): void {
    if (!this.currentTemplate) return
    if (!this.designCanvasTarget || !this.editorAreaTarget) throw new Error('designCanvas 未挂载')
    const canvasInfo: LayoutConfig = <any>canvasInfoOptions
    let {width, height, backgroundColor, backgroundImage} = canvasInfo
    const bodyStyle = document.body.style
    const has = (key: keyof LayoutConfig) => Reflect.has(canvasInfo, key)
    has('width') && bodyStyle.setProperty(CSS_DEFINE["--canvas-width"], `${width}px`)
    has('height') && bodyStyle.setProperty(CSS_DEFINE["--canvas-height"], `${height}px`)
    has('backgroundColor') && (this.editorAreaTarget.style.backgroundColor = isNil(backgroundColor) ? '#FFF' : backgroundColor)
    has('backgroundImage') && (this.editorAreaTarget.style.backgroundImage = `url(${backgroundImage})`)
    this.moveableManager?.moveable?.updateRect?.()
    this.lineGuides?.updateGuidesStyle?.()
    deepmerge(this.currentTemplate.layouts, canvasInfo, options)
  }

  /**
   * 更新当前正在编辑的工程文件信息和相关状态
   * safe 安全合并，在源对象上若没有的不会被合并, 默认 false
   * */
  public updateCurrentProjectState<T extends Record<any, any>>(projectInfo: T, options: { safe?: boolean } = {}): void {
    projectInfo = toRaw(projectInfo)
    if (!this.currentTemplate) return
    deepmerge(this.currentTemplate, projectInfo, options)
  }

  /** 通过 名称 获取字体信息  */
  public getFont4FontName(fontName: string) {
    if (!fontName || !this.allFont) return
    return this.allFont.find(item => item.name === fontName)
  }

  /** 为指定元素自动设置字体，如果本地没有将自动远程获取载入  */
  public async setFontFamily(el: HTMLElement, fontName: string): Promise<any> {
    let fontData = this.getFont4FontName(fontName)
    if (!fontData) {
      const res = await apiGetFonts({name: fontName})
      if (res && res.data && res.data.length) fontData = res.data[0]
    }

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
    return this.pageConfig.widgetsDetail?.[w_name]
  }

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
