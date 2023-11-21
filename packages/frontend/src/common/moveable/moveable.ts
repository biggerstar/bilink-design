import Moveable, {
  MoveableOptions,
  OnDrag,
  OnDragEnd,
  OnResize,
  OnResizeEnd,
  OnRotate,
  OnRotateEnd,
  OnScale,
  OnScaleEnd,
} from "moveable";
import createNativeEventHookList from "@/common/moveable/native-event-hook-list";
import {
  CssTransformApi,
  getWidgetsName,
  inGroup,
  isWidget,
  parseWidget4DomChain,
  parseWidgetsInfo4DomChain,
  toFixed
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
  public groupMoveable: Moveable   // 只用于框选组
  public container: HTMLElement
  public currentElement: HTMLElement | void   // 当前聚焦的元素
  public currentGroupElement: HTMLElement | void   // 当前聚焦的元素
  public resizeObserver: ResizeObserver | null
  public __temp__: Record<any, any> = {}

  public get currentWidget(): HTMLElement | void {   // 获取当前活跃的组件
    return parseWidget4DomChain(<any>this.currentElement)
  }

  private __running: boolean
  public eventHookList: Array<any>

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
    const GroupMoveable = new Moveable(container, moveableOptions);
    this.moveable = moveable
    this.groupMoveable = GroupMoveable

    /** 将 transform 字符串转换成适合组件的配置的对象 */
    function parseTransform(transform: string) {
      const cssTransformApi = new CssTransformApi()
      cssTransformApi.load(transform)
      const styleObj = cssTransformApi.getAll()
      const transInfo = {}
      for (const name in styleObj) {
        if (['scale', 'rotate'].includes(name)) transInfo[name] = toFixed(styleObj[name][0], 3)
        else if (name === 'translate') transInfo['location'] = styleObj[name].map(val => toFixed(val, 3))
      }
      return transInfo
    }

    this.resizeObserver = new ResizeObserver(() => this.moveable.updateRect())
    this.resizeObserver.observe(container)

    function syncTransformConfig(transform: string) {
      transform && editorStore.updateActiveWidgetsState(parseTransform(transform), {effectDom: false})
    }

    moveable
      .on("drag", (ev: OnDrag) => ev.target.style.transform = ev.transform)
      .on("dragEnd", (ev: OnDragEnd) => syncTransformConfig(ev.lastEvent?.transform))
      .on("scale", (ev: OnScale) =>/* 缩放时 width, height 不会变 */   ev.target.style.transform = ev.drag.transform)
      .on("scaleEnd", (ev: OnScaleEnd) => syncTransformConfig(ev.lastEvent?.transform))
      .on("rotate", (ev: OnRotate) => ev.target.style.transform = ev.drag.transform)
      .on("rotateEnd", (ev: OnRotateEnd) => syncTransformConfig(ev.lastEvent?.transform))
      .on("resize", (ev: OnResize) => {
        ev.target.style.transform = ev.transform
        ev.target.style.width = `${ev.width}px`;
        ev.target.style.height = `${ev.height}px`;
      })
      .on("resizeEnd", (ev: OnResizeEnd) => {
        const lastEvent: OnResize = ev.lastEvent
        if (!lastEvent) return
        syncTransformConfig(lastEvent.transform)
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
   * 找到鼠标位置下不管第几层面积最小的组
   * */
  public getMinAreaWidgetForMousePoint(x: number, y: number): HTMLElement {
    const mousePointElements = <any>document.elementsFromPoint(x, y)
    const mousePointWidgets = mousePointElements.filter(isWidget)
    const mousePointMinAreaWidgets = mousePointWidgets.sort((n1: HTMLElement, n2: HTMLElement) => {
      // 找到鼠标位置下不管第几层面积最小的组件，因为大组件可点击的地方多，这样能保证不管覆盖层级如何都能选择到所有的组件
      return (n1.clientWidth * n1.clientHeight) - (n2.clientWidth * n2.clientHeight)
    })
    return mousePointMinAreaWidgets[0]
  }

  /**
   * 点击某个小组件
   * */
  public mousedown(el: HTMLElement, ev: MouseEvent) {
    const widgetsEl = parseWidget4DomChain(el)
    if (!widgetsEl) return
    let activeElement = this.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)
    const widgetsInfo = parseWidgetsInfo4DomChain(activeElement, true)
    if (!widgetsInfo.rootWidgetElement) return
    if (widgetsInfo.isGroup) activeElement = widgetsInfo.rootWidgetElement      // 如果点击的是组，则让组进行活跃，用于支持整个组即时移动
    this.currentGroupElement = widgetsInfo.isGroup ? widgetsInfo.rootWidgetElement : null
    /*---------------------------------默认状态------------------------------------------*/
    this.moveable.setState({  // 先定义状态，最终状态由鼠标抬起后决定( mouseup, click )
      draggable: true,
      resizable: false,
      scalable: false,
      rotatable: false,
      renderDirections: [],
    })
    /*-----------------------------在组内且不允许组内移动----------------------------------*/
    if (inGroup(activeElement) && !editorStore.allowInGroupMovement) {
      this.moveable.setState({
        draggable: false,
      })
    }
    if (editorStore.allowInGroupMovement) {   // 如果允许组内移动,则聚焦小组件且设置服务器传回的操控配置
      activeElement = widgetsEl
      this.setWidgetState(widgetsEl)
      this.moveable.setState({    // 本应该让所有的组件以服务器为准，这里默认宣布允许组内拖动
        draggable: true,
      })
    }

    // console.log(activeElement)
    Object.defineProperties(ev, {
      target: {
        get: () => activeElement
      }
    })
    this.active(activeElement)
    this.moveable.dragStart(ev)
  }

  public mouseup(el: HTMLElement) {
    const widgetsEl = parseWidget4DomChain(el)
    const inOuterByGroup = widgetsEl && !inGroup(widgetsEl) && !editorStore.allowInGroupMovement  // 是否是在最外层的合并组,鼠标只要抬起就为组件或者合并组的外框加上操控按钮和框选线
    if (inOuterByGroup || editorStore.allowInGroupMovement) {
      this.moveable.setState({
        draggable: true,
        hideDefaultLines: false,
        renderDirections: MOVEABLE_ALL_DIRECTION
      })
    }
  }

  /**
   * 聚焦某个小组件
   * */
  public click(el: HTMLElement, ev: MouseEvent) {
    const widgetsEl = parseWidget4DomChain(el)
    let activeElement = this.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)  // 获得抬起时的鼠标点下面积最小的组件并进行活跃
    const widgetsInfo = parseWidgetsInfo4DomChain(activeElement, true)
    if (!widgetsInfo.rootWidgetElement || !widgetsEl) return
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
    this.currentElement = activeElement
  }

  /**
   * 失活
   * */
  public deActive() {
    this.currentElement = void 0
    this.moveable.target = []
    this.resizeObserver && this.resizeObserver.disconnect()
    this.resizeObserver = null
    this.currentGroupElement = null
    this.groupMoveable.target = []
  }
}
