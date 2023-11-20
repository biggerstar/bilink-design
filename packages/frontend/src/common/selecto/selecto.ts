import Moveable, {getElementInfo} from "moveable";
import Selecto, {OnDragStart, OnSelect, SelectoOptions} from 'selecto'
import {editorStore} from "@/store/editor";
import {MOVEABLE_SCALE_DIRECTION, WIDGET_SELECTOR} from "@/constant";
import {parseWidget4DomChain} from "@/utils/method";

export const defaultSelectOptions = {
  getElementRect: getElementInfo,
  rootContainer: null,
  // 要选择的目标。您可以注册查询选择器或元素
  selectableTargets: [WIDGET_SELECTOR],
  // 是否通过单击进行选择
  selectByClick: true,
  // 是否允许从内部进行选择
  selectFromInside: false,
  // 是否允许多次选择
  continueSelect: false,
  // 按下键, 和下次按下选择.
  toggleContinueSelect: "shift",
  // 目标与要选择的拖动区域重叠的速率。(默认:100)
  hitRate: 5,
}

export class SelectoManager {
  public selecto: Selecto
  public container: HTMLElement | string | null | void
  private __running: boolean
  public selected: Array<HTMLElement | SVGElement> = []

  public get moveable(): Moveable {
    return editorStore.moveableManager.moveable
  }

  public mount(container: HTMLElement | string | null | void, selectOptions: Partial<SelectoOptions> = {}) {
    if (this.__running) return
    this.__running = true
    if (typeof container === 'string') container = document.querySelector<HTMLElement>(container)
    if (!container) container = document.body
    this.container = container
    selectOptions.container = container
    selectOptions.keyContainer = container

    const selecto = new Selecto(selectOptions)
    this.selecto = selecto
    // console.log(selecto)
    // console.log(container);
    selecto.on('dragStart', (ev: OnDragStart) => {
      const widgetEl = parseWidget4DomChain(ev.inputEvent?.target || ev.inputEvent?.srcElement)
      if (widgetEl) ev.stop()   // 如果点击组件则不进行选择
    })
    selecto.on('select', (ev: OnSelect) => {
      if (ev.added.length) this.selected = [...new Set(this.selected.concat(ev.added))]
      if (ev.removed.length) this.selected = this.selected.filter(item => !ev.removed.includes(item))
      this.moveable.setState({
        hideDefaultLines: true,
        target: this.selected,
        renderDirections: [],
        rotatable: false
      })
    })
      .on('selectEnd', () => {
        if (this.selected.length <= 1) return this.selected = []   // 如果未选择或者只选择一个忽略
        this.moveable.setState({   // 如果选择了多个，则显示组外框和四个scale角及旋转按钮
          hideDefaultLines: false,
          renderDirections: MOVEABLE_SCALE_DIRECTION,
          rotatable: true
        })
      })
  }

  public destroy() {
    this.selecto && this.selecto.destroy()
  }
}



