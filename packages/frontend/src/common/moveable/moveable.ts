import Moveable, {MoveableOptions, OnDrag, OnResize, OnResizeEnd, OnRotate, OnScale,} from "moveable";
import createNativeEventHookList from "@/common/moveable/native-event-hook-list";
import {
  CssTransformApi,
  getWidgetsName,
  inGroup,
  isMoveableControl,
  isWidget,
  parseWidget4DomChain,
  parseWidgetsInfo4DomChain,
  toFixed,
  toMatrixString
} from "@/utils/method";
import {editorStore} from "@/store/editor";
import './moveable-style.css'
import {
  DESIGN_AREA_BOUNDARY_SELECTOR,
  DESIGN_OPTIONS,
  LINE_GUIDE_HORIZONTAL_SELECTOR,
  LINE_GUIDE_VERTICAL_SELECTOR,
  MOVEABLE_ALL_DIRECTION,
  WIDGET_SELECTOR
} from "@/constant";
import {LayoutWidget} from "@type/layout";
import {pick} from "lodash-es";

const guideLines = [
  WIDGET_SELECTOR,
  LINE_GUIDE_HORIZONTAL_SELECTOR,
  LINE_GUIDE_VERTICAL_SELECTOR,
  DESIGN_AREA_BOUNDARY_SELECTOR,
]

/**
 * 默认配置，具体比如 dragable,resizable,rotatable 等配置可通过后台进行指定
 * */
export const defaultMoveableOptions: MoveableOptions = {
  zoom: 0.8,
  throttleDrag: 0,
  throttleResize: 0,
  throttleScale: 0,
  throttleRotate: 0,
  pinchable: true,
  origin: false,
  rotationPosition: 'bottom',
  elementGuidelines: guideLines,
  bounds: {
    position: 'client',
  },
  snappable: true,
  snapGridAll: true,
  snapGridWidth: 6,
  snapGridHeight: 6,
  snapDistFormat: (v) => `${v}px`,
  isDisplaySnapDigit: true,
  defaultGroupOrigin: '0% 0%',
  renderDirections: MOVEABLE_ALL_DIRECTION,
  // draggable: true,
  // clippable: false,
  // resizable: true,
  // scalable: false,
  // // keepRatio: true,
  // rotatable: true,
}


export class MoveableManager {
  public moveable: Moveable
  public container: HTMLElement
  public currentElement: HTMLElement | void   // 当前聚焦的元素
  public currentGroupElement: HTMLElement | void   // 当前聚焦的元素
  public resizeObserver: ResizeObserver | null

  public get currentWidget(): HTMLElement | void {   // 获取当前活跃的组件
    return parseWidget4DomChain(<any>this.currentElement)
  }

  private __running: boolean
  public eventHookList: Array<any>

  public __temp__ = {
    mousedownEl: void 0
  }

  constructor() {
    this.eventHookList = createNativeEventHookList()
  }

  /**
   * 开始工作
   * */
  public mount(container: HTMLElement | string | null | void, moveableOptions: MoveableOptions = {}) {
    if (this.__running) return
    this.__running = true
    if (typeof container === 'string') container = document.querySelector<HTMLElement>(container)
    if (!container) container = document.body
    this.container = container
    const moveable = new Moveable(container, moveableOptions);
    this.moveable = moveable

    /**
     * 自动生成合适的组件位置和变换大小，并同步到当前使用的模板配置中
     * */
    function syncMatrixTransform(transform: string, target: Element) {
      let matrix: DOMMatrix = new (WebKitCSSMatrix || DOMMatrix)(transform)
      const updateObj: Partial<LayoutWidget> = {
        transform: {
          tx: 0,   // translateX 和 Y
          ty: 0,
          ...pick(matrix, ['a', 'b', 'c', 'd'])
        }
      }
      const cssTransformApi = new CssTransformApi()
      cssTransformApi
        .load(transform)
        .remove("rotate")
        .remove("scale")
        .set("matrix", toMatrixString(updateObj.transform).join(','))   // 将 rotate，scale 通过 matrix 替代
      const nowTranslate = cssTransformApi.get("translate")
      if (nowTranslate && nowTranslate.length) {
        updateObj.left = parseFloat(nowTranslate[0])
        updateObj.top = parseFloat(nowTranslate[1])
      }
      // console.log(updateObj)
      editorStore.updateActiveWidgetsState(updateObj, {effectDom: false, widgetEl: target})
      return cssTransformApi.transform
    }

    this.resizeObserver = new ResizeObserver(() => this.moveable.updateRect())
    this.resizeObserver.observe(container)

    moveable
      .on("drag", (ev: OnDrag) => ev.target.style.transform = syncMatrixTransform(ev.transform, ev.target))
      .on("scale", (ev: OnScale) => ev.target.style.transform = syncMatrixTransform(ev.transform, ev.target)) /* 缩放时 width, height 不会变 */
      .on("rotate", (ev: OnRotate) => ev.target.style.transform = syncMatrixTransform(ev.transform, ev.target))
      .on("resize", (ev: OnResize) => {
        ev.target.style.transform = ev.transform
        ev.target.style.width = `${ev.width}px`;
        ev.target.style.height = `${ev.height}px`;
      })
      .on("resizeEnd", (ev: OnResizeEnd) => {
        const lastEvent: OnResize = ev.lastEvent
        if (!lastEvent) return
        syncMatrixTransform(lastEvent.transform, ev.target)
        editorStore.updateActiveWidgetsState({
          width: toFixed(lastEvent.width, 3),
          height: toFixed(lastEvent.height, 3),
        })
      })

    ;const eventHookList = this.eventHookList
    eventHookList.forEach((item) => {
      const options = item['options']
      this.container && this.container.addEventListener(item.name, item.call, options === void 0 ? {} : options)
    })
  }

