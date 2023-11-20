import Moveable, {
  MoveableOptions,
  OnDrag,
  OnDragEnd,
  OnResize,
  OnResizeEnd,
  OnRotate,
  OnRotateEnd,
  OnScale,
  OnScaleEnd
} from "moveable";
import createNativeEventHookList from "@/common/moveable/native-event-hook-list";
import {CssTransformApi, getWidgetsName, isWidgets, parseWidget4DomChain, toFixed} from "@/utils/method";
import {editorStore} from "@/store/editor";
import './moveable-style.css'
import {
  DESIGN_OPTIONS,
  LINE_GUIDE_HORIZONTAL_SELECTOR,
  LINE_GUIDE_VERTICAL_SELECTOR,
  MOVEABLE_ALL_DIRECTION,
  WIDGET_DATASET_NAME,
  WIDGET_SELECTOR,
  WIDGETS_NAMES
} from "@/constant";
import {LayoutWidget} from "@type/layout";

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
  snappable: true,
  rotationPosition: 'bottom',
  elementGuidelines: [WIDGET_SELECTOR, LINE_GUIDE_HORIZONTAL_SELECTOR, LINE_GUIDE_VERTICAL_SELECTOR],
  snapGridWidth: 10,
  snapGridHeight: 10,
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
  public overElement: HTMLElement | void   //  当前鼠标指针停留位置的元素
  public resizeObserver: ResizeObserver | null

  public get currentWidget(): HTMLElement | void {   // 获取当前活跃的组件
    return parseWidget4DomChain(<any>this.currentElement || this.overElement)
  }

  public get overWidgets(): HTMLElement | void {   // 获取当前鼠标位置下的组件
    return parseWidget4DomChain(<any>this.overElement)
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
    this.moveable = moveable

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
      .on('dragGroup', () => {
        console.log(222222222222222222)
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
    const target = elList.filter((el: HTMLElement) => el && isWidgets(el))
    if (target.length) {
      this.moveable.target = target
      this.moveable.forceUpdate()
    }
  }

  /**
   * 让dom链上的最近的小组件活跃
   * */
  public activeWidgets(element: HTMLElement | SVGElement, opt: Partial<MoveableOptions> = {}): {
    name: string,
    el: HTMLElement
  } | void {
    const widgetsEl = parseWidget4DomChain(<any>element)
    if (!widgetsEl) return
    const widgetsName = getWidgetsName(widgetsEl)
    if (!widgetsName) return
    const widgetConfig: LayoutWidget = widgetsEl[DESIGN_OPTIONS] || {}
    const options: Partial<MoveableOptions> = {}
    if (widgetConfig.hasOwnProperty('dragable')) options.draggable = widgetConfig.dragable
    if (widgetConfig.hasOwnProperty('rotatable')) options.rotatable = widgetConfig.rotatable
    this.moveable.setState({
      draggable: true,
      hideDefaultLines: false,
      ...options,
      ...opt,
    })
    this.active(widgetsEl)
    return {
      name: widgetsName,
      el: widgetsEl
    }
  }

  /**
   * 鼠标指正在经过某个小组件
   * */
  public drag(el: HTMLElement) {
    if (this.currentElement === el) return
    const w_group_el = parseWidget4DomChain(el, (target) => target.dataset[WIDGET_DATASET_NAME] === WIDGETS_NAMES.W_GROUP)
    if (!w_group_el) return
    const els = Array.from(el.querySelectorAll(WIDGET_SELECTOR))
    if (!els.length) return

    // console.log(els)

    this.moveable.setState({
      targetGroups: els
    })

    // this.activeWidgets(w_group_el, {
    //   renderDirections: [],
    //   rotatable: false
    // })
  }

  /**
   * 聚焦某个小组件
   * */
  public mousedown(el: HTMLElement) {
    if (el === this.currentElement) return
    const w_group_el = parseWidget4DomChain(el, (target) => target.dataset[WIDGET_DATASET_NAME] === WIDGETS_NAMES.W_GROUP)
    if (!w_group_el) return
    this.currentGroupElement = w_group_el

    this.activeWidgets(w_group_el, {
      renderDirections: [],
      rotatable: false
    })
  }

  /**
   * 聚焦某个小组件
   * */
  public mouseup(el: HTMLElement) {
    this.activeWidgets(el, {
      renderDirections: MOVEABLE_ALL_DIRECTION
    })
    this.currentElement = el
  }

  /**
   * 失活
   * */
  public deActive() {
    this.currentElement = void 0
    this.overElement = void 0
    this.moveable.target = []
    this.resizeObserver && this.resizeObserver.disconnect()
    this.resizeObserver = null
    this.currentGroupElement = null
  }
}

