import {MoveableManager} from "@/common/moveable/moveable";
import {CSS_DEFINE, DESIGN_GROUP_UPDATE_RECT, DESIGN_OPTIONS, DESIGN_SET_STATE} from "@/constant";
import {reactive, toRaw} from "vue";
import {deepmerge} from "@biggerstar/deepmerge";
import {CssTransformApi, loadFont, parseWidget4DomChain} from "@/utils/method";
import {isNumber} from "is-what";
import {LineGuides} from "@/common/line-guides/line-guides";
import {CurrentTemplate, LayoutConfig, LayoutWidget, PageConfig} from "@/types/layout";
import {apiGetFonts} from "@/api/getFonts";
import {SelectoManager} from "@/common/selecto/selecto";
import {isNil} from "lodash-es";
import {v4 as uuid4} from "uuid";

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

  /** 是否允许当前聚焦的合并组进行组件内移动 */
  public allowInGroupMovement: boolean

  /** 获取当前活跃小组件的配置信息 */
  public getCurrentOptions(): Record<any, any> {
    const currentWidget = editorStore.moveableManager.currentWidget
    if (!currentWidget) return
    return currentWidget[DESIGN_OPTIONS]
  }

  public currentTemplateIndex = 0

  /** 获取当前使用的模板，一套设计工程可能包含多个模板作为模板组 */
  public getCurrentTemplateLayout(index): LayoutConfig {
    return this.currentTemplate.layouts[this.currentTemplateIndex]
  }

  /** 载入当前要编辑的工程配置信息 */
  public loadEditorProject(projectInfo) {
    this.currentTemplate = reactive(projectInfo)
    this.currentTemplateIndex = 0
    this.allowInGroupMovement = false
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

  /**
   * 将当前被选择的组件进行合并组, 创建一个 w-group 并将所有的小组件作为该组的子组件
   * */
  public mergeGroup() {
    const childrenOptions = editorStore.selectoManager.selected.map(node => node[DESIGN_OPTIONS])
    if (!childrenOptions.length) return
    const newWidgetConfig = {
      uuid: uuid4(),
      type: 'group',
      elements: childrenOptions
    }
    this.getCurrentTemplateLayout(this.currentTemplateIndex).elements.push(<LayoutWidget>newWidgetConfig)
    const children = <HTMLElement[]>Array.from(this.editorAreaTarget.children)  // 只会操控首层的组件进行成组
    const newElement = children.find((node: HTMLElement) => {
      // console.log(node.dataset['uuid'])
      return node.dataset['uuid'] && node.dataset['uuid'] === newWidgetConfig.uuid
    })
    const remove_uuids = newWidgetConfig.elements.map(config => config.uuid)
    // console.log(remove_uuids)
    children.forEach((node: HTMLElement) => {
      const uuid = node.dataset['uuid']
      if (!uuid) return
      if (remove_uuids.includes(uuid)) node.remove()
    })
    this.moveableManager.moveable.target = newElement
  }

  /**
   * 将当前活跃的合并组分离成组件分散放置到首层画板上
   * */
  public separationGroup() {
    const currentGroupElement = editorStore.moveableManager.currentGroupElement
    if (!currentGroupElement) return
    const cssTransformApi = new CssTransformApi()
    cssTransformApi.load(currentGroupElement.style.transform)
    const [groupX = 0, groupY = 0] = cssTransformApi.get('translate')  // 获取组在当前画布中位置，解散后子组件需要在自身偏移基础上添加上当所在组在画布中的距离
    const groupConfig: LayoutWidget = currentGroupElement[DESIGN_OPTIONS]
    const elements = groupConfig.elements || []
    const vueModelElementWidgetConfig = this.getCurrentTemplateLayout(this.currentTemplateIndex).elements
    const curGroupIndex = vueModelElementWidgetConfig.findIndex(config => config === groupConfig)
    vueModelElementWidgetConfig.splice(curGroupIndex, 1)
    elements.forEach(newConfig => {
      newConfig.left += parseFloat(String(groupX))
      newConfig.top += parseFloat(String(groupY))
      vueModelElementWidgetConfig.push(newConfig)
    })
  }

  /**
   * 启动自动监听当前组内移动是否点击了组外的地方, 如果点击到外部则将自动停止监听并关闭组件内移动
   * */
  public autoMonitoringGroupMovement() {
    if (!this.designCanvasTarget || this.allowInGroupMovement) return
    const self = this
    const currentGroupElement = editorStore.moveableManager.currentGroupElement
    if (!currentGroupElement) return

    /**
     * 当正在进行组内移动操作时，监听是否点击了组外的地方，如果点击了将会停止组内移动操作
     * */
    function monitoringClickGroupOuter(ev: MouseEvent) {
      const target = self.moveableManager.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)
      const foundGroupForTarget = parseWidget4DomChain(target, (node) => currentGroupElement === node)
      if (!foundGroupForTarget) {
        self.allowInGroupMovement = false
        self.designCanvasTarget.removeEventListener("mousedown", monitoringClickGroupOuter, false)
        self.designCanvasTarget.removeEventListener("mouseup", updateRect, false)
      }
    }

    function updateRect() {
      currentGroupElement && currentGroupElement[DESIGN_GROUP_UPDATE_RECT]?.()  // 自动调整group尺寸包裹所有子组件
    }

    this.designCanvasTarget.addEventListener("mousedown", monitoringClickGroupOuter)
    this.designCanvasTarget.addEventListener("mouseup", updateRect)
    this.allowInGroupMovement = true
  }
}

export const editorStore = new EditorStore()