  /**
   * 停止 moveable 工作
   * */
  public destroy() {
    this.moveable.destroy()
    this.eventHookList.forEach((item) => {
      this.container && this.container.removeEventListener(item.name, item.call)
    })
    this.resizeObserver && this.resizeObserver.disconnect()
    this.resizeObserver = null
    this.deActive()
  }

  /**
   * 让某些元素(不一定是小组件) 活跃
   * */
  public active(elements: HTMLElement | SVGElement | HTMLElement[] | SVGElement[]) {
    if (!elements) return
    const elList = !Array.isArray(elements) ? [elements] : elements
    const target = elList.filter((el: HTMLElement) => el && isWidget(el))
    if (target.length) {
      this.moveable.target = target
      this.moveable.forceUpdate()
    }
  }

  /**
   * 设置某个组件的外部定义的配置信息
   * */
  public setWidgetState(widgetsEl: HTMLElement, opt: Partial<MoveableOptions> = {}) {
    const widgetConfig: LayoutWidget = widgetsEl[DESIGN_OPTIONS] || {}
    const options: Partial<MoveableOptions> = {}
    if (widgetConfig.hasOwnProperty('dragable')) options.draggable = widgetConfig.dragable
    if (widgetConfig.hasOwnProperty('rotatable')) options.rotatable = widgetConfig.rotatable
    // console.log(options,widgetsEl)
    this.moveable.setState({
      ...options,
      ...opt,
    })
  }

  /**
   * 让dom链上的最近的小组件活跃
   * */
  public activeWidgets(element: HTMLElement | Element | SVGElement): {
    name: string,
    el: HTMLElement
  } | void {
    const widgetsEl = parseWidget4DomChain(<any>element)
    if (!widgetsEl) return
    const widgetsName = getWidgetsName(widgetsEl)
    if (!widgetsName) return
    this.active(widgetsEl)
    return {
      name: widgetsName,
      el: widgetsEl
    }
  }

  /**
   * 找到鼠标位置下不管第几层面积最小的组,如果在元素层次穿透过程发现moveable控制按钮，则直接返回
   * */
  public getMinAreaWidgetForMousePoint(x: number, y: number): HTMLElement | null {
    const mousePointElements = <any>document.elementsFromPoint(x, y)
    const foundMoveableControl = mousePointElements.find(node => isMoveableControl(node))
    if (foundMoveableControl) return null
    const mousePointWidgets = mousePointElements.filter(isWidget)
    const mousePointMinAreaWidgets = mousePointWidgets.sort((n1: HTMLElement, n2: HTMLElement) => {
      // 找到鼠标位置下不管第几层面积最小的组件，因为大组件可点击的地方多，这样能保证不管覆盖层级如何都能选择到所有的组件
      return (n1.clientWidth * n1.clientHeight) - (n2.clientWidth * n2.clientHeight)
    })
    // console.log(mousePointMinAreaWidgets)
    return mousePointMinAreaWidgets[0]
  }

