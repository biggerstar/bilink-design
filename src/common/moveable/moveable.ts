import Moveable, {MoveableOptions, OnDrag, OnResize, OnRotate, OnScale} from "moveable";
import createNativeEventHookList from "@/common/moveable/native-event-hook-list";
import defaultConfig from "@/common/moveable/default-config";
import {getWidgetsName, isWidgets, parseWidget4DomChain, toFixed} from "@/utils/method";
import {useEditorStore} from "@/store/editor";
import './moveable-style.css'

const editorStore = useEditorStore()

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
  elementGuidelines: ['div[data-type="widgets"]'],
  snapGridWidth: 6,
  snapGridHeight: 6,
  // draggable: true,
  // clippable: false,
  // resizable: true,
  // scalable: false,
  // // keepRatio: true,
  // rotatable: true,
  // renderDirections: ["n", "nw", "ne", "s", "se", "sw", "e", "w"],
}


export class MoveableManager {
  public moveable: Moveable
  public container: HTMLElement
  public currentElement: HTMLElement | void   // 当前聚焦的元素
  public overElement: HTMLElement | void   //  当前鼠标指针停留位置的元素

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
  public start(moveableOptions: MoveableOptions = {}, container: HTMLElement | null | void) {
    if (this.__running) return
    this.__running = true
    if (!container) container = document.body
    this.container = container
    const moveable = new Moveable(container, moveableOptions);
    this.moveable = moveable

    moveable
      .on("drag", (ev: OnDrag) => {
        editorStore.updateActiveWidgetsState({
          left: toFixed(ev.left, 3),
          top: toFixed(ev.top, 3),
        }, {effectDom: true})
      })
      .on("resize", (ev: OnResize) => {
        // ev.target.style.transform = ev.transform
        // ev.target.style.width = `${ev.width}px`;
        // ev.target.style.height = `${ev.height}px`;
        editorStore.updateActiveWidgetsState({
          width: toFixed(ev.width, 3),
          height: toFixed(ev.height, 3),
          // left: toFixed(ev.drag.left, 3),
          // top: toFixed(ev.drag.top, 3),
        }, {effectDom: true})
      })
      .on("scale", (ev: OnScale) => {
        const scale = ev.scale[0] || ev.scale[1]
        editorStore.updateActiveWidgetsState({
          scale: toFixed(scale, 3),
        }, {effectDom: true})
      })
      .on("rotate", (ev: OnRotate) => {
        editorStore.updateActiveWidgetsState({
          rotate: toFixed(ev.rotation, 3),
        }, {effectDom: true})
      })

    ;const eventHookList = this.eventHookList
    eventHookList.forEach((item) => {
      const options = item['options']
      container && container.addEventListener(item.name, item.call, options === void 0 ? {} : options)
    })
  }

  /**
   * 停止 moveable 工作
   * */
  public stop() {
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
    target.forEach((el: any) => {
      const widgetsName = getWidgetsName(el)
      if (!widgetsName) return
      if (widgetsName) {
        const widgetsConfig = defaultConfig[widgetsName]
        this.moveable.setState(widgetsConfig)
      }
    })
    if (target.length) this.moveable.target = target
  }

  /**
   * 让dom链上的最近的小组件活跃
   * */
  public activeWidgets(elements: HTMLElement | SVGElement): {
    name: string,
    el: HTMLElement
  } | void {
    const widgetsEl = parseWidget4DomChain(<any>elements)
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
   * 鼠标指正在经过某个小组件
   * */
  public over(el: HTMLElement) {
    this.overElement = el
  }

  /**
   * 聚焦某个小组件
   * */
  public focus(el: HTMLElement) {
    this.activeWidgets(el)
    this.moveable.forceUpdate()
    this.currentElement = el
  }

  /**
   * 失活
   * */
  public deActive() {
    this.currentElement = void 0
    this.overElement = void 0
    this.moveable.target = []
  }
}

