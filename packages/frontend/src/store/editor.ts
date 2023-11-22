import {MoveableManager} from "@/common/moveable/moveable";
import {
  CSS_DEFINE,
  DESIGN_GROUP_UPDATE_RECT,
  DESIGN_OPTIONS,
  DESIGN_SET_STATE,
  WIDGET_GROUP_SELECTION_SELECTOR,
  WIDGET_GROUP_SELECTION_SEPARATE,
  WIDGET_SELECTION_SELECTOR_KEEP,
  WIDGET_SELECTOR
} from "@/constant";
import {nextTick, reactive, toRaw} from "vue";
import {deepmerge} from "@biggerstar/deepmerge";
import {CssTransformApi, loadFont, parseWidget4DomChain} from "@/utils/method";
import {isFunction, isNumber} from "is-what";
import {LineGuides} from "@/common/line-guides/line-guides";
import {CurrentTemplate, LayoutConfig, LayoutWidget, Material, PageConfig} from "@/types/layout";
import {apiGetFonts} from "@/api/getFonts";
import {SelectoManager} from "@/common/selecto/selecto";
import {isNil} from "lodash-es";
import {v4 as uuid4} from "uuid";
import {Emitter} from 'mitt'
import {DragWidgetManager} from "@/common/drag-widget/drag-widget";

/**
 * 设计页面(/design) 的store
 * 为何不使用pinia ? 因为尝试了使用 pinia , 认为太重了影响性能，多处使用容易造成数据不清，并且部分无需代理的对象被代理并无法使用Object.freeze
 * */
class EditorStore {
  /** moveable 管理器 */
  public moveableManager: MoveableManager
  public selectoManager: SelectoManager
  public dragWidgetManager: DragWidgetManager
  public lineGuides: LineGuides
  public bus: Emitter<any>
  /** 所有字体 */
  public allFont: object[] = []

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
  public __temp__ = {
    stop: void 0,    // 停止监听点击组外事件的函数
  }
  public currentTemplate: CurrentTemplate

  /** 是否允许当前聚焦的合并组进行组件内移动 */
  public allowInGroupMovement: boolean

  /** 是否正在执行分离过程 */
  public isSeparating: boolean

  public currentDraggingMaterial: Material | null = null

  public dragMaterial(item: Material = null) {
    this.currentDraggingMaterial = item
  }

  /** 获取当前活跃小组件的配置信息 */
  public getCurrentOptions(): Record<any, any> {
    const currentWidget = editorStore.moveableManager.currentWidget
    if (!currentWidget) return
    return currentWidget[DESIGN_OPTIONS]
  }

  public currentTemplateIndex = 0