  /**
   * 点击某个小组件
   * */
  public mousedown(el: HTMLElement, ev: MouseEvent) {
    if (editorStore.isSeparating) return
    let minAreaWidget = this.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)
    let activeElement /* 最终要活跃的组件变量名 */ = minAreaWidget
    this.currentElement = minAreaWidget // 必须颗粒化精确到内部组件
    const widgetsInfo = parseWidgetsInfo4DomChain(activeElement, true)
    if (!widgetsInfo || !widgetsInfo.rootWidgetElement) return this.currentGroupElement = null
    this.currentGroupElement = widgetsInfo.isGroup ? widgetsInfo.rootWidgetElement : null
    if (ev.buttons !== 1) return  // 只有单击左键才响应
    /*---------------------------------默认状态------------------------------------------*/
    if (widgetsInfo.isGroup) activeElement = widgetsInfo.rootWidgetElement      // 默认: 如果点击的是组，则让组进行活跃，用于支持整个组即时移动,如果不是，下面处理
    this.moveable.setState({  // 先定义状态，最终状态由鼠标抬起后决定( mouseup, click )
      draggable: true,
      rotatable: false,
      renderDirections: [],
    })
    /*-----------------------------在组内且不允许组内移动----------------------------------*/
    if (inGroup(activeElement) && !editorStore.allowInGroupMovement) {
      this.moveable.setState({draggable: false})
    }
    if (editorStore.allowInGroupMovement) {   // 如果允许组内移动,则聚焦小组件且设置服务器传回的操控配置
      activeElement = minAreaWidget
      this.setWidgetState(minAreaWidget)
      this.moveable.setState({    // 本应该让所有的组件以服务器为准，这里默认宣布允许组内拖动
        draggable: true,
      })
    }
    if (editorStore.isSeparating) {  // 如果正在分离中，拖动时不能拖动内部，直接将活跃的movable目标定义成其所在组
      activeElement = widgetsInfo.rootWidgetElement
    }

    // console.log(activeElement)
    Object.defineProperties(ev, {
      target: {
        get: () => activeElement
      }
    })
    if (ev.buttons === 1) {
      this.active(activeElement)
      this.moveable.dragStart(ev)
    }
  }

  public mouseup(el: HTMLElement, ev: MouseEvent) {
    if (editorStore.selectoManager.selected.length) return
    // console.log('draggable', this.moveable.draggable, 'rotatable', this.moveable.rotatable, 'resizable', this.moveable.resizable);
    const widgetsEl = parseWidget4DomChain(el)
    const inOuterByGroup = widgetsEl && !inGroup(widgetsEl) && !editorStore.allowInGroupMovement  // 是否是在最外层的合并组,鼠标只要抬起就为组件或者合并组的外框加上操控按钮和框选线
    if (inOuterByGroup || editorStore.allowInGroupMovement) {
      this.moveable.setState({
        draggable: true,
        hideDefaultLines: false,
        renderDirections: MOVEABLE_ALL_DIRECTION
      })
    }
    this.moveable.setState({  // TODO 暂时都允许所有调整，后面根据后端指定操控方式加载
      draggable: true,
      resizable: true,
      rotatable: true,
    })
  }

  /**
   * 聚焦某个小组件
   * */
  public click(el: HTMLElement, ev: MouseEvent) {
    if (isMoveableControl(el)) return
    const widgetsEl = parseWidget4DomChain(el)
    let activeElement = this.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)  // 获得抬起时的鼠标点下面积最小的组件并进行活跃
    const widgetsInfo = parseWidgetsInfo4DomChain(activeElement, true)
    if (!widgetsInfo || !widgetsInfo.rootWidgetElement || !widgetsEl) return
    if (widgetsInfo.isGroup) {   // 处理合并组
      activeElement = widgetsInfo.rootWidgetElement   // 如果是组且禁止组内移动，则活跃整个组，其他地方会通过classList框选点击到那一个的小组件
      if (editorStore.allowInGroupMovement || !inGroup(widgetsInfo.rootWidgetElement)) {   // 如果组不在另一个组内(嵌套组)，表示当前组在最外层，则允许直接进行活跃可调整
        this.moveable.setState({
          hideDefaultLines: true,
          rotatable: true,
          renderDirections: MOVEABLE_ALL_DIRECTION
        })
      } else {
        this.moveable.setState({
          hideDefaultLines: true,
          rotatable: false,
          renderDirections: []
        })
      }
    } else {   // 处理点击到纯组件
      this.setWidgetState(widgetsEl)  // 如果是组件，则直接应用组件服务器传来的操控配置，比如 draggable, rotatable
    }
    this.activeWidgets(activeElement)
  }

  /**
   * 失活
   * */
  public deActive() {
    this.currentElement = void 0
    this.moveable.target = []
    this.currentGroupElement = null
  }
}
