// noinspection JSUnusedGlobalSymbols

import {MoveableManager} from "@/common/moveable/moveable";
import {
  CSS_DEFINE,
  DESIGN_GROUP_UPDATE_RECT,
  DESIGN_OPTIONS,
  DESIGN_SET_STATE,
  WIDGET_GROUP_SELECTION_SELECTOR,
  WIDGET_GROUP_SELECTION_SEPARATE,
  WIDGET_SELECTION_SELECTOR_KEEP,
  WIDGET_SELECTOR,
  WIDGETS_NAMES
} from "@/constant";
import {nextTick, reactive, toRaw} from "vue";
import {deepmerge} from "@biggerstar/deepmerge";
import {
  CssTransformApi,
  getWidgetOptionsFromElement,
  isWidgetType,
  loadFont,
  parseGroupWidget4DomChain,
  parseWidget4DomChain,
  parseWidgetsInfo4DomChain,
  removeAllTextSelectRanges,
  selectAllText4Element
} from "@/utils/method";
import {isFunction, isNumber} from "is-what";
import {LineGuides} from "@/common/line-guides/line-guides";
import {CurrentTemplate, LayoutConfig, LayoutWidget, Material, PageConfig} from "@/types/layout";
import {apiGetFonts} from "@/api/getFonts";
import {SelectoManager} from "@/common/selecto/selecto";
import {cloneDeep, isNil} from "lodash-es";
import {v4 as uuid4} from "uuid";
import mitt, {Emitter} from 'mitt'
import {DragWidgetManager} from "@/common/drag-widget/drag-widget";
import {apiGetDetail, apiPostDetail} from "@/api/getDetail";
import {notification} from "ant-design-vue";
import {mockUserId} from "@/config/widgets-map";
import {DrawGraph} from "@/common/draw-graph/DrawGraph";

