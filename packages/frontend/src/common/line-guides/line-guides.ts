import Guides, {GuidesOptions} from "@scena/guides";
import {editorStore} from "@/store/editor";

type NewGuidesOptions = Partial<GuidesOptions> & { style: CSSStyleDeclaration }


export class LineGuides {
  public guidesTop: NewGuidesOptions & Guides
  public guidesLeft: NewGuidesOptions & Guides
  public resizeObserver: ResizeObserver | null = null
  public observerTarget: HTMLElement | null

  public lineWeightTop = 20
  public lineWeightLeft = 20

  public __running: boolean

  public mount(container: string | HTMLElement | null | void, options: { top?: NewGuidesOptions, left?: NewGuidesOptions } = {}) {
    if (this.__running) return
    this.__running = true
    if (typeof container === 'string') container = document.querySelector<HTMLElement>(container)
    if (!container) container = document.body

    const baseConfig = <NewGuidesOptions>{
      backgroundColor: '#f9f9fa',
      lineColor: '#bec2c7',
      textColor: '#999999',
      displayDragPos: true,
      segment: 1,
      textAlign: 'center',
      direction: 'end',
      longLineSize: 2,
      // lineOffset: 1,
      mainLineSize: 6,
      // longLineSize: 0,
    }

    const guidesTop = new Guides(<any>container, <NewGuidesOptions>{
      ...baseConfig,
      type: "horizontal",
      textOffset: [0, 10],
      style: {
        position: 'absolute',
        left: '0',
        top: '0',
        height: `${this.lineWeightTop}px`,
        zIndex: 300
      },
      ...options.top
    }).on("changeGuides", e => {
    })

    const guidesLeft = new Guides(<any>container, <NewGuidesOptions>{
      ...baseConfig,
      type: "vertical",
      textOffset: [10, 0],
      style: {
        position: 'absolute',
        left: '0',
        top: '0',
        width: `${this.lineWeightLeft}px`,
        zIndex: 300
      },
      ...options.top
    }).on("changeGuides", e => {

    })
    this.guidesLeft = <any>guidesLeft
    this.guidesTop = <any>guidesTop

    this.updateGuidesStyle()
    const el = editorStore.editorAreaBoxTarget
    if (!el) return console.error('未找到监听对象')
    this.observerTarget = el
    this.resizeObserver = new ResizeObserver(() => Promise.resolve(() => this.updateGuidesStyle()))
    this.resizeObserver.observe(el)
  }

  public updateGuidesStyle() {
    const el = this.observerTarget
    if (!el) return
    const {width, height} = el.getBoundingClientRect()
    const {offsetLeft, offsetTop} = el
    const {guidesTop, guidesLeft} = this
    if (guidesTop && guidesLeft) {
      const scale = editorStore.getCurScaleValue()
      guidesTop.unit = Math.max(1, Math.floor(1 / scale)) * 50
      guidesLeft.unit = Math.max(1, Math.floor(1 / scale)) * 50
      guidesTop.range = [0, width / scale]
      guidesLeft.range = [0, height / scale]
      guidesTop.zoom = scale
      guidesLeft.zoom = scale

      setTimeout(() => {
        // 这里必须延时, 因为 @scena/guides 库存在bug, 获取 el rect 同一个事件队列中进行 guidesXXX.scroll() 时会爆内存
        guidesTop.scroll(-offsetLeft / scale)
        guidesLeft.scroll(-offsetTop / scale)
        guidesTop.scrollGuides(-(offsetTop - this.lineWeightTop) / scale)
        guidesLeft.scrollGuides(-(offsetLeft - this.lineWeightLeft) / scale)
        guidesTop.forceUpdate()
        guidesLeft.forceUpdate()
      })
    }
  }

  /**  销毁标尺线  */
  public destroy() {
    this.resizeObserver && this.resizeObserver.disconnect()
    this.guidesTop && this.guidesTop.destroy()
    this.guidesLeft && this.guidesLeft.destroy()
    this.guidesTop = void 0
    this.guidesLeft = void 0
    this.resizeObserver = null
  }
}
