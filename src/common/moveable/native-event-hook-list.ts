import {getElement4EventTarget} from "@/utils/tool";
import {throttle} from "lodash-es";
import {setDirection} from "@/common/method/set-direction";
import {globalStore} from "@/store/global";
import {parseWidget4DomChain} from "@/utils/method";

export default function createNativeEventHookList() {
  return [
    {
      name: 'mousedown',
      call: (ev: MouseEvent) => {
        const downEl = getElement4EventTarget(ev)
        if (!downEl) return
        const widgetsEl = parseWidget4DomChain(downEl)
        const moveableManager = globalStore.moveableManager
        // console.log(widgetsEl)
        if (widgetsEl) moveableManager.focus(downEl)
        else {
          if (downEl.classList.contains('moveable-control')) return   // 如果点击的是 moveable 调整控制按钮则直接返回不会进行失活
          moveableManager.deActive()
        }
      },
      options: {
        capture: true
      }
    },
    {
      name: 'mousemove',
      call: throttle((ev: MouseEvent) => {
        const overEl = getElement4EventTarget(ev)
        if (!overEl || ev.buttons !== 0 /*  鼠标未按下才自动跳框 */) return
        globalStore.moveableManager.over(overEl)
        setDirection(<any>globalStore.moveableManager.moveable, overEl)
      }, 80),
      options: true
    },
  ]
}
