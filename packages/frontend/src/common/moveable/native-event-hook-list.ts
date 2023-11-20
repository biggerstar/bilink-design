import {getElement4EventTarget} from "@/utils/tool";
import {throttle} from "lodash-es";
import {setDirection} from "@/common/method/set-direction";
import {parseWidget4DomChain, parseWidgetsInfo4DomChain} from "@/utils/method";
import {editorStore} from "@/store/editor";
import {WIDGET_GROUP_SELECTION_SELECTOR, WIDGET_SELECTION_SELECTOR, WIDGET_SELECTOR} from "@/constant";

export default function createNativeEventHookList() {
  return [
    {
      name: 'mousedown',
      call: (ev: MouseEvent) => {
        const downEl = getElement4EventTarget(ev)
        if (!downEl) return
        const widgetsEl = parseWidget4DomChain(downEl)
        const moveableManager = editorStore.moveableManager
        if (widgetsEl) moveableManager.mousedown(downEl)
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
        const moveableManager = editorStore.moveableManager
        if (ev.buttons !== 0) {
          // moveableManager.drag(overEl)
          setDirection(<any>moveableManager.moveable, overEl)  /*  鼠标未按下才自动跳框 */
        }
        moveableManager.mousemove(overEl)
        const targetInfo = parseWidgetsInfo4DomChain(overEl)
        if (
          targetInfo.rootWidgetElement
          && (!targetInfo.isGroup || targetInfo.isGroup && targetInfo.rootWidgetElement !== moveableManager.currentGroupElement)
        ) {
          targetInfo.rootWidgetElement.classList.add(WIDGET_SELECTION_SELECTOR)
        }
      }, 80),
      options: true
    },
    {
      name: 'mouseup',
      call: (ev: MouseEvent) => {
        const upEl = getElement4EventTarget(ev)
        if (!upEl) return
        const widgetsEl = parseWidget4DomChain(upEl)
        const moveableManager = editorStore.moveableManager
        if (widgetsEl) moveableManager.mouseup(upEl)
        else {
          if (upEl.classList.contains('moveable-control')) return   // 如果点击的是 moveable 调整控制按钮则直接返回不会进行失活
          moveableManager.deActive()
        }

        const elements = editorStore.editorAreaBoxTarget.querySelectorAll(WIDGET_SELECTOR)
        elements.forEach(element => {
          element.classList.remove(WIDGET_GROUP_SELECTION_SELECTOR, WIDGET_SELECTION_SELECTOR)
        })
        const targetInfo = parseWidgetsInfo4DomChain(upEl)
        if (targetInfo.rootWidgetElement) {
          if (targetInfo.isGroup) {
            targetInfo.rootWidgetElement.classList.add(WIDGET_GROUP_SELECTION_SELECTOR)
          } else {
            targetInfo.rootWidgetElement.classList.add(WIDGET_SELECTION_SELECTOR)
          }
        }
      },
      options: {
        capture: true,
      }
    },
    {
      name: 'scroll',
      call: () => editorStore.moveableManager.moveable.updateRect(),
      options: true
    },
  ]
}
