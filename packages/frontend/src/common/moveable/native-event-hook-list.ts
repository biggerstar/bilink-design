import {getElement4EventTarget} from "@/utils/tool";
import {throttle} from "lodash-es";
import {isMoveableControl, isWidget, parseWidget4DomChain} from "@/utils/method";
import {editorStore} from "@/store/editor";
import {WIDGET_GROUP_SELECTION_SELECTOR, WIDGET_SELECTION_SELECTOR_KEEP} from "@/constant";

/**
 * 自动更新当前的框选框
 * @param ev  鼠标位置下触发的ev
 * */
function updateSelection(ev: MouseEvent) {
  const moveableManager = editorStore.moveableManager
  const activeElement = moveableManager.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)
  // console.log('activeElement', activeElement)
  /*------------------------------移除当前所有框选--------------------------------------------*/
  const elements = editorStore.getAllWidget()
  elements.forEach(element => element.classList.remove(WIDGET_GROUP_SELECTION_SELECTOR, WIDGET_SELECTION_SELECTOR_KEEP))
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
      call: (ev: MouseEvent) => {  // moveable 主程
        editorStore.moveableManager.mousedown(ev)
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
        updateSelection(ev)
      }, 160),
    },
    {
      name: 'mouseup',
      call: (ev: MouseEvent) => {
        const upEl = getElement4EventTarget(ev)
        if (!upEl) return
        const moveableManager = editorStore.moveableManager
        const activeElement = moveableManager.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)
        if (activeElement) moveableManager.mouseup(upEl, ev)
        else if (!activeElement) {
          if (!isMoveableControl(upEl)) moveableManager.deActive()   // 如果无点击到组件不是点击的是 moveable 调整控制按钮则进行失活
        }
        // console.log(moveableManager.currentGroupElement, moveableManager.currentWidget)
        updateSelection(ev)
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
        if (widgetsEl) {
          editorStore.moveableManager.setWidgetState(widgetsEl, {draggable: true})
          moveableManager.click(clickEl, ev)
        }
        updateSelection(ev)
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
