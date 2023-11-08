import Moveable, {MoveableOptions, OnDrag, OnResize, OnRotate, OnScale} from "moveable";
import {getElement4EventTarget} from "@/utils/tool";
import createNativeEventHookList from "@/common/moveable/native-event-hook-list";
import defaultConfig from "@/common/moveable/default-config";

export const defaultMoveableOptions: MoveableOptions = {
  zoom: 0.8,
  throttleDrag: 0,
  throttleResize: 0,
  throttleScale: 0,
  throttleRotate: 0,
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
  public activeElement: HTMLElement | null | void
  private __running: boolean
  public eventHookList: Array<any>

  constructor() {
    this.eventHookList = createNativeEventHookList(this)
  }

  public isWidgets(el: HTMLElement) {
    return el.dataset['type'] === 'widgets'
  }

  public getWidgetsName(el: HTMLElement) {
    if (el && this.isWidgets(el)) {
      return el.dataset['name']
    }
  }


  /**
   * 开始工作
   * */
  public start(moveableOptions: MoveableOptions = {}, container: HTMLElement | null) {
    if (this.__running) return
    this.__running = true
    if (!container) container = document.body
    this.container = container
    const moveable = new Moveable(container, moveableOptions);
    this.moveable = moveable
    moveable
      .on("drag", (ev: OnDrag) => {
        ev.target.style.transform = ev.transform;
      })
      .on("resize", (ev: OnResize) => {
        ev.target.style.width = `${ev.width}px`;
        ev.target.style.height = `${ev.height}px`;
      })
      .on("scale", (ev: OnScale) => {
        // console.log(ev);
        ev.target.style.transform = ev.drag.transform;
      })
      .on("rotate", (ev: OnRotate) => {
        // console.log(ev);
        ev.target.style.transform = ev.drag.transform;
      })

    ;const eventHookList = this.eventHookList
    eventHookList.forEach((item) => {
      const options = item['options']
      container && container.addEventListener(item.name, item.call, options === void 0 ? {} : options)
    })
  }

  /**
   * 停止工作
   * */
  public stop() {
    this.moveable.destroy()
    this.eventHookList.forEach((item) => {
      this.container && this.container.removeEventListener(item.name, item.call)
    })
  }

  /**
   * 让某些元素活跃,并将其设置默认组件配置
   * */
  public active(elements: HTMLElement | SVGElement | HTMLElement[] | SVGElement[]) {
    if (!elements) return
    const elList = !Array.isArray(elements) ? [elements] : elements
    // if (this.activeElement) elList.push(this.activeElement)
    const target = elList.filter((el: HTMLElement) => el && this.isWidgets(el))
    target.forEach((el: any) => {
      const widgetsName = this.getWidgetsName(el)
      if (!widgetsName) return
      if (widgetsName) {
        const widgetsConfig = defaultConfig[widgetsName]
        this.moveable.setState(widgetsConfig)
      }
    })
    if (target.length) this.moveable.target = target
  }

  public deActive() {
    this.activeElement = null
    this.moveable.target = []
  }

  /**
   * 让事件中的发起目标元素活跃
   * */
  public active4EventTarget(ev: Event) {
    const elTarget = getElement4EventTarget(ev)
    if (elTarget) this.active(elTarget)
  }
}