type EditorEvent = {
  loadTemplate: {
    id?: string,
    data: any
  }
}

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
  public drawGraph: DrawGraph
  public bus: Emitter<EditorEvent> =  mitt()
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

  public currentClipboard: LayoutWidget[] = []

  /** 获取当前活跃小组件的配置信息 */
  public getCurrentOptions(): Record<any, any> {
    const currentWidget = editorStore.moveableManager.currentWidget
    if (!currentWidget) return
    return currentWidget[DESIGN_OPTIONS]
  }

  public currentTemplateIndex = 0

  /** 获取当前使用的模板，一套设计工程可能包含多个模板作为模板组 */
  public getCurrentTemplateLayout(): LayoutConfig | void {
    if (!this.currentTemplate || !this.currentTemplate?.layouts) return
    return this.currentTemplate.layouts[this.currentTemplateIndex]
  }

  /** 载入当前要编辑的工程配置信息 */
  public loadEditorProject(projectInfo) {
    this.currentTemplate = reactive(projectInfo)
    this.currentTemplateIndex = 0
    this.allowInGroupMovement = false
    this.isSeparating = false
  }

  public initCanvas() {
    const currentTemplate = {
      layouts: [
        {
          width: 1200,
          height: 2200,
          elements: [],
          title: '未命名设计'
        },
      ]
    }
    editorStore.bus.emit('loadTemplate', {
      data: currentTemplate
    })
  }

  /** 设置当前正在活跃的小组件配置,会自动更新源currentProject.items中的配置,是否直接覆盖整个对象(值)
   * safe 安全合并，在源对象上若没有的不会被合并, 默认 false
   * effectDom 本次设置的值是否对应到dom并影响dom效果 ， 默认 true
   * */
  public updateActiveWidgetsState<T extends Partial<LayoutWidget>>(activeInfo: T, options: { safe?: boolean, effectDom?: boolean, widgetEl?: Element } = {}): void {
    const {effectDom = false, widgetEl} = options
    const currentWidget = widgetEl || editorStore.moveableManager.currentWidget
    if (!currentWidget) return
    /* 通过activeOptions引用更新在 currentTemplate.items 中的配置  */
    const currentOptions = currentWidget[DESIGN_OPTIONS]
    // console.log(currentOptions)
    // console.log(activeInfo)
    deepmerge(currentOptions, activeInfo, options)
    this.moveableManager?.moveable?.updateRect()
    this.lineGuides?.updateGuidesStyle?.()
    if (effectDom) currentWidget[DESIGN_SET_STATE](activeInfo)
  }

  public mainTarget: HTMLElement  // #main
  public designCanvasTarget: HTMLElement  // #design-canvas
  public editorAreaBoxTarget: HTMLElement  // #editor-area-box
  public editorAreaTarget: HTMLElement  // #editor-area
  public editorAreaBgTarget: HTMLElement  // #editor-area-bg

  /** 获取当前画布缩放级别  */
  public getCurScaleValue = () => Number(document.body.style.getPropertyValue(CSS_DEFINE["--canvas-scale"]))

  /** 设置当前画布缩放级别，若传入为空或者null，则表示计算当前画布的最佳缩放比例，需要在首次加载画板功能时调用一次将画布设置到最佳尺寸  */
  public updateCanvasScale(scale: number | null | void = null) {
    if (!this.designCanvasTarget) return
    const bodyStyle = document.body.style
    if (!scale || isNumber(scale) && scale <= 0) {
      const canvasInfo = this.getCurrentTemplateLayout()
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
    let {width, height, backgroundColor, backgroundImage, opacity} = canvasInfo
    const bodyStyle = document.body.style
    const has = (key: keyof (LayoutConfig & Partial<CSSStyleDeclaration>)) => Reflect.has(canvasInfo, key)
    has('width') && bodyStyle.setProperty(CSS_DEFINE["--canvas-width"], `${width}px`)
    has('height') && bodyStyle.setProperty(CSS_DEFINE["--canvas-height"], `${height}px`)
    has('backgroundColor') && (this.editorAreaBgTarget.style.backgroundColor = isNil(backgroundColor) ? '#FFF' : backgroundColor)
    has('backgroundImage') && (this.editorAreaBgTarget.style.backgroundImage = backgroundImage ? `url(${backgroundImage})` : 'unset')
    has('opacity') && (this.editorAreaBgTarget.style.opacity = opacity)
    this.moveableManager?.moveable?.updateRect?.()
    this.lineGuides?.updateGuidesStyle?.()
    deepmerge(this.getCurrentTemplateLayout(), canvasInfo, options)
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
      this.lineGuides.mount(this.mainTarget)
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
   * 通过传入 uuid 或者 options配置引用对象，找到当前与之对应的组件dom元素
   * */
  public findWidgetElement(meta: any, type: 'uuid' | 'options'): HTMLElement | void {
    const allWidget = this.getAllWidget()
    if (type === 'uuid') return allWidget.find(node => node.dataset['uuid'] === meta)
    else if (type === 'options') return allWidget.find(node => node[DESIGN_OPTIONS] === meta)
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
    this.addMaterialToGroup(<any>newWidgetConfig)
    const allWidgets = this.getAllWidget() // 只会操控首层的组件进行成组
    const remove_uuids = newWidgetConfig.elements.map(config => config.uuid)
    // console.log(remove_uuids)
    allWidgets.forEach((node: HTMLElement) => {
      const uuid = node.dataset['uuid']
      if (!uuid) return
      if (remove_uuids.includes(uuid)) node.remove()   //移除原有组件
    })
    nextTick(() => {
      const allWidgets = this.getAllWidget()
      const newGroupElement = allWidgets.find((node: HTMLElement) => node.dataset['uuid'] && node.dataset['uuid'] === newWidgetConfig.uuid)
      if (newGroupElement) {
        isFunction(newGroupElement[DESIGN_GROUP_UPDATE_RECT]) && newGroupElement[DESIGN_GROUP_UPDATE_RECT]()   // 让子组件填满合并组的容器
        this.moveableManager.moveable.target = newGroupElement
      }
      this.selectoManager.selected = []
    }).then()
  }

  /**
   * 将当前活跃的合并组分离成组件分散放置到首层画板上
   * */
  public separationGroup() {
    const currentGroupElement = editorStore.moveableManager.currentGroupElement
    if (!currentGroupElement) return
    this.isSeparating = true
    const groupConfig: LayoutWidget = getWidgetOptionsFromElement(currentGroupElement)
    const clipElementsConfigInfo = toRaw(groupConfig.elements) || []
    const uuidList = clipElementsConfigInfo.map(item => item.uuid)
    const allWidgets: HTMLElement[] = this.getAllWidget()
    const addSeparateBorder = () => {
      const newWidgetElementList: HTMLElement[] = Array.from(allWidgets).filter(node => uuidList.includes(node.dataset['uuid']))
      newWidgetElementList.forEach(node => node.classList.add(WIDGET_GROUP_SELECTION_SEPARATE))
      currentGroupElement.classList.add(WIDGET_GROUP_SELECTION_SELECTOR)
      this.selectoManager.selected = newWidgetElementList
    }
    addSeparateBorder()
    this.autoMonitoringGroupMovement(() => {   // 只有等到点击分离组后的外部才真正进行分离
      this.selectoManager.selected = []    // 必须在前面，否则 selectoManager.on('selectEnd') 会将所有选择框选
      const latestGroupElement = editorStore.moveableManager.currentGroupElement
      if (!latestGroupElement) return
      const cssTransformApi = new CssTransformApi()
      cssTransformApi.load(latestGroupElement.style.transform)
      const [groupX = 0, groupY = 0] = cssTransformApi.get('translate')  // 获取组在当前画布中位置，解散后子组件需要在自身偏移基础上添加上当所在组在画布中的距离
      clipElementsConfigInfo.forEach(newConfig => {
        newConfig.left += parseFloat(String(groupX))
        newConfig.top += parseFloat(String(groupY))
        this.addMaterialToGroup(newConfig)
      })
      this.removeWidget(groupConfig)
    })
  }

  /**
   * 启动自动监听当前组内移动是否点击了组外的地方, 如果点击到外部则将自动停止监听并关闭组件内移动
   * */
  public autoMonitoringGroupMovement(callback?: Function): () => void {
    isFunction(this.__temp__.stop) && this.__temp__.stop()  // 添加监听前先停止上一个监听
    if (!this.designCanvasTarget || this.allowInGroupMovement) return
    const self = this
    let isStop = false

    /**
     * 当正在进行组内移动操作时，监听是否点击了组外的地方，如果点击了将会停止组内移动操作
     * @return Function 返回一个停止监听函数
     * */
    function monitoringClickGroupOuter(ev: MouseEvent) {
      if (isStop) return
      const currentGroupElement = editorStore.moveableManager.currentGroupElement
      if (!currentGroupElement) return
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
      self.designCanvasTarget.removeEventListener("mousedown", monitoringClickGroupOuter)
      self.designCanvasTarget.removeEventListener("mouseup", updateRect)
    }

    const currentGroupElement = editorStore.moveableManager.currentGroupElement
    if (!currentGroupElement) return
    const updateRect = () => currentGroupElement && currentGroupElement[DESIGN_GROUP_UPDATE_RECT]?.()  // 自动调整group尺寸包裹所有子组件

    this.designCanvasTarget.addEventListener("mousedown", monitoringClickGroupOuter)
    this.designCanvasTarget.addEventListener("mouseup", updateRect)
    /*------------------------------------------------------------------------------------------------*/
    this.allowInGroupMovement = true
    this.__temp__.stop = stop
    return stop
  }

  /**
   * 添加素材
   * */
  public async addMaterial(material: Partial<Material & LayoutWidget>, opt: { autoSize?: boolean } = {}) {
    // console.log(materialDetail)
    const options = {}
    const currentLayout = this.getCurrentTemplateLayout()
    if (!currentLayout) return
    if (material.type === 'text') {
      const materialDetail = await apiGetDetail({id: material.id})
      if (materialDetail && materialDetail.data) {
        Object.assign(options, materialDetail.data.model, {backgroundColor: materialDetail.data.layout?.backgroundColor})
      }
      // console.log(materialDetail)
    }
    /*-----------------------------------------------------------------------------*/
    if (opt.autoSize) {
      material.width = Math.min(currentLayout.width / 2, material.preview.width)
      material.height = Math.min(currentLayout.height / 2, material.preview.height)
    } else if (material.preview) {
      material.width = material.preview.width
      material.height = material.preview.height
    }
    if (!material.left || !material.top) {  // 没指定位置直接添加到中心
      const sizeInfo = {
        width: material.width,
        height: material.height,
      }
      material.left = currentLayout.width / 2 - sizeInfo.width / 2
      material.top = currentLayout.height / 2 - sizeInfo.height / 2
    }
    /*-----------------------------------------------------------------------------*/
    // console.log(currentLayout)
    // console.log(material)

    const newWidgetConfig: Partial<LayoutWidget> = {
      title: material.title,
      type: material.type,
      url: material.preview?.url,
      dragable: true,
      rotatable: true,
      width: Math.min(300 / this.getCurScaleValue(), material.width),
      height: material.height,
      ...options,
      left: material.left,
      top: material.top,
    }
    this.addMaterialToGroup(<any>newWidgetConfig)
  }

  /**
   * 通过id直接加载远程物料
   * @param id
   * @param coverOptions  覆盖物料的初始配置
   * */
  public async addMaterialFromId(id: string | number, coverOptions: Partial<LayoutWidget> = {}) {
    const res = await apiGetDetail({id})
    // console.log(res)
    if (res && res.data?.model) {
      const currentLayout = this.getCurrentTemplateLayout()
      if (!currentLayout) return
      const material = res.data?.model
      const sizeInfo = {
        width: material.width,
        height: material.height,
      }
      material.left = currentLayout.width / 2 - sizeInfo.width / 2
      material.top = currentLayout.height / 2 - sizeInfo.height / 2
      this.addMaterialToGroup(<any>Object.assign(res.data.model, coverOptions))
    }
  }

  /** 添加组件来自配置信息，默认添加到根中，如果指定了要添加的合并组( groupProxyOptions )，则会添加到该组中 */
  public addMaterialToGroup(newWidgetOptions: LayoutWidget, groupProxyOptions?: LayoutWidget, opt: { autoPosition?: boolean } = {}) {
    // console.log(newWidgetOptions)
    const currentTemplateLayout = groupProxyOptions || this.getCurrentTemplateLayout()
    if (!currentTemplateLayout) return
    const {autoPosition = false} = opt
    if (autoPosition) {
      const sizeInfo = {
        width: newWidgetOptions.width,
        height: newWidgetOptions.height,
      }
      newWidgetOptions.left = currentTemplateLayout.width / 2 - sizeInfo.width / 2
      newWidgetOptions.top = currentTemplateLayout.height / 2 - sizeInfo.height / 2
    }
    this.selectoManager.selected = []
    if (!newWidgetOptions.uuid) newWidgetOptions.uuid = uuid4()
    currentTemplateLayout.elements.push(cloneDeep(newWidgetOptions))   // 添加新组件必须深度克隆，如果传进来是vue代理对象可能会出错，必须断开vue响应式连接
    const vueModelElementOptions = currentTemplateLayout.elements.find(elementConfig => elementConfig.uuid === newWidgetOptions.uuid) // 找到经过vue转换后的组件配置的代理对象
    nextTick(() => {
      const newWidElement = this.findWidgetElement(vueModelElementOptions, "options")
      if (newWidElement && isWidgetType(newWidElement, WIDGETS_NAMES.W_TEXT)) {   // 如果是文本节点进行全选高亮突出显示
        newWidElement && this.switchTextEditable({
          el: newWidElement,
          type: "select"
        })
      }
    }).then()
  }

  /**
   * 移除dom中的组件
   * @param target  传入组件的dom元素 或者 组件的vue响应式代理配置引用，会自动查找并移除
   * */
  public removeWidget(target: Element | LayoutWidget) {
    let widgetEl
    let widgetOptions
    if (target instanceof Element) {
      widgetEl = target
      widgetOptions = getWidgetOptionsFromElement(widgetEl)
    } else {
      widgetOptions = target
      widgetEl = this.getAllWidget().find(node => getWidgetOptionsFromElement(node) === widgetOptions)
      if (!widgetOptions) console.error('该配置对应的组件不在画布上')
    }
    const widgetGroupEl = parseGroupWidget4DomChain(<any>widgetEl.parentElement)   // 获取其所在的合并组
    if (widgetGroupEl) {   // 如果要移除的组件在合并组内，则找到该组然后移除该组的子组件
      const widgetGroupOptions: LayoutWidget = getWidgetOptionsFromElement(widgetGroupEl)
      if (widgetGroupOptions) {
        this.removeWidgetFromParentVueModelOptions(widgetGroupOptions, widgetOptions)
      }
    } else {   // 如果要移除的组件不在任何合并组内，则说明在根中，找到根直接移除
      this.removeWidgetFromParentVueModelOptions(this.getCurrentTemplateLayout(), widgetOptions)
    }
  }

  /**
   * 从vue响应式中移除组件节点，传入该组件所在的合并组或者根组件配置信息
   * */
  public removeWidgetFromParentVueModelOptions(widgetParentOptions, widgetOptions) {
    const vueModelElementWidgetConfig = widgetParentOptions.elements
    const curGroupIndex = vueModelElementWidgetConfig.findIndex(config => config === widgetOptions)
    vueModelElementWidgetConfig.splice(curGroupIndex, 1)
    this.moveableManager.moveable.target = []
    this.selectoManager.selected = []
    this.moveableManager.moveable.updateRect()
    this.moveableManager.moveable.updateSelectors()
  }

  /**
   * 保存当前工程到服务器
   * @param type push表示新id 的url会添加到历史记录中， replace表示不会添加到历史记录中
   * */
  public async saveProject(type: 'push' | 'replace' = 'push') {  /* 保存当前工程 */
    const saveNotification = (mode: 'success' | 'error', msg?: string) => {
      if (!mode) return
      if (mode === 'success') {
        notification.open({
          message: '保存成功',
          description: msg || `🎉🎉 您的项目已经保存成功啦! 您可以在左侧我的查看`,
          duration: 1.5,
        });
      } else {
        notification.open({
          message: '保存失败',
          description: msg || '哦吼，保存失败了',
          duration: 1.5,
        });
      }
    };
    const currentTemplate = toRaw(editorStore.currentTemplate)
    if (!currentTemplate) return saveNotification("error", '哦吼, 保存失败了,没找到 [ 设计图 ] 数据')
    const reqBody: any = {
      uid: mockUserId,   // 先默认用户，后面有加入用户系统的时候在进行区分
      data: currentTemplate
    }
    // console.log(currentTemplate)
    const urls = new URL(location.href)
    const curUrlId = urls.searchParams.get('id')
    if (curUrlId) reqBody.id = curUrlId
    const res = await apiPostDetail(reqBody)
    if (res && res.code === 200) {
      const resData = res.data
      if (resData && resData.id) {
        if (curUrlId !== resData.id.toString()) {   // 如果id不一样才进行地址栏url，相同的话不会改变
          urls.searchParams.set('id', resData.id)
          if (type === 'push') history.replaceState(history.state, '', urls.href)  // 将官方默认资源id转成用户当前设计的自有模板id
          else history.pushState(history.state, '', urls.href)
        }
      }
      saveNotification("success")
    } else {
      saveNotification("error")
    }
  }

  public textWidgetInfo: {
    type: 'select' | 'edit' | 'none',
    target: HTMLElement | null,
    groupTarget: HTMLElement | null,
  } = {}

  /**
   * 每次运行切换文本框可编辑的不同状态
   * */
  public switchTextEditable(opt: { el?: HTMLElement, type?: typeof this.textWidgetInfo["type"] } = {}) {
    let {el, type} = opt
    if (!el) {
      const currentWidget = this.moveableManager.currentWidget
      if (currentWidget) el = currentWidget
    }
    let status = this.textWidgetInfo.type
    if (!type) {   // 没有指定type时自动判断
      if (!el) status = 'none'      // 如果点到无组件的空白位置处
      else if (isWidgetType(el, WIDGETS_NAMES.W_TEXT) && this.textWidgetInfo.target !== el) status = 'select'  /* 是文本节点但是切换到了其他文本节点*/
      else if (this.textWidgetInfo.target !== el) status = 'none'  // 如果点到其他不是文本节点的组件
    } else status = type
    this.textWidgetInfo.type = status
    // console.log(status, el, el?.style?.zIndex)

    if (status === 'select') {
      const groupInfo = parseWidgetsInfo4DomChain(el)
      el.contentEditable = 'true'
      Array.from(el.querySelectorAll('*')).forEach(node => node.contentEditable = 'true')
      selectAllText4Element(el)
      this.textWidgetInfo.type = 'edit'  // 下一个状态，类似红绿灯算法逻辑
      this.textWidgetInfo.target = el
      el.style.zIndex = '10000'
      if (groupInfo.isGroup && groupInfo.rootWidgetElement) {
        this.textWidgetInfo.groupTarget = groupInfo.rootWidgetElement
        this.textWidgetInfo.groupTarget.style.zIndex = '10000'
      }
    } else if (status === 'edit') {
      this.textWidgetInfo.target = el;
      (this.textWidgetInfo.target || el).focus()
    } else {
      Array.from(this.editorAreaTarget.querySelectorAll('*')).forEach(node => node.contentEditable = 'false')
      removeAllTextSelectRanges();
      if (this.textWidgetInfo.target || el) (this.textWidgetInfo.target || el).style.zIndex = '0'
      this.textWidgetInfo.groupTarget && (this.textWidgetInfo.groupTarget.style.zIndex = '0')
      this.textWidgetInfo.type = 'none'
      this.textWidgetInfo.target = null
    }
  }
}

export const editorStore = new EditorStore()
