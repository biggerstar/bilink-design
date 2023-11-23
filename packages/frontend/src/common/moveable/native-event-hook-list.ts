import {getElement4EventTarget} from "@/utils/tool";
import {throttle} from "lodash-es";
import {setDirection} from "@/common/method/set-direction";
import {isWidget, parseWidget4DomChain} from "@/utils/method";
import {editorStore} from "@/store/editor";
import {
  WIDGET_GROUP_SELECTION_SELECTOR,
  WIDGET_SELECTION_SELECTOR,
  WIDGET_SELECTION_SELECTOR_KEEP,
  WIDGET_SELECTOR
} from "@/constant";

/**
 * 自动更新当前的框选框
 * @param ev  鼠标位置下触发的ev
 * */
function updateSelection(ev: MouseEvent) {
  const moveableManager = editorStore.moveableManager
  const activeElement = moveableManager.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)
  // console.log('activeElement', activeElement)
  /*------------------------------移除当前所有框选--------------------------------------------*/
  const elements = editorStore.editorAreaBoxTarget.querySelectorAll(WIDGET_SELECTOR)
  elements.forEach(element => {
    element.classList.remove(WIDGET_GROUP_SELECTION_SELECTOR, WIDGET_SELECTION_SELECTOR, WIDGET_SELECTION_SELECTOR_KEEP)
  })
  // console.log(moveableManager.currentGroupElement,moveableManager.currentWidget,activeElement)
  /*-------------------------重新为三种不同目标(group，小组件, hover)添加框选------------------------------*/
  if (moveableManager.currentGroupElement) moveableManager.currentGroupElement.classList.add(WIDGET_GROUP_SELECTION_SELECTOR)
  if (moveableManager.currentWidget) moveableManager.currentWidget.classList.add(WIDGET_SELECTION_SELECTOR_KEEP)
  if (ev.buttons === 0 && activeElement) activeElement.classList.add(WIDGET_SELECTION_SELECTOR_KEEP)
}

export default function createNativeEventHookList() {
  return [
    {
      name: 'mousedown',
      call: (ev: MouseEvent) => {
        const moveableManager = editorStore.moveableManager
        const downEl = getElement4EventTarget(ev)
        setDirection(<any>moveableManager.moveable, downEl)
        const widgetsEl = parseWidget4DomChain(downEl)
        if (!widgetsEl) {
          editorStore.removeSeparatingBorder()
          moveableManager.moveable.target = []
        }
        moveableManager.mousedown(downEl, ev)
        moveableManager.moveable.dragStart(ev)
        updateSelection(ev)
      },
      options: {
        capture: true,
        // passive: true,
      }
    },
    {
      name: 'mousemove',
      call: throttle((ev: MouseEvent) => {
        const overEl = getElement4EventTarget(ev)
        if (!overEl) return;
        // const moveableManager = editorStore.moveableManager
        // if (ev.buttons !== 0) moveableManager.mousemove(overEl)
        updateSelection(ev)
      }, 260),
    },
    {
      name: 'mouseup',
      call: (ev: MouseEvent) => {
        const upEl = getElement4EventTarget(ev)
        if (!upEl) return
        const widgetsEl = parseWidget4DomChain(upEl)
        const moveableManager = editorStore.moveableManager
        if (widgetsEl) {
          moveableManager.mouseup(upEl)
        } else if (!widgetsEl) {
          if (upEl.classList.contains('moveable-control')) return   // 如果点击的是 moveable 调整控制按钮则直接返回不会进行失活
          moveableManager.deActive()
        }
      },
      options: {
        capture: true,
      }
    },
    {
      name: 'click',
      call: (ev: MouseEvent) => {
        const clickEl = getElement4EventTarget(ev)
        if (!clickEl) return
        const widgets: HTMLElement[] = <any>Array.from(document.elementsFromPoint(ev.pageX, ev.pageY).filter(isWidget))
        const widgetsEl = widgets.length ? widgets[widgets.length - 1] : parseWidget4DomChain(clickEl)
        const moveableManager = editorStore.moveableManager
        updateSelection(ev)
        if (widgetsEl) {
          editorStore.moveableManager.setWidgetState(widgetsEl, {
            draggable: true
          })
          editorStore.moveableManager.activeWidgets(widgetsEl)
          moveableManager.click(clickEl, ev)
        }
      },
      options: true
    },
    {
      name: 'scroll',
      call: () => editorStore.moveableManager.moveable.updateRect(),
      options: true
    },
  ]
}