  /** 获取当前使用的模板，一套设计工程可能包含多个模板作为模板组 */
  public getCurrentTemplateLayout(): LayoutConfig {
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

  public mainTarget: HTMLElement  // #main
  public designCanvasTarget: HTMLElement  // #design-canvas
  public editorAreaBoxTarget: HTMLElement  // #editor-area-box
  public editorAreaTarget: HTMLElement  // #editor-area

  /** 获取当前画布缩放级别  */
  public getCurScaleValue = () => Number(document.body.style.getPropertyValue(CSS_DEFINE["--canvas-scale"]))

  /** 设置当前画布缩放级别，若传入为空或者null，则表示计算当前画布的最佳缩放比例，需要在首次加载画板功能时调用一次将画布设置到最佳尺寸  */
  public updateCanvasScale(scale: number | null | void = null) {
    if (!this.designCanvasTarget) return
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
    if (!this.designCanvasTarget || !this.editorAreaTarget) return
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
  public async setFontFamily(fontName: string, el?: HTMLElement): Promise<any> {
    let fontData = this.getFont4FontName(fontName)
    if (!fontData) {
      const res = await apiGetFonts({name: fontName})
      if (res && res.data && res.data.length) {
        fontData = res.data[0]
        this.allFont.push(fontData)
      }
    }
    return loadFont({
      url: fontData.content.woff,
      family: fontData.content.family,
    }).then(() => {
      if (el) el.style.fontFamily = fontData.content.family
    })
  }

  /** 为指定元素设置大小  */
  public setFontSize(el: HTMLElement, size: string | number) {
    if (!el) return
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

  public removeSeparatingBorder() {
    Array.from(this.editorAreaTarget.getElementsByClassName(WIDGET_GROUP_SELECTION_SEPARATE)).forEach(node => {
      node.classList.remove(WIDGET_GROUP_SELECTION_SEPARATE)
    })
    Array.from(this.editorAreaTarget.getElementsByClassName(WIDGET_SELECTION_SELECTOR_KEEP)).forEach(node => {
      node.classList.remove(WIDGET_SELECTION_SELECTOR_KEEP)
    })
  }

  public getAllWidget(): HTMLElement[] {
    return <HTMLElement[]>Array.from(this.editorAreaTarget.querySelectorAll(WIDGET_SELECTOR))

  }

  /**
   * 将当前被选择的组件进行合并组, 创建一个 w-group 并将所有的小组件作为该组的子组件
   * */
  public mergeGroup() {
    this.removeSeparatingBorder()
    if (this.isSeparating) { // 如果正在执行分离中，此时进行成组的话因为子组件还未从源组真正分离出去
      this.isSeparating = false
      this.allowInGroupMovement = false
      return
    }
    /* --------------------下面则是通过 selecto 进行选择后的合并过程 ------------------------------*/
    const childrenOptions = editorStore.selectoManager.selected.map(node => node[DESIGN_OPTIONS])
    if (!childrenOptions.length) return
    const minLeft = Math.min.apply(null, childrenOptions.map(config => config.left))
    const minTop = Math.min.apply(null, childrenOptions.map(config => config.top))

    const newWidgetConfig = {
      uuid: uuid4(),
      type: 'group',
      elements: childrenOptions,
      left: minLeft,
      top: minTop
    }
    childrenOptions.forEach(newConfig => {
      newConfig.left -= minLeft
      newConfig.top -= minTop
    })
    this.getCurrentTemplateLayout().elements.push(<LayoutWidget>newWidgetConfig)
    const allWidgets = this.getAllWidget() // 只会操控首层的组件进行成组
    const remove_uuids = newWidgetConfig.elements.map(config => config.uuid)
    // console.log(remove_uuids)
    allWidgets.forEach((node: HTMLElement) => {
      const uuid = node.dataset['uuid']
      if (!uuid) return
      if (remove_uuids.includes(uuid)) node.remove()
    })
    nextTick(() => {
      const allWidgets = this.getAllWidget()
      const newGroupElement = allWidgets.find((node: HTMLElement) => node.dataset['uuid'] && node.dataset['uuid'] === newWidgetConfig.uuid)
      if (newGroupElement) {
        isFunction(newGroupElement[DESIGN_GROUP_UPDATE_RECT]) && newGroupElement[DESIGN_GROUP_UPDATE_RECT]()   // 让子组件填满合并组的容器
        this.moveableManager.moveable.target = newGroupElement
      }
    }).then()
  }

  /**
   * 将当前活跃的合并组分离成组件分散放置到首层画板上
   * */
  public separationGroup() {
    const currentGroupElement = editorStore.moveableManager.currentGroupElement
    if (!currentGroupElement) return
    this.isSeparating = true
    const groupConfig: LayoutWidget = currentGroupElement[DESIGN_OPTIONS]
    const clipElements = toRaw(groupConfig.elements) || []
    const uuidList = clipElements.map(item => item.uuid)
    const allWidgets: HTMLElement[] = <any>this.editorAreaTarget.querySelectorAll(WIDGET_SELECTOR)
    const newWidgetElementList: HTMLElement[] = Array.from(allWidgets).filter(node => uuidList.includes(node.dataset['uuid']))
    newWidgetElementList.forEach(node => node.classList.add(WIDGET_GROUP_SELECTION_SEPARATE))
    currentGroupElement.classList.add(WIDGET_GROUP_SELECTION_SELECTOR)
    this.selectoManager.selected = newWidgetElementList

    this.autoMonitoringGroupMovement(() => {   // 只有等到点击分离组后的外部才真正进行分离
      this.selectoManager.selected = []    // 必须在前面，否则 selectoManager.on('selectEnd') 会将所有选择框选
      if (!this.isSeparating) return this.removeSeparatingBorder()
      const latestGroupElement = editorStore.moveableManager.currentGroupElement
      if (!latestGroupElement) return
      const cssTransformApi = new CssTransformApi()
      cssTransformApi.load(latestGroupElement.style.transform)
      const [groupX = 0, groupY = 0] = cssTransformApi.get('translate')  // 获取组在当前画布中位置，解散后子组件需要在自身偏移基础上添加上当所在组在画布中的距离
      const currentLayouts = this.getCurrentTemplateLayout()
      const vueModelElementWidgetConfig = currentLayouts.elements
      const curGroupIndex = vueModelElementWidgetConfig.findIndex(config => config === groupConfig)
      vueModelElementWidgetConfig.splice(curGroupIndex, 1)
      // TODO  错误在于 分离后点击
      nextTick(() => {
        clipElements.forEach(newConfig => {
          newConfig.left += parseFloat(String(groupX))
          newConfig.top += parseFloat(String(groupY))
          vueModelElementWidgetConfig.push(newConfig)
        })
      }).then()
    })
  }

  /**
   * 启动自动监听当前组内移动是否点击了组外的地方, 如果点击到外部则将自动停止监听并关闭组件内移动
   * */
  public autoMonitoringGroupMovement(callback?: Function): () => void {
    isFunction(this.__temp__.stop) && this.__temp__.stop()  // 添加监听前先停止上一个监听
    if (!this.designCanvasTarget || this.allowInGroupMovement) return
    const self = this
    const currentGroupElement = editorStore.moveableManager.currentGroupElement
    if (!currentGroupElement) return
    let isStop = false

    /**
     * 当正在进行组内移动操作时，监听是否点击了组外的地方，如果点击了将会停止组内移动操作
     * @return Function 返回一个停止监听函数
     * */
    function monitoringClickGroupOuter(ev: MouseEvent) {
      if (isStop) return
      const target = self.moveableManager.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)
      const foundGroupForTarget = parseWidget4DomChain(target, (node) => currentGroupElement === node)
      if (!foundGroupForTarget) {
        if (isFunction(callback)) callback()
        self.allowInGroupMovement = false
        self.isSeparating = false
        self.__temp__.stop = void 0
        stop()
      }
    }

    function stop() {
      isStop = true
      self.designCanvasTarget.removeEventListener("mousedown", monitoringClickGroupOuter, false)
      self.designCanvasTarget.removeEventListener("mouseup", updateRect, false)
    }

    const updateRect = () => currentGroupElement && currentGroupElement[DESIGN_GROUP_UPDATE_RECT]?.()  // 自动调整group尺寸包裹所有子组件

    this.designCanvasTarget.addEventListener("mousedown", monitoringClickGroupOuter)
    this.designCanvasTarget.addEventListener("mouseup", updateRect)
    /*------------------------------------------------------------------------------------------------*/
    this.allowInGroupMovement = true
    this.__temp__.stop = stop
    return stop
  }

  public async addMaterial(material: Partial<Material & LayoutWidget>) {
    // const materialDetail = await apiGetDetail({id: material.id})
    // console.log(materialDetail)
    const currentLayout = this.getCurrentTemplateLayout()
    if (!material.left || !material.top) {  // 没指定位置直接添加到中心
      const previewInfo = material.preview
      material.left = currentLayout.width / 2 - previewInfo.width / 2
      material.top = currentLayout.height / 2 - previewInfo.height / 2
    }

    console.log(material)
    // console.log(currentLayout)

    const newWidgetConfig: Partial<LayoutWidget> = {
      uuid: uuid4(),
      title: material.title,
      type: material.type,
      url: material.preview.url,
      dragable: true,
      rotatable: true,
      left: material.left,
      top: material.top,
      width: Math.min(material.preview.width,currentLayout.width * 0.8),
      height: Math.min(material.preview.height,currentLayout.height * 0.8),
    }
    currentLayout.elements.push(<any>newWidgetConfig)
  }

}

export const editorStore = new EditorStore()
